"use client";

import React, { useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgBorder =
    toast.type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : toast.type === "error"
      ? "bg-rose-50 border-rose-200 text-rose-900"
      : toast.type === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-cyan-50 border-cyan-200 text-cyan-900";

  const icon =
    toast.type === "success"
      ? "✅"
      : toast.type === "error"
      ? "❌"
      : toast.type === "warning"
      ? "⚠️"
      : "ℹ️";

  return (
    <div
      className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-lg transition-all duration-300 transform ${bgBorder} ${
        exiting ? "opacity-0 translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100 animate-slide-in-right"
      }`}
    >
      <span className="text-lg mr-3 shrink-0">{icon}</span>
      <div className="flex-1">
        <h4 className="font-semibold text-sm font-display">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs mt-1 opacity-90 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="ml-3 text-slate-400 hover:text-slate-700 text-sm p-1 rounded transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
