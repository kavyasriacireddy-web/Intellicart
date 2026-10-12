import React from 'react';

export function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 animate-pulse">
          <div className="aspect-4/3 bg-slate-200 rounded-xl w-full" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded-md w-1/3" />
            <div className="h-4 bg-slate-200 rounded-md w-4/5" />
            <div className="h-4 bg-slate-200 rounded-md w-2/3" />
          </div>
          <div className="pt-2 flex justify-between items-center">
            <div className="h-5 bg-slate-200 rounded-md w-1/4" />
            <div className="h-9 w-9 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="aspect-square bg-slate-200 rounded-2xl" />
      <div className="space-y-6">
        <div className="h-4 bg-slate-200 rounded-md w-1/4" />
        <div className="h-8 bg-slate-200 rounded-md w-3/4" />
        <div className="h-6 bg-slate-200 rounded-md w-1/3" />
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="h-12 bg-slate-200 rounded-xl w-1/2" />
      </div>
    </div>
  );
}
