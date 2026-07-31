import React from 'react';

export default function SectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sektöre özel üst ince bilgi bandı */}
      <div className="bg-[#1E1B4B] text-slate-200 text-center py-2 text-xs font-semibold px-4">
        ⚡ Sektörünüze özel GlowDesk Multi-Vertical altyapısı yayında!
      </div>
      <main>{children}</main>
    </div>
  );
}
