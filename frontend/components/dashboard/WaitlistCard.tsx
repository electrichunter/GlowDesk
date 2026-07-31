import type { WaitlistEntry } from "@/lib/types";
import { formatPrice } from "@/__mocks__/mock-data";
import { Card } from "@/components/ui/Card";

interface WaitlistCardProps {
  entry: WaitlistEntry;
  onOfferSlot?: (id: string) => void;
}

export default function WaitlistCard({ entry, onOfferSlot }: WaitlistCardProps) {
  const customer = entry.customer;
  const service = entry.service;

  return (
    <Card variant="interactive" className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-[#1E1B4B] text-sm">{customer.full_name}</h4>
          
          {entry.status === "waiting" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Sırada Bekliyor
            </span>
          )}
          {entry.status === "offered" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 animate-pulse">
              Teklif Gönderildi
            </span>
          )}
          {entry.status === "confirmed" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Teklifi Kabul Etti
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 font-medium">
          ⏱ Tercih Edilen Aralık: <span className="text-[#1E1B4B] font-bold">{entry.preferred_time_start} - {entry.preferred_time_end}</span>
        </p>
        
        {service && (
          <p className="text-[11px] text-slate-500">
            ✂️ Hizmet: {service.name} — <span className="text-[#1E1B4B] font-bold">{formatPrice(service.price || 0, service.currency)}</span>
          </p>
        )}
        <span className="block text-[11px] text-slate-400">📞 Telefon: {customer.phone}</span>
      </div>

      <div>
        {entry.status === "waiting" && onOfferSlot && (
          <button
            onClick={() => onOfferSlot(entry.id)}
            className="w-full sm:w-auto px-4 py-2 btn-cyan text-xs font-bold shadow-sm"
          >
            💬 Boş Saat Teklif Et
          </button>
        )}

        {entry.status === "offered" && (
          <div className="text-[11px] text-cyan-700 font-semibold bg-cyan-50 border border-cyan-200 px-3 py-2 rounded-lg">
            Müşteriden SMS/WhatsApp onayı bekleniyor...
          </div>
        )}

        {entry.status === "confirmed" && (
          <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
            ✓ Randevuya Dönüştürüldü
          </div>
        )}
      </div>
    </Card>
  );
}
