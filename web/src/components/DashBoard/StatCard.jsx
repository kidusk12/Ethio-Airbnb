import React from "react";

/**
 * Quick-stat tile in the dashboard welcome header.
 * @param {{ icon: React.ElementType, label: string, value: string | number }} props
 */
export function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex-shrink-0 w-48 md:w-auto bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#fdf2f2] flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-[#E8473F]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[22px] font-bold text-gray-900 leading-none mb-0.5 tabular-nums">{value}</p>
        <p className="text-[12px] text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}
