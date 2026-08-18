import React from "react";
import { Star, MapPin, CalendarDays, RotateCcw } from "lucide-react";

/**
 * Past trip card — grid tile, not a list row, so it fills space
 * consistently with BookingCard / SavedStayCard elsewhere in the dashboard.
 * @param {{ trip: import("../../data/mockDashboardData").PastTrip, onLeaveReview?: (id: string) => void }} props
 */
export function PastTripCard({ trip, onLeaveReview }) {
  const { id, propertyName, location, image, stayedDates, reviewed, myRating } = trip;

  return (
    <div className="group rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-stone-200/60 hover:-translate-y-0.5 hover:border-stone-300">
      <div className="relative aspect-[4/3]">
        <img
          src={image}
          alt={propertyName}
          className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
        />
        <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/90 text-stone-600 border border-stone-200">
          Completed
        </span>
      </div>

      <div className="p-3.5">
        <h4 className="text-[14px] font-semibold text-stone-900 mb-1 truncate">{propertyName}</h4>

        <div className="flex items-center gap-1 text-stone-400 mb-0.5">
          <MapPin size={11} />
          <span className="text-[12px] truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1 text-stone-400 mb-3">
          <CalendarDays size={11} />
          <span className="text-[12px]">{stayedDates}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          {reviewed ? (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < (myRating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}
                />
              ))}
            </div>
          ) : (
            <button
              onClick={() => onLeaveReview?.(id)}
              className="text-[12px] font-semibold text-amber-700 hover:text-amber-800 transition-colors"
            >
              Leave a review
            </button>
          )}

          <button className="text-[12px] font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors">
            <RotateCcw size={12} />
            Book again
          </button>
        </div>
      </div>
    </div>
  );
}