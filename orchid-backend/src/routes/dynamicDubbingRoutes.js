// /backend/src/routes/dynamicDubbingRoutes.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';
import { nanoid } from 'nanoid';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TMP_DIR = path.join(process.cwd(), 'tmp_dubbing');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

function safeUnlink(p) {
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (e) { /* ignore */ }
}

async function downloadToFile(url, dest) {
  const writer = fs.createWriteStream(dest);
  const resp = await axios.get(url, { responseType: 'stream', timeout: 10 * 60 * 1000 });
  await new Promise((res, rej) => {
    resp.data.pipe(writer);
    writer.on('error', (e) => rej(e));
    writer.on('close', () => res());
  });
  return dest;
}

async function uploadAudioToCloudinary(localPath, folder = 'dubbed_audio') {
  return cloudinary.uploader.upload(localPath, {
    resource_type: 'auto',
    folder,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });
}

// voice mapping (optional) via OPENAI_VOICE_MAP env var
function getVoiceForLang(code) {
  try {
    if (process.env.OPENAI_VOICE_MAP) {
      const map = JSON.parse(process.env.OPENAI_VOICE_MAP);
      if (map && map[code]) return map[code];
    }
  } catch (e) {
    console.warn('[DUB] OPENAI_VOICE_MAP invalid JSON, ignoring');
  }
  return { en: 'alloy', hi: 'alloy', mr: 'alloy' }[code] || 'alloy';
}

// Optional: Google TTS wrapper (lazy import)
let googleTTSClient = null;
async function ensureGoogleTTSClient() {
  if (googleTTSClient) return googleTTSClient;
  try {
    const textToSpeech = await import('@google-cloud/text-to-speech');
    googleTTSClient = new textToSpeech.TextToSpeechClient();
    return googleTTSClient;
  } catch (e) {
    console.warn('[DUB] Google TTS not available or failed to import:', e && e.message);
    throw e;
  }
}
async function googleTextToSpeech(text, outPath, locale = 'mr-IN', voiceName = null) {
  const client = await ensureGoogleTTSClient();
  const request = {
    input: { text },
    voice: { languageCode: locale, name: voiceName || `${locale}-Wavenet-A` },
    audioConfig: { audioEncoding: 'MP3' },
  };
  const [response] = await client.synthesizeSpeech(request);
  const buffer = Buffer.from(response.audioContent, 'base64');
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

// Attempt OpenAI TTS first, fallback to Google if allowed and OpenAI fails
async function synthesizeTextToAudioFile(text, localPath, lang = 'en') {
  const voice = getVoiceForLang(lang);
  try {
    const resp = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice,
      input: text,
    });
    const buffer = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    return localPath;
  } catch (e) {
    console.warn('[DUB] OpenAI TTS failed:', e && (e.message || e));
    if (process.env.USE_GOOGLE_TTS === 'true') {
      try {
        const locale = lang === 'mr' ? 'mr-IN' : (lang === 'hi' ? 'hi-IN' : 'en-US');
        return await googleTextToSpeech(text, localPath, locale);
      } catch (gerr) {
        console.error('[DUB] Google TTS fallback failed:', gerr && (gerr.message || gerr));
        throw gerr;
      }
    }
    throw e;
  }
}

// Extract audio from video -> WAV mono 16k, then transcribe with retry and optional language hint
async function transcribeAudioFileWithRetryAndExtract(videoPath, hintLang = null, maxRetries = 2) {
  const audioPath = videoPath.replace(/\.[^/.]+$/, '') + '.wav';
  // extract audio via ffmpeg
  try {
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('pcm_s16le')
        .format('wav')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('error', (err) => reject(err))
        .on('end', () => resolve())
        .save(audioPath);
    });
  } catch (e) {
    console.error('[DUB] ffmpeg audio extraction failed:', e && (e.message || e));
    // if extraction fails, we still attempt to transcribe the original file (best-effort)
    // but prefer to fail loudly here
    throw new Error('Audio extraction failed: ' + (e?.message || e));
  }

  let lastErr = null;
  for (let attempt = 1; attempt <= Math.max(1, maxRetries); attempt++) {
    try {
      const reqOptions = {
        file: fs.createReadStream(audioPath),
        model: 'whisper-1',
        response_format: 'text',
      };
      if (hintLang) reqOptions.language = hintLang;
      const resp = await openai.audio.transcriptions.create(reqOptions);
      const text = resp?.text || (typeof resp === 'string' ? resp : '') || '';
      if (text && text.trim().length > 0) {
        try { fs.unlinkSync(audioPath); } catch (e) {}
        return text;
      } else {
        lastErr = new Error('Empty transcription response');
        console.warn(`[DUB] transcription attempt ${attempt} returned empty text`);
      }
    } catch (err) {
      lastErr = err;
      console.error(`[DUB] transcription attempt ${attempt} failed:`, {
        message: err && (err.message || err.toString && err.toString()),
        responseStatus: err?.response?.status,
        responseData: err?.response?.data,
      });
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }

  try { fs.unlinkSync(audioPath); } catch (e) {}
  const outMsg = lastErr?.response ? `API ${lastErr.response.status}: ${JSON.stringify(lastErr.response.data).slice(0,200)}` : (lastErr?.message || 'unknown');
  const e = new Error('Transcription failed: ' + outMsg);
  e.cause = lastErr;
  throw e;
}

// simple translator using OpenAI responses
async function translateText(text, targetName) {
  const prompt = `Translate the following text into ${targetName}. Keep punctuation and sentence structure:\n\n${text}`;
  const r = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: prompt,
  });
  if (r.output_text) return r.output_text;
  if (Array.isArray(r.output)) return r.output.map(o => (typeof o.content === 'string' ? o.content : '')).join(' ');
  return '';
}

// Main route: GET /api/dubbing/audio?courseId=...&lessonId=...&lang=mr|hi|en|original&sourceLang=mr&debug=true
router.get('/audio', async (req, res) => {
  const start = Date.now();
  try {
    const { courseId, lessonId, lang, debug } = req.query;
    if (!courseId || !lessonId || !lang) return res.status(400).json({ message: 'courseId, lessonId, lang required' });

    const supported = ['original', 'hi', 'mr', 'en'];
    if (!supported.includes(String(lang))) return res.status(400).json({ message: 'invalid lang' });

    if (!process.env.OPENAI_API_KEY) {
      console.error('[DUB] Missing OPENAI_API_KEY');
      return res.status(500).json({ message: 'Server misconfiguration: missing OPENAI API key' });
    }

    const course = await Course.findById(String(courseId));
    if (!course) return res.status(404).json({ message: 'course not found' });
    const lesson = course.lessons.id(String(lessonId));
    if (!lesson) return res.status(404).json({ message: 'lesson not found' });

    if (String(lang) === 'original') {
      return res.json({ url: lesson.videoUrl, cached: true, source: 'original' });
    }

    const audioField = lang === 'hi' ? 'audioUrl_hi' : lang === 'mr' ? 'audioUrl_mr' : 'audioUrl_en';
    if (lesson[audioField]) {
      return res.json({ url: lesson[audioField], cached: true, source: 'cache' });
    }

    // 1) Get or create transcript
    let transcriptText = lesson.transcript || '';
    if (!transcriptText || transcriptText.trim().length < 10) {
      const tmpVideoPath = path.join(TMP_DIR, `${nanoid()}.mp4`);
      try {
        await downloadToFile(lesson.videoUrl, tmpVideoPath);
      } catch (e) {
        console.error('[DUB] downloadToFile failed:', e && (e.message || e));
        return res.status(500).json({ message: 'Failed to download original video (check URL & network)' });
      }

      // hint: prefer explicit sourceLang param if passed
      const hintLang = (req.query.sourceLang && String(req.query.sourceLang)) || (String(lang) === 'mr' ? 'mr' : null);
      try {
        transcriptText = await transcribeAudioFileWithRetryAndExtract(tmpVideoPath, hintLang);
      } catch (e) {
        console.error('[DUB] transcribeAudioFileWithRetryAndExtract failed:', e && (e.message || e));
        safeUnlink(tmpVideoPath);
        return res.status(500).json({ message: 'Transcription failed', details: (e && e.message) || e });
      }
      if (transcriptText && transcriptText.trim().length > 0) {
        lesson.transcript = transcriptText;
        try { await course.save(); } catch (e) { console.warn('[DUB] failed saving transcript to course', e && e.message); }
      }
      try { fs.unlinkSync(tmpVideoPath); } catch (e) {}
    }

    if (!transcriptText || transcriptText.trim().length < 2) {
      return res.status(500).json({ message: 'Transcription produced no text' });
    }

    // 2) Translate if needed (skip if sourceLang === targetLang)
    const sourceLangHint = (req.query.sourceLang && String(req.query.sourceLang)) || null;
    let translated = transcriptText;
    if (!sourceLangHint || sourceLangHint !== String(lang)) {
      try {
        const targetName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';
        translated = await translateText(transcriptText, targetName);
      } catch (e) {
        console.error('[DUB] translateText failed:', e && (e.message || e));
        return res.status(500).json({ message: 'Translation failed' });
      }
    } else {
      // source == target; use the transcript (no translation)
      translated = transcriptText;
    }

    // 3) TTS -> file
    const tmpAudioPath = path.join(TMP_DIR, `${nanoid()}.mp3`);
    try {
      await synthesizeTextToAudioFile(translated, tmpAudioPath, String(lang));
    } catch (e) {
      console.error('[DUB] synthesizeTextToAudioFile failed:', e && (e.message || e));
      safeUnlink(tmpAudioPath);
      return res.status(500).json({ message: 'Text-to-speech generation failed', details: e && e.message });
    }

    // 4) Upload audio to Cloudinary
    let uploadResp;
    try {
      uploadResp = await uploadAudioToCloudinary(tmpAudioPath);
    } catch (e) {
      console.error('[DUB] Cloudinary upload failed:', e && (e.message || e));
      safeUnlink(tmpAudioPath);
      return res.status(500).json({ message: 'Upload to CDN failed' });
    }

    const uploadedUrl = (typeof uploadResp === 'string') ? uploadResp : (uploadResp.secure_url || uploadResp.url);
    if (!uploadedUrl) {
      console.error('[DUB] Upload returned unexpected response:', uploadResp);
      safeUnlink(tmpAudioPath);
      return res.status(500).json({ message: 'Upload returned unexpected response' });
    }

    // 5) Cache and return
    lesson[audioField] = uploadedUrl;
    try { await course.save(); } catch (e) { console.warn('[DUB] failed saving course with audio URL', e && e.message); }

    try { fs.unlinkSync(tmpAudioPath); } catch (e) {}

    console.log(`[DUB] Generated audio for lesson ${lessonId} lang=${lang} -> ${uploadedUrl} (${((Date.now()-start)/1000).toFixed(1)}s)`);

    if (String(debug) === 'true') {
      return res.json({
        url: uploadedUrl,
        cached: false,
        source: 'generated',
        debug: {
          transcriptSnippet: (transcriptText || '').slice(0, 700),
          translatedSnippet: (translated || '').slice(0, 700),
          voiceUsed: getVoiceForLang(String(lang)),
          cloudinaryRaw: uploadResp,
        }
      });
    }

    return res.json({ url: uploadedUrl, cached: false, source: 'generated' });

  } catch (error) {
    console.error('[DUB] Unexpected error:', error && (error.stack || error));
    return res.status(500).json({ message: 'Internal server error (see server logs)', error: String(error && error.message ? error.message : error) });
  }
});

export default router;
