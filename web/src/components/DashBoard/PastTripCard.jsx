import React from "react";
import { Star } from "lucide-react";

/**
 * @param {{
 *   trip: import("../../data/mockDashboardData").PastTrip,
 *   onLeaveReview?: (id: string) => void
 * }} props
 */
export function PastTripCard({ trip, onLeaveReview }) {
  const { id, propertyName, location, image, stayedDates, reviewed, myRating } = trip;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-stone-100 last:border-b-0">
      <img
        src={image}
        alt={propertyName}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />

      <div className="min-w-0 flex-1">
        <h4 className="text-[14px] font-semibold text-stone-900 truncate">{propertyName}</h4>
        <p className="text-[12px] text-stone-500 truncate">{location}</p>
        <p className="text-[12px] text-stone-400">{stayedDates}</p>
      </div>

      {reviewed ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              className={i < myRating ? "fill-amber-400 text-amber-400" : "text-stone-200"}
            />
          ))}
        </div>
      ) : (
        <button
          onClick={() => onLeaveReview?.(id)}
          className="text-[12px] font-medium bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors"
        >
          Leave a review
        </button>
      )}
    </div>
  );
}
