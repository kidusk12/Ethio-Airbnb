import React from "react";
import { Star, MapPin, CalendarDays } from "lucide-react";

/**
 * Past trip row with optional review CTA.
 * @param {{ trip: import("../../data/mockDashboardData").PastTrip, onLeaveReview?: (id: string) => void }} props
 */
export function PastTripCard({ trip, onLeaveReview }) {
  const { id, propertyName, location, image, stayedDates, reviewed, myRating } = trip;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
        <img src={image} alt={propertyName} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-semibold text-gray-900 truncate mb-0.5">{propertyName}</h4>
        <div className="flex items-center gap-1 text-gray-400 mb-0.5">
          <MapPin size={11} />
          <span className="text-[12px] truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <CalendarDays size={11} />
          <span className="text-[12px]">{stayedDates}</span>
        </div>
      </div>

      {/* Review */}
      <div className="flex-shrink-0 text-right">
        {reviewed ? (
          <div>
            <div className="flex items-center gap-0.5 justify-end mb-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < (myRating ?? 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400">Reviewed</span>
          </div>
        ) : (
          <button
            onClick={() => onLeaveReview?.(id)}
            className="text-[12px] font-semibold text-[#E8473F] hover:text-[#D63C34] transition-colors whitespace-nowrap"
          >
            Leave a review
          </button>
        )}
      </div>
    </div>
  );
}
