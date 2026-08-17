import React from "react";
import { Calendar, Users, MessageCircle, MapPinned, XCircle } from "lucide-react";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABEL = {
  active: "Active now",
  upcoming: "Upcoming",
};

function formatDateRange(checkIn, checkOut) {
  const opts = { day: "numeric", month: "short" };
  const inD = new Date(checkIn).toLocaleDateString("en-GB", opts);
  const outD = new Date(checkOut).toLocaleDateString("en-GB", opts);
  return `${inD} – ${outD}`;
}

/**
 * @param {{ booking: import("../../data/mockDashboardData").Booking }} props
 */
export function BookingCard({ booking }) {
  const {
    propertyName,
    propertyType,
    location,
    image,
    checkIn,
    checkOut,
    guests,
    totalPriceETB,
    status,
    hostName,
  } = booking;

  return (
    <div className="group relative rounded-2xl border border-stone-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-stone-200/60 hover:-translate-y-0.5 hover:border-stone-300">
      {/* Signature ribbon: a restrained nod to the flag, used once, only on live/upcoming stays */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />

      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-[220px] h-[160px] sm:h-auto flex-shrink-0">
          <img
            src={image}
            alt={propertyName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span
            className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.upcoming}`}
          >
            {STATUS_LABEL[status] || "Upcoming"}
          </span>
        </div>

        <div className="flex-1 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-[12px] text-stone-500 mb-0.5">{propertyType}</p>
              <h3 className="text-[17px] font-semibold text-stone-900">{propertyName}</h3>
              <p className="text-[13px] text-stone-500">{location}</p>
            </div>
            <p className="text-[15px] font-semibold text-stone-900 whitespace-nowrap">
              ETB {totalPriceETB.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 mb-4 text-[13px] text-stone-600">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-600" />
              {formatDateRange(checkIn, checkOut)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-amber-600" />
              {guests} guests
            </span>
            <span className="text-stone-400">Hosted by {hostName}</span>
          </div>

          <div className="mt-auto flex flex-wrap gap-2">
            <button className="text-[13px] font-medium bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg transition-colors">
              View booking
            </button>
            <button className="text-[13px] font-medium border border-stone-200 hover:border-stone-300 text-stone-700 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              <MessageCircle size={14} />
              Contact host
            </button>
            <button className="text-[13px] font-medium border border-stone-200 hover:border-stone-300 text-stone-700 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              <MapPinned size={14} />
              Directions
            </button>
            <button className="text-[13px] font-medium text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ml-auto">
              <XCircle size={14} />
              Cancel / modify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}