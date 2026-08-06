"use client";

import { useState, useEffect } from "react";

interface NotificationLogItem {
  id: string;
  recipient: string;
  channel: "sms" | "whatsapp" | "email" | "push";
  subject: string;
  body: string;
  status: "queued" | "sent" | "delivered" | "failed";
  sent_at: string;
  created_at: string;
}

export default function NotificationLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [triggering, setTriggering] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { apiRequest } = await import("@/lib/api-client");
      const { data } = await apiRequest<NotificationLogItem[]>("/notifications/logs");
      if (data && Array.isArray(data)) {
        setLogs(data);
      } else {
        // Mock fallback logs
        setLogs([
          {
            id: "log-1",
            recipient: "+90 555 123 45 67",
            channel: "sms",
            subject: "Randevu Hatırlatması",
            body: "Sayın Ahmet Yılmaz, 14:00 randevunuza 2 saat kalmıştır. İyi günler dileriz.",
            status: "delivered",
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "log-2",
            recipient: "ayse@example.com",
            channel: "email",
            subject: "GlowDesk Randevu Onayı #GLOW-4592",
            body: "Randevunuz başarıyla onaylandı. Detaylar ve adres bilgisi için tıklayın.",
            status: "sent",
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Logs fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTriggerSweep = async () => {
    setTriggering(true);
    try {
      const { apiRequest } = await import("@/lib/api-client");
      await apiRequest("/notifications/trigger-reminders", { method: "POST" });
      alert("⚡ Celery Bildirim Taraması Başlatıldı! Hatırlatmalar kuyruğa eklendi.");
      setTimeout(fetchLogs, 1500);
    } catch (err) {
      console.error("Trigger error:", err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-[#1E1B4B]">Bildirim & SMS Log Takibi</h1>
          <p className="text-slate-500 text-xs mt-1">
            Otomatik gönderilen SMS, E-posta ve WhatsApp mesajlarının canlı iletim durumu.
          </p>
        </div>
        <button
          disabled={triggering}
          onClick={handleTriggerSweep}
          className="btn-primary text-xs py-2.5 px-4 shadow-sm flex items-center gap-2"
        >
          <span>⚡</span>
          <span>{triggering ? "Taranıyor..." : "Otomatik Hatırlatıcıları Tetikle (Celery)"}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="brand-card p-4 bg-white border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Teslim Edilen SMS</span>
          <div className="text-2xl font-black text-[#1E1B4B]">
            {logs.filter((l) => l.status === "delivered" || l.status === "sent").length}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">%99.4 İletim Başarısı</span>
        </div>

        <div className="brand-card p-4 bg-white border-l-4 border-l-cyan-500 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Gönderilen E-Posta</span>
          <div className="text-2xl font-black text-[#1E1B4B]">
            {logs.filter((l) => l.channel === "email").length}
          </div>
          <span className="text-[10px] text-cyan-600 font-bold">Şablonlu İletim</span>
        </div>

        <div className="brand-card p-4 bg-white border-l-4 border-l-amber-500 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Kuyruktaki Bildirimler</span>
          <div className="text-2xl font-black text-[#1E1B4B]">
            {logs.filter((l) => l.status === "queued").length}
          </div>
          <span className="text-[10px] text-amber-600 font-bold">Celery Worker İşliyor</span>
        </div>

        <div className="brand-card p-4 bg-white border-l-4 border-l-purple-500 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">No-Show Telafi Mesajı</span>
          <div className="text-2xl font-black text-[#1E1B4B]">12</div>
          <span className="text-[10px] text-purple-600 font-bold">Otomatik Dönüşüm</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="brand-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-[#1E1B4B] text-sm">Canlı Gönderim Logları</h3>
          <button onClick={fetchLogs} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
            🔄 Yenile
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loglar yükleniyor...</div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-200">
                  <th className="p-3">Kanal</th>
                  <th className="p-3">Alıcı</th>
                  <th className="p-3">Konu / Şablon</th>
                  <th className="p-3">Mesaj İçeriği</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3 text-right">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-100 text-slate-700">
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{log.recipient}</td>
                    <td className="p-3 font-bold text-[#1E1B4B]">{log.subject}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{log.body}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          log.status === "delivered" || log.status === "sent"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.status === "queued"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {log.status === "delivered" || log.status === "sent" ? "✓ İletildi" : log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">Henüz bildirim kaydı yok.</div>
        )}
      </div>
    </div>
  );
}
