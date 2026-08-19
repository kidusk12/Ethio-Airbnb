import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Users, Search as SearchIcon, Minus, Plus } from 'lucide-react';
import Calendar from './Calendar';

const Search = ({ variant = 'default', onSearch }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(2);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  const guestsRef = useRef(null);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target)) {
        setShowGuestsDropdown(false);
      }
      if (checkInRef.current && !checkInRef.current.contains(e.target)) {
        setShowCheckInCalendar(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(e.target)) {
        setShowCheckOutCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ location, guests, checkInDate, checkOutDate });
    } else {
      navigate('/explore');
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const handleCheckInSelect = (date) => {
    setCheckInDate(date);
    setShowCheckInCalendar(false);
    // Automatically focus check-out
    setTimeout(() => setShowCheckOutCalendar(true), 150);
  };

  const handleCheckOutSelect = (date) => {
    if (checkInDate && date < checkInDate) {
      setCheckInDate(date);
      setCheckOutDate(null);
      return;
    }
    setCheckOutDate(date);
    setShowCheckOutCalendar(false);
  };

  // Hero variant - for Home page (bottom dock in hero banner)
  if (variant === 'hero') {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="grid grid-cols-1 md:grid-cols-4 flex-1 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Location */}
            <div className="px-4 py-2 flex items-center gap-3">
              <MapPin size={18} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where in Ethiopia?"
                  className="w-full text-[14px] font-medium text-foreground placeholder:text-muted-foreground/60 bg-transparent border-0 focus:outline-none p-0"
                />
              </div>
            </div>

            {/* Check-In */}
            <div className="relative" ref={checkInRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCheckInCalendar(!showCheckInCalendar);
                  setShowCheckOutCalendar(false);
                  setShowGuestsDropdown(false);
                }}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-gray-50/80 rounded-xl transition-colors"
              >
                <CalendarIcon size={18} className="text-primary flex-shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">
                    Check-in
                  </span>
                  <span className={`text-[14px] ${checkInDate ? 'text-foreground font-semibold' : 'text-muted-foreground/70'}`}>
                    {checkInDate ? formatDate(checkInDate) : 'Add date'}
                  </span>
                </div>
              </button>

              {showCheckInCalendar && (
                <div className="absolute bottom-full left-0 mb-3 z-50">
                  <Calendar
                    selectedDate={checkInDate}
                    onSelectDate={handleCheckInSelect}
                    minDate={new Date()}
                  />
                </div>
              )}
            </div>

            {/* Check-Out */}
            <div className="relative" ref={checkOutRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCheckOutCalendar(!showCheckOutCalendar);
                  setShowCheckInCalendar(false);
                  setShowGuestsDropdown(false);
                }}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-gray-50/80 rounded-xl transition-colors"
              >
                <CalendarIcon size={18} className="text-primary flex-shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">
                    Check-out
                  </span>
                  <span className={`text-[14px] ${checkOutDate ? 'text-foreground font-semibold' : 'text-muted-foreground/70'}`}>
                    {checkOutDate ? formatDate(checkOutDate) : 'Add date'}
                  </span>
                </div>
              </button>

              {showCheckOutCalendar && (
                <div className="absolute bottom-full left-0 mb-3 z-50">
                  <Calendar
                    selectedDate={checkOutDate}
                    rangeStart={checkInDate}
                    onSelectDate={handleCheckOutSelect}
                    minDate={checkInDate || new Date()}
                  />
                </div>
              )}
            </div>

            {/* Guests */}
            <div className="relative" ref={guestsRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGuestsDropdown(!showGuestsDropdown);
                  setShowCheckInCalendar(false);
                  setShowCheckOutCalendar(false);
                }}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-gray-50/80 rounded-xl transition-colors"
              >
                <Users size={18} className="text-primary flex-shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">
                    Guests
                  </span>
                  <span className="text-[14px] font-semibold text-foreground">
                    {guests} {guests === 1 ? 'guest' : 'guests'}
                  </span>
                </div>
              </button>

              {showGuestsDropdown && (
                <div className="absolute bottom-full right-0 mb-3 bg-white rounded-2xl shadow-2xl border border-border p-4 z-50 w-[260px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">Guests</p>
                      <p className="text-[12px] text-muted-foreground">Adults & children</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGuests((c) => Math.max(1, c - 1))}
                        disabled={guests <= 1}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-[15px] font-bold text-foreground w-4 text-center">
                        {guests}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuests((c) => Math.min(16, c + 1))}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Action */}
          <button
            type="button"
            onClick={handleSearch}
            className="bg-primary hover:bg-[#c82333] text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-[14px] shadow-sm transition-all flex-shrink-0"
          >
            <SearchIcon size={17} />
            <span>Search</span>
          </button>
        </div>
      </div>
    );
  }

  // Explore variant - standalone bar
  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm p-2 flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
      <div className="grid grid-cols-1 md:grid-cols-4 flex-1 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Location */}
        <div className="px-5 py-2 flex flex-col justify-center">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
            Location
          </label>
          <div className="flex items-center gap-2">
            <MapPin size={17} className="text-primary flex-shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Addis Ababa, Hawassa..."
              className="w-full bg-transparent border-0 outline-none p-0 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="relative" ref={checkInRef}>
          <button
            type="button"
            onClick={() => {
              setShowCheckInCalendar(!showCheckInCalendar);
              setShowCheckOutCalendar(false);
              setShowGuestsDropdown(false);
            }}
            className="w-full px-5 py-2 flex flex-col justify-center text-left hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Check-in
            </span>
            <div className="flex items-center gap-2">
              <CalendarIcon size={17} className="text-primary flex-shrink-0" />
              <span className={`text-[14px] ${checkInDate ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {checkInDate ? formatDate(checkInDate) : 'Add date'}
              </span>
            </div>
          </button>
          {showCheckInCalendar && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <Calendar
                selectedDate={checkInDate}
                onSelectDate={handleCheckInSelect}
                minDate={new Date()}
              />
            </div>
          )}
        </div>

        {/* Check-out */}
        <div className="relative" ref={checkOutRef}>
          <button
            type="button"
            onClick={() => {
              setShowCheckOutCalendar(!showCheckOutCalendar);
              setShowCheckInCalendar(false);
              setShowGuestsDropdown(false);
            }}
            className="w-full px-5 py-2 flex flex-col justify-center text-left hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Check-out
            </span>
            <div className="flex items-center gap-2">
              <CalendarIcon size={17} className="text-primary flex-shrink-0" />
              <span className={`text-[14px] ${checkOutDate ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {checkOutDate ? formatDate(checkOutDate) : 'Add date'}
              </span>
            </div>
          </button>
          {showCheckOutCalendar && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <Calendar
                selectedDate={checkOutDate}
                rangeStart={checkInDate}
                onSelectDate={handleCheckOutSelect}
                minDate={checkInDate || new Date()}
              />
            </div>
          )}
        </div>

        {/* Guests */}
        <div className="relative" ref={guestsRef}>
          <button
            type="button"
            onClick={() => {
              setShowGuestsDropdown(!showGuestsDropdown);
              setShowCheckInCalendar(false);
              setShowCheckOutCalendar(false);
            }}
            className="w-full px-5 py-2 flex flex-col justify-center text-left hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              Guests
            </span>
            <div className="flex items-center gap-2">
              <Users size={17} className="text-primary flex-shrink-0" />
              <span className="text-[14px] font-semibold text-foreground">
                {guests} {guests === 1 ? 'guest' : 'guests'}
              </span>
            </div>
          </button>

          {showGuestsDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-border p-4 z-50 w-[260px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Guests</p>
                  <p className="text-[12px] text-muted-foreground">Adults & children</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGuests((c) => Math.max(1, c - 1))}
                    disabled={guests <= 1}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[15px] font-bold text-foreground w-4 text-center">
                    {guests}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuests((c) => Math.min(16, c + 1))}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="bg-primary hover:bg-[#c82333] text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-[14px] shadow-sm transition-all lg:min-w-[120px]"
      >
        <SearchIcon size={17} />
        <span>Search</span>
      </button>
    </div>
  );
};

export default Search;
