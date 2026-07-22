import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText } from 'lucide-react';
import api from '../services/api';

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  function load() {
    api.get('/documents').then((r) => setDocuments(r.data)).catch(() => {});
  }
  useEffect(load, []);

  async function handleFiles(files) {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('docType', 'identity');
        await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Documents</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">Upload identity and policy documents (JPG, PNG, or PDF, up to 5MB).</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => inputRef.current.click()}
        className={`card border-dashed p-10 text-center cursor-pointer transition-colors mb-6 ${dragOver ? 'bg-[var(--color-brass-soft)]/20 border-[var(--color-brass)]' : ''}`}
      >
        <input ref={inputRef} type="file" multiple hidden accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleFiles(Array.from(e.target.files))} />
        <motion.div animate={{ y: dragOver ? -4 : 0 }} className="flex flex-col items-center">
          <UploadCloud size={28} className="text-[var(--color-brass)] mb-2" />
          <p className="text-sm text-[var(--color-ink)]">{uploading ? 'Uploading…' : 'Drop files here, or click to browse'}</p>
        </motion.div>
      </div>

      <div className="space-y-2">
        {documents.length === 0 && <p className="text-sm text-[var(--color-muted)]">No documents uploaded yet.</p>}
        {documents.map((d, i) => (
          <motion.a
            key={d.id} href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api')}${d.filePath}`}
            target="_blank" rel="noreferrer"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card p-4 flex items-center gap-3 hover:bg-[var(--color-paper)] transition-colors"
          >
            <FileText size={18} className="text-[var(--color-muted)]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--color-ink)] truncate">{d.fileName}</p>
              <p className="text-xs text-[var(--color-muted)]">{new Date(d.uploadedAt).toLocaleDateString('en-IN')}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
