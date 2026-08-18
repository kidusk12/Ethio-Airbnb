import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, MapPin, Calendar, Users } from "lucide-react";

const A = "#E8473F";

/**
 * Search bar used on the Home hero.
 * variant="hero"  → absolutely positioned at the bottom of the hero image
 * variant="inline" → renders inline (default)
 */
export default function Search({ variant = "inline" }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [dates, setDates]       = useState("");
  const [guests, setGuests]     = useState("");

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (dates)    params.set("dates", dates);
    if (guests)   params.set("guests", guests);
    navigate(`/explore?${params.toString()}`);
  }

  const bar = (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
    >
      {/* Location */}
      <div className="flex items-center gap-2.5 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
        <MapPin size={16} color={A} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where are you going?"
            className="w-full text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2.5 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
        <Calendar size={16} color={A} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Dates</p>
          <input
            type="text"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            placeholder="Check in – Check out"
            className="w-full text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="flex items-center gap-2.5 flex-1 px-4 py-3 border-b sm:border-b-0 border-gray-100">
        <Users size={16} color={A} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Guests</p>
          <input
            type="text"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="Add guests"
            className="w-full text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="px-3 py-3 flex-shrink-0">
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: A }}
        >
          <SearchIcon size={15} />
          Search
        </button>
      </div>
    </form>
  );

  if (variant === "hero") {
    return (
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8">
        {bar}
      </div>
    );
  }

  return bar;
}
