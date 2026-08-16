import React from "react";

/**
 * Single inbox row.
 * @param {{ message: import("../../data/mockDashboardData").Message }} props
 */
export function MessageItem({ message }) {
  const { hostName, hostAvatar, propertyName, preview, timestamp, unread } = message;

  return (
    <div className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-gray-50 ${unread ? "bg-[#fdf2f2]/60" : ""}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {hostAvatar ? (
            <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-[14px] font-semibold text-gray-600">
              {hostName?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E8473F] border-2 border-white" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-[13px] truncate ${unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
            {hostName}
          </p>
          <span className="text-[11px] text-gray-400 flex-shrink-0">{timestamp}</span>
        </div>
        <p className="text-[11px] text-[#E8473F] mb-0.5 truncate font-medium">{propertyName}</p>
        <p className={`text-[12px] truncate ${unread ? "text-gray-600" : "text-gray-400"}`}>{preview}</p>
      </div>
    </div>
  );
}
