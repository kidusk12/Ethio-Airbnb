import React from "react";
import { Star, Heart } from "lucide-react";

/**
 * @param {{ stay: import("../../data/mockDashboardData").SavedStay, onRemove?: (id: string) => void }} props
 */
export function SavedStayCard({ stay, onRemove }) {
  const { id, name, type, location, image, rating, reviews, priceETB } = stay;

  return (
    <div className="group rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-stone-200/60 hover:-translate-y-0.5 hover:border-stone-300">
      <div className="relative aspect-[4/3]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          type="button"
          aria-label="Remove from saved"
          onClick={() => onRemove?.(id)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <Heart size={15} className="fill-amber-600 text-amber-600" />
        </button>
      </div>

      <div className="p-3.5">
        <p className="text-[12px] text-stone-500 mb-0.5">{type}</p>
        <h4 className="text-[14px] font-semibold text-stone-900 mb-1 truncate">{name}</h4>
        <div className="flex items-center gap-1 mb-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-[12px] font-medium text-stone-700">{rating}</span>
          <span className="text-[12px] text-stone-400">({reviews})</span>
        </div>
        <p className="text-[12px] text-stone-500 mb-3 truncate">{location}</p>

        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-stone-900">
            ETB {priceETB.toLocaleString()}
            <span className="font-normal text-stone-400"> / night</span>
          </p>
          <button className="text-[12px] font-medium text-amber-700 hover:text-amber-800">
            Book again
          </button>
        </div>
      </div>
    </div>
  );
}