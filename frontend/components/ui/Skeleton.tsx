"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const baseStyle = "animate-pulse bg-slate-200/80 dark:bg-slate-700/50 rounded-lg";

  let variantStyle = "";
  if (variant === "circular") {
    variantStyle = "rounded-full";
  } else if (variant === "text") {
    variantStyle = "h-4 w-3/4 rounded";
  } else if (variant === "card") {
    variantStyle = "h-32 w-full rounded-xl";
  }

  return (
    <div
      className={`${baseStyle} ${variantStyle} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="brand-card p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton variant="rectangular" className="w-full h-12 rounded-lg" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-1/4 h-4" />
        <Skeleton variant="text" className="w-1/5 h-4" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="brand-card overflow-hidden p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <Skeleton variant="text" className="w-1/4 h-6" />
        <Skeleton variant="rectangular" className="w-32 h-9 rounded-lg" />
      </div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 py-2">
            <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-1/3 h-4" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
            <Skeleton variant="rectangular" className="w-20 h-7 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
