"use client";

import React, { useState } from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

export default function DocumentUploadStep() {
  const { state, updateMetadata } = useBookingEngine();
  const meta = state.metadata as any;
  const docs: string[] = meta.documentUrls || [];
  const [uploading, setUploading] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setTimeout(() => {
      const newUrls = Array.from(files).map(
        (f) => `https://storage.glowdesk.com/docs/${Date.now()}_${f.name}`
      );
      updateMetadata({ documentUrls: [...docs, ...newUrls] });
      setUploading(false);
    }, 800);
  };

  const removeDoc = (index: number) => {
    const updated = docs.filter((_, i) => i !== index);
    updateMetadata({ documentUrls: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Belge Yükleme (İsteğe Bağlı)</h3>
        <p className="text-xs text-slate-500">
          Avukatımızın görüşme öncesi incelemesini istediğiniz dökümanları (sözleşme, ihtarname, tutanak vb.) yükleyebilirsiniz.
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-all">
        <input
          type="file"
          id="doc-upload"
          multiple
          onChange={handleSimulatedUpload}
          className="hidden"
        />
        <label htmlFor="doc-upload" className="cursor-pointer block">
          <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-base">
            📄
          </div>
          <span className="text-xs font-bold text-slate-700 block">Dosya Seçmek İçin Tıklayın</span>
          <span className="text-[10px] text-slate-400">PDF, DOCX, PNG (Maks 10MB)</span>
        </label>
      </div>

      {uploading && (
        <div className="text-xs font-semibold text-violet-600 animate-pulse text-center">
          ⏳ Belgeler yükleniyor...
        </div>
      )}

      {docs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700">Yüklenen Belgeler ({docs.length})</h4>
          <div className="space-y-1.5">
            {docs.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="truncate max-w-[240px] text-slate-600 font-medium">📎 {doc.split('_').pop()}</span>
                <button
                  type="button"
                  onClick={() => removeDoc(idx)}
                  className="text-rose-500 font-bold hover:underline"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
