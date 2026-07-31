import type { Appointment } from "@/lib/types";
import { formatPrice, formatTime, getStatusLabel } from "@/__mocks__/mock-data";

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus?: (id: string, newStatus: Appointment["status"]) => void;
}

export default function AppointmentCard({ appointment, onUpdateStatus }: AppointmentCardProps) {
  const customer = appointment.customer;
  const service = appointment.service;

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">● Onaylandı</span>;
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">⏳ Beklemede</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#0066FF] border border-blue-200">✅ Tamamlandı</span>;
      case "no_show":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">⚠️ No-Show (Gelmedi)</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">❌ İptal</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-layered hover:shadow-layered-hover transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      
      {/* Sol Alan: Saat + Müşteri & Hizmet */}
      <div className="flex items-center gap-4">
        
        {/* Saat Pill */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 px-4 py-3 rounded-2xl text-center min-w-[85px] shadow-2xs">
          <span className="block text-[10px] font-extrabold text-[#0066FF] uppercase tracking-wider">Saat</span>
          <span className="block text-base font-extrabold text-slate-900 font-display mt-0.5">
            {appointment.start_time ? formatTime(appointment.start_time) : "--:--"}
          </span>
        </div>

        {/* Müşteri ve Hizmet Bilgisi */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-slate-900 text-sm font-display">{customer?.full_name}</h4>
            {getStatusBadge(appointment.status)}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            ✂️ {service?.name} ({service?.duration_minutes} dk) —{" "}
            <span className="text-[#0066FF] font-extrabold">{formatPrice(service?.price || 0, service?.currency)}</span>
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <a href={`tel:${customer?.phone}`} className="hover:text-[#0066FF] transition-colors font-bold text-slate-500">
              📞 {customer?.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      {appointment.status === "pending" && onUpdateStatus && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onUpdateStatus(appointment.id, "cancelled")}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Reddet
          </button>
          <button
            onClick={() => onUpdateStatus(appointment.id, "confirmed")}
            className="flex-1 sm:flex-initial btn-primary-blue text-xs py-2 px-4"
          >
            Onayla ✓
          </button>
        </div>
      )}

      {appointment.status === "confirmed" && onUpdateStatus && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onUpdateStatus(appointment.id, "no_show")}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            No-Show (Gelmedi)
          </button>
          <button
            onClick={() => onUpdateStatus(appointment.id, "completed")}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors shadow-2xs"
          >
            Tamamlandı ✓
          </button>
        </div>
      )}
    </div>
  );
}
