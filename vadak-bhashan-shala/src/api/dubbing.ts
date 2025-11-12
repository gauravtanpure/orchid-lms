// src/api/dubbing.ts
import axios from 'axios';

const base = import.meta.env.VITE_REACT_APP_BACKEND_URL?.replace(/\/$/, '') || '';

const API = axios.create({
  baseURL: base || '',
  // You can add default headers here if needed (e.g., Authorization)
});

export async function enqueueDubbing(courseId: string, lessonId: string) {
  return API.post('/api/dubbing/enqueue', { courseId, lessonId });
}

export async function getDubbingStatus(jobId: string) {
  return API.get(`/api/dubbing/status/${encodeURIComponent(jobId)}`);
}

// helper to enqueue many lessons (bulk)
export async function enqueueDubbingBulk(courseId: string, lessonIds: string[]) {
  // enqueue sequentially to avoid hammering (you can change to parallel if desired)
  const results: Array<{ lessonId: string; success: boolean; jobId?: string; error?: any }> = [];
  for (const lessonId of lessonIds) {
    try {
      const resp = await enqueueDubbing(courseId, lessonId);
      results.push({ lessonId, success: true, jobId: resp.data?.jobId });
    } catch (err: any) {
      results.push({ lessonId, success: false, error: err?.response?.data || err.message || err });
    }
  }
  return results;
}

export default API;
