import React from "react";
import { Star, Heart, MapPin } from "lucide-react";

/**
 * Saved / wishlist property card.
 * @param {{ stay: import("../../data/mockDashboardData").SavedStay, onRemove?: (id: string) => void }} props
 */
export function SavedStayCard({ stay, onRemove }) {
  const { id, name, type, location, image, rating, reviews, pricePerNightETB } = stay;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          type="button"
          aria-label="Remove from saved"
          onClick={() => onRemove?.(id)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <Heart size={15} style={{ fill: "#E8473F", color: "#E8473F" }} />
        </button>
        <span className="absolute top-2.5 left-2.5 bg-white/90 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
          {type}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="text-[14px] font-semibold text-gray-900 mb-1 truncate">{name}</h4>

        <div className="flex items-center gap-1 mb-1">
          <MapPin size={11} className="text-gray-400 flex-shrink-0" />
          <span className="text-[12px] text-gray-400 truncate">{location}</span>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[12px] font-medium text-gray-700">{rating}</span>
          <span className="text-[12px] text-gray-400">({reviews} reviews)</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-gray-900 tabular-nums">
            ETB {pricePerNightETB.toLocaleString()}
            <span className="text-[12px] font-normal text-gray-400"> / night</span>
          </p>
          <button className="text-[12px] font-semibold text-[#E8473F] hover:text-[#D63C34] transition-colors">
            Book again
          </button>
        </div>
      </div>
    </div>
  );
}
