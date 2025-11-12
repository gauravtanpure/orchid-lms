// /backend/src/routes/dynamicDubbingRoutes.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';
import { nanoid } from 'nanoid';

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
  // Use resource_type: 'auto' for audio files so Cloudinary stores them correctly
  return cloudinary.uploader.upload(localPath, {
    resource_type: 'auto',
    folder,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });
}

/**
 * Choose voice for TTS based on language code.
 * You can override via env var OPENAI_VOICE_MAP as JSON string, e.g.
 * OPENAI_VOICE_MAP='{"hi":"hindi_voice","mr":"marathi_voice","en":"alloy"}'
 */
function getVoiceForLang(lang) {
  try {
    if (process.env.OPENAI_VOICE_MAP) {
      const map = JSON.parse(process.env.OPENAI_VOICE_MAP);
      if (map && map[lang]) return map[lang];
    }
  } catch (e) {
    console.warn('[DUB] Invalid OPENAI_VOICE_MAP env, ignoring');
  }
  // default mapping (fallbacks). Replace with actual available voices from your TTS provider.
  const defaults = { hi: 'alloy', mr: 'alloy', en: 'alloy' };
  return defaults[lang] || 'alloy';
}

async function synthesizeTextToAudioFile(text, localPath, lang = 'en') {
  // Map language -> voice
  const voice = getVoiceForLang(lang);

  // OpenAI TTS call
  const resp = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice,
    input: text,
  });
  const buffer = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(localPath, buffer);
  return localPath;
}

async function transcribeAudioFile(filePath) {
  const resp = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    response_format: 'text',
  });
  // handle different return shapes robustly
  if (typeof resp === 'string') return resp;
  return resp.text || (resp?.data?.text) || '';
}

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

router.get('/audio', async (req, res) => {
  const start = Date.now();
  try {
    const { courseId, lessonId, lang } = req.query;
    if (!courseId || !lessonId || !lang) return res.status(400).json({ message: 'courseId, lessonId, lang required' });

    const supported = ['original', 'hi', 'mr', 'en'];
    if (!supported.includes(String(lang))) return res.status(400).json({ message: 'invalid lang' });

    // quick env checks
    if (!process.env.OPENAI_API_KEY) {
      console.error('[DUB] Missing OPENAI_API_KEY');
      return res.status(500).json({ message: 'Server misconfiguration: missing OPENAI API key' });
    }

    const course = await Course.findById(String(courseId));
    if (!course) return res.status(404).json({ message: 'course not found' });
    const lesson = course.lessons.id(String(lessonId));
    if (!lesson) return res.status(404).json({ message: 'lesson not found' });

    if (lang === 'original') {
      return res.json({ url: lesson.videoUrl, cached: true, source: 'original' });
    }

    const audioField = lang === 'hi' ? 'audioUrl_hi' : lang === 'mr' ? 'audioUrl_mr' : 'audioUrl_en';
    if (lesson[audioField]) {
      return res.json({ url: lesson[audioField], cached: true, source: 'cache' });
    }

    // get transcript (cached on lesson if possible)
    let transcriptText = lesson.transcript || null;
    if (!transcriptText) {
      const tmpVideoPath = path.join(TMP_DIR, `${nanoid()}.mp4`);
      try {
        await downloadToFile(lesson.videoUrl, tmpVideoPath);
      } catch (e) {
        console.error('[DUB] downloadToFile failed:', e && (e.message || e));
        return res.status(500).json({ message: 'Failed to download original video (check URL & network)' });
      }

      try {
        transcriptText = await transcribeAudioFile(tmpVideoPath);
      } catch (e) {
        console.error('[DUB] transcribeAudioFile failed:', e && (e.response?.data || e.message || e));
        safeUnlink(tmpVideoPath);
        return res.status(500).json({ message: 'Transcription failed' });
      }
      lesson.transcript = transcriptText;
      await course.save();
      safeUnlink(tmpVideoPath);
    }

    const targetName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';
    let translated;
    try {
      translated = await translateText(transcriptText, targetName);
    } catch (e) {
      console.error('[DUB] translateText failed:', e && (e.response?.data || e.message || e));
      return res.status(500).json({ message: 'Translation failed' });
    }

    const tmpAudioPath = path.join(TMP_DIR, `${nanoid()}.mp3`);
    try {
      await synthesizeTextToAudioFile(translated, tmpAudioPath, lang);
    } catch (e) {
      console.error('[DUB] TTS failed:', e && (e.response?.data || e.message || e));
      safeUnlink(tmpAudioPath);
      return res.status(500).json({ message: 'Text-to-speech generation failed' });
    }

    // upload to CDN
    let uploadResp;
    try {
      uploadResp = await uploadAudioToCloudinary(tmpAudioPath);
    } catch (e) {
      console.error('[DUB] Cloudinary upload failed:', e && (e.response?.data || e.message || e));
      safeUnlink(tmpAudioPath);
      return res.status(500).json({ message: 'Upload to CDN failed' });
    }

    // Cloudinary returns an object; try to get secure_url
    const uploadedUrl = (typeof uploadResp === 'string') ? uploadResp : (uploadResp.secure_url || uploadResp.url);
    if (!uploadedUrl) {
      console.error('[DUB] upload returned unexpected response:', uploadResp);
      safeUnlink(tmpAudioPath);
      return res.status(500).json({ message: 'Upload returned unexpected response' });
    }

    // cache URL on lesson
    if (lang === 'hi') lesson.audioUrl_hi = uploadedUrl;
    if (lang === 'mr') lesson.audioUrl_mr = uploadedUrl;
    if (lang === 'en') lesson.audioUrl_en = uploadedUrl;
    await course.save();

    safeUnlink(tmpAudioPath);
    console.log(`[DUB] Generated audio for lesson ${lessonId} lang=${lang} in ${(Date.now()-start)/1000}s -> ${uploadedUrl}`);
    return res.json({ url: uploadedUrl, cached: false, source: 'generated' });
  } catch (error) {
    console.error('[DUB] Unexpected error:', error && (error.stack || error));
    if (error && error.response && error.response.data) console.error('[DUB] error.response.data:', error.response.data);
    return res.status(500).json({ message: 'Internal server error (see server logs)' });
  }
});

export default router;
