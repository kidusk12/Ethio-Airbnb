import React from "react";

/**
 * One quick-status metric in the dashboard's welcome header
 * (e.g. "3 Upcoming trips"). Clickable — jumps to the related tab.
 */
export function StatCard({ icon: Icon, label, value, onClick }) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 min-w-[150px] text-left transition-all duration-150 ${
        onClick ? "hover:border-amber-300 hover:shadow-md hover:shadow-stone-200/60 hover:-translate-y-0.5 cursor-pointer" : ""
      }`}
    >
      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-amber-700" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-[17px] font-semibold text-stone-900 leading-tight">{value}</p>
        <p className="text-[12px] text-stone-500 leading-tight truncate">{label}</p>
      </div>
    </Wrapper>
  );
}