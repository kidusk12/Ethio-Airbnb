import React from "react";
import { CalendarDays, Users, MapPin } from "lucide-react";

const STATUS = {
  upcoming:  { dot: "bg-blue-400",      text: "text-blue-700",      bg: "bg-blue-50",      label: "Upcoming"   },
  active:    { dot: "bg-[#E8473F]",     text: "text-[#E8473F]",     bg: "bg-[#fdf2f2]",   label: "Active now" },
  completed: { dot: "bg-gray-400",      text: "text-gray-500",      bg: "bg-gray-100",     label: "Completed"  },
  cancelled: { dot: "bg-red-300",       text: "text-red-500",       bg: "bg-red-50",       label: "Cancelled"  },
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
}

function nights(checkIn, checkOut) {
  return Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000);
}

/**
 * @param {{ booking: import("../../data/mockDashboardData").Booking }} props
 */
export function BookingCard({ booking }) {
  const { propertyName, propertyType, location, image, checkIn, checkOut, guests, totalPriceETB, status, hostName } = booking;
  const s = STATUS[status] ?? STATUS.upcoming;
  const n = nights(checkIn, checkOut);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="sm:w-52 lg:w-60 flex-shrink-0 relative">
        <img src={image} alt={propertyName} className="w-full h-48 sm:h-full object-cover" />
        <span className={`absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-[#E8473F] uppercase tracking-wide mb-1">{propertyType}</p>
          <h3 className="text-[17px] font-semibold text-gray-900 mb-1">{propertyName}</h3>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin size={13} />
            <span className="text-[13px]">{location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-[13px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-gray-400" />
            {fmtDate(checkIn)} — {fmtDate(checkOut)}
            <span className="text-gray-400">· {n} night{n !== 1 ? "s" : ""}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            {guests} guest{guests !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-[13px] text-gray-400">
            Host: <span className="font-medium text-gray-600">{hostName}</span>
          </p>
          <div className="text-right">
            <p className="text-[16px] font-bold text-gray-900 tabular-nums">ETB {totalPriceETB.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400">total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
