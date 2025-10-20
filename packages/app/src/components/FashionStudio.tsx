import React, { useState, useRef } from 'react';

type ConceptResponse = {
  designId: string;
  design?: any;
  previewUrl?: string;
  ready?: boolean;
};

export default function FashionStudio() {
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('jacket');
  const [style, setStyle] = useState('modern royal');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

  async function uploadFile(file: File) {
    // get presigned URL from backend (endpoint: /assets/upload-url) or fallback to simple direct upload if server accepts multipart
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
    return res.json(); // expect { url, key } or accept 200 for simplicity
  }

  async function submit() {
    if (!story.trim()) {
      alert('Please enter a story or vibe.');
      return;
    }
    setLoading(true);
    try {
      let uploadMeta = null;
      if (file) {
        // if server supports multipart
        const form = new FormData();
        form.append('file', file);
        const up = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
        uploadMeta = await up.json();
      }

      const payload = {
        brief: story,
        options: {
          product: category,
          style,
          retrieval: true
        },
        ref: uploadMeta // optional
      };

      const res = await fetch(`${API_BASE}/designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      setResult({ designId: json.designId, design: json.design, previewUrl: json.previewUrl, ready: true });

      // If async processing: start polling
      if (json.designId && !json.previewUrl) {
        setPolling(true);
        poll(json.designId);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Check console.');
    } finally {
      setLoading(false);
    }
  }

  async function poll(designId: string) {
    const POLL_INTERVAL = 3000;
    const MAX_TRIES = 40;
    let tries = 0;
    while (tries < MAX_TRIES) {
      tries++;
      try {
        const r = await fetch(`${API_BASE}/concepts/${designId}`);
        if (r.ok) {
          const j = await r.json();
          if (j.ready) {
            setResult({ designId, design: j.design, previewUrl: j.previewUrl, ready: true });
            setPolling(false);
            return;
          }
        }
      } catch (err) {
        console.warn('poll fail', err);
      }
      await new Promise((res) => setTimeout(res, POLL_INTERVAL));
    }
    setPolling(false);
    alert('Processing timed out. Try again later.');
  }

  return (
    <div className="p-6 bg-white/5 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">SOYL AI Fashion Studio</h2>

      <label className="block mb-2 text-sm">Story / Inspiration</label>
      <textarea value={story} onChange={(e)=>setStory(e.target.value)} className="w-full p-3 rounded bg-white/5 mb-4" rows={4} />

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="p-2 rounded bg-white/5">
            <option value="jacket">Jacket</option>
            <option value="shirt">Shirt</option>
            <option value="dress">Dress</option>
            <option value="shoes">Shoes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Style</label>
          <input value={style} onChange={(e)=>setStyle(e.target.value)} className="p-2 rounded bg-white/5" />
        </div>

        <div>
          <label className="block text-sm mb-1">Reference Image (optional)</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={submit} disabled={loading} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded">
          {loading ? 'Sending...' : 'Create Concept'}
        </button>
        <button onClick={()=>{ setStory(''); setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="px-4 py-2 bg-white/5 rounded">
          Reset
        </button>
      </div>

      <div className="mt-6">
        {result && (
          <>
            <h3 className="text-lg font-medium">Result</h3>
            <div className="mt-2">
              <div>Design ID: <code>{result.designId}</code></div>
              {result.previewUrl && <img src={result.previewUrl} alt="preview" className="mt-2 max-w-full border" />}
              {result.design && <pre className="mt-2 max-h-64 overflow-auto text-sm bg-black/40 p-2 rounded">{JSON.stringify(result.design,null,2)}</pre>}
              {polling && <div className="mt-2 text-sm">Processing images... (polling)</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
