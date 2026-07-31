"use client";

import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="brand-card p-10 text-center flex flex-col items-center justify-center my-6">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#1E1B4B] font-display">{title}</h3>
      <p className="text-slate-500 text-xs mt-1.5 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-cyan text-xs py-2.5 px-5 mt-5 shadow-sm inline-flex items-center gap-2"
        >
          <span>➕</span>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
