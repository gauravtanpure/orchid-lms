// /backend/src/services/dubbingService.js
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';

ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Languages (Marathi, Hindi, English)
const LANGS = [
  { code: 'mr', name: 'Marathi' },
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' },
];

function mkdtemp(prefix = 'dubbing-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

async function downloadToFile(url, dest) {
  const writer = fs.createWriteStream(dest);
  const resp = await axios.get(url, { responseType: 'stream', timeout: 10 * 60 * 1000 });
  await new Promise((res, rej) => {
    resp.data.pipe(writer);
    let err = null;
    writer.on('error', (e) => { err = e; rej(e); });
    writer.on('close', () => err ? rej(err) : res());
  });
  return dest;
}

async function uploadToCloudinary(localPath, folder = 'dubbed_videos') {
  // resource_type: 'video' for videos (this file is a video)
  const resp = await cloudinary.uploader.upload(localPath, {
    resource_type: 'video',
    folder,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });
  return resp.secure_url;
}

async function uploadAudioToCloudinary(localPath, folder = 'dubbed_audio') {
  // audio should be auto/raw so cloudinary treats it correctly
  const resp = await cloudinary.uploader.upload(localPath, {
    resource_type: 'auto',
    folder,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });
  return resp.secure_url || resp.url;
}

async function createSilence(durationSec, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`anullsrc=channel_layout=stereo:sample_rate=48000`)
      .inputOptions(['-f lavfi'])
      .outputOptions([`-t ${durationSec}`, '-c:a libmp3lame', '-q:a 2'])
      .save(outPath)
      .on('end', resolve)
      .on('error', reject);
  });
}

async function concatAudios(fileListPath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(fileListPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .save(outPath)
      .on('end', resolve)
      .on('error', reject);
  });
}

async function mergeAudioVideo(videoPath, audioPath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions(['-map 0:v:0', '-map 1:a:0', '-c:v copy', '-shortest'])
      .save(outPath)
      .on('end', resolve)
      .on('error', reject);
  });
}

async function transcribeVerbose(videoPath) {
  const resp = await openai.audio.transcriptions.create({
    file: fs.createReadStream(videoPath),
    model: 'whisper-1',
    response_format: 'verbose_json',
  });
  return resp;
}

function getVoiceForLang(lang) {
  try {
    if (process.env.OPENAI_VOICE_MAP) {
      const map = JSON.parse(process.env.OPENAI_VOICE_MAP);
      if (map && map[lang]) return map[lang];
    }
  } catch (e) {
    console.warn('[DUB] Invalid OPENAI_VOICE_MAP env, ignoring');
  }
  const defaults = { hi: 'alloy', mr: 'alloy', en: 'alloy' };
  return defaults[lang] || 'alloy';
}

async function translateTextSegment(text, targetName) {
  const prompt = `Translate the following text into ${targetName}. Keep punctuation and be concise:\n\n${text}`;
  const r = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: prompt,
    max_output_tokens: 2000,
  });
  if (r.output_text) return r.output_text;
  if (Array.isArray(r.output)) {
    return r.output.map(o => {
      if (typeof o.content === 'string') return o.content;
      if (Array.isArray(o.content)) return o.content.map(c => c.text || '').join('');
      return '';
    }).join(' ');
  }
  return '';
}

async function generateTTSSegment(text, outPath, lang = 'en') {
  const voice = getVoiceForLang(lang);
  const resp = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice,
    input: text,
  });
  const buffer = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

/**
 * generateDubbedVideos(originalVideoUrl, progressCb)
 * progressCb(percent:number, message?:string)
 * returns: [{ code, name, url }]
 */
export async function generateDubbedVideos(originalVideoUrl, progressCb = () => {}) {
  const workdir = mkdtemp();
  try {
    progressCb(2, 'Preparing workspace');
    const urlObj = new URL(originalVideoUrl);
    const ext = path.extname(urlObj.pathname) || '.mp4';
    const localVideo = path.join(workdir, `original${ext}`);
    await downloadToFile(originalVideoUrl, localVideo);
    progressCb(8, 'Downloaded original video');

    const transResp = await transcribeVerbose(localVideo);
    const segments = (transResp && transResp.segments) || [];
    progressCb(15, `Transcribed ${segments.length} segments`);

    const results = [];

    for (let li = 0; li < LANGS.length; li++) {
      const lang = LANGS[li];
      progressCb(15 + Math.round((li / LANGS.length) * 5), `Start ${lang.name}`);

      const langDir = path.join(workdir, `lang-${lang.code}`);
      fs.mkdirSync(langDir, { recursive: true });

      const concatList = [];
      let currentTime = 0.0;

      if (!segments.length) {
        const fullText = transResp.text || '';
        const translated = await translateTextSegment(fullText, lang.name);
        const ttsFile = path.join(langDir, `tts_full.mp3`);
        await generateTTSSegment(translated, ttsFile, lang.code);
        concatList.push(ttsFile);
      } else {
        for (let si = 0; si < segments.length; si++) {
          const seg = segments[si];
          const segStart = Number(seg.start || 0);
          const segEnd = Number(seg.end || (segStart + (seg.duration || 0)));
          const segText = (seg.text || '').trim();

          const gap = Math.max(0, segStart - currentTime);
          if (gap > 0.02) {
            const silenceFile = path.join(langDir, `sil_${si}.mp3`);
            await createSilence(gap, silenceFile);
            concatList.push(silenceFile);
          }

          if (segText.length > 0) {
            const translated = await translateTextSegment(segText, lang.name);
            const ttsPath = path.join(langDir, `tts_${si}.mp3`);
            await generateTTSSegment(translated, ttsPath, lang.code);
            concatList.push(ttsPath);
          } else {
            const tiny = path.join(langDir, `tiny_${si}.mp3`);
            await createSilence(0.05, tiny);
            concatList.push(tiny);
          }

          currentTime = Math.max(currentTime, segEnd);
          const pct = 15 + Math.round(((li + (si / Math.max(1, segments.length))) / LANGS.length) * 70);
          progressCb(Math.max(0, Math.min(99, pct)), `Lang ${lang.name}: segment ${si + 1}/${segments.length}`);
        }
      }

      const listFile = path.join(langDir, 'concat.txt');
      const listContent = concatList.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
      fs.writeFileSync(listFile, listContent);

      const combinedAudio = path.join(langDir, `combined_${lang.code}.mp3`);
      await concatAudios(listFile, combinedAudio);
      progressCb(75 + Math.round((li / LANGS.length) * 5), `Lang ${lang.name}: audio combined`);

      const outVideo = path.join(langDir, `dubbed_${lang.code}.mp4`);
      await mergeAudioVideo(localVideo, combinedAudio, outVideo);
      progressCb(85 + Math.round((li / LANGS.length) * 5), `Lang ${lang.name}: merged`);

      const cloudUrl = await uploadToCloudinary(outVideo);
      progressCb(90 + Math.round((li / LANGS.length) * 5), `Lang ${lang.name}: uploaded`);

      results.push({ code: lang.code, name: lang.name, url: cloudUrl });

      try { fs.unlinkSync(combinedAudio); } catch (e) {}
      try {
        fs.readdirSync(langDir).forEach(f => {
          try { fs.unlinkSync(path.join(langDir, f)); } catch (e) {}
        });
        fs.rmdirSync(langDir);
      } catch (e) {}
    }

    try { fs.unlinkSync(localVideo); } catch (e) {}
    progressCb(100, 'All processed');

    return results;
  } catch (err) {
    throw err;
  } finally {
    try { fs.rmdirSync(workdir, { recursive: true }); } catch (e) {}
  }
}
