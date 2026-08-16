import React from "react";

/**
 * @param {{ message: import("../../data/mockDashboardData").Message }} props
 */
export function MessageItem({ message }) {
  const { hostName, hostAvatar, propertyName, preview, timestamp, unread } = message;

  return (
    <button className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors rounded-xl">
      <div className="relative flex-shrink-0">
        <img
          src={hostAvatar}
          alt={hostName}
          className="w-10 h-10 rounded-full object-cover"
        />
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-600 border-2 border-white" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[14px] truncate ${unread ? "font-semibold text-stone-900" : "font-medium text-stone-700"}`}>
            {hostName}
          </p>
          <span className="text-[11px] text-stone-400 whitespace-nowrap">{timestamp}</span>
        </div>
        <p className="text-[12px] text-amber-700 mb-0.5">{propertyName}</p>
        <p className="text-[13px] text-stone-500 truncate">{preview}</p>
      </div>
    </button>
  );
}