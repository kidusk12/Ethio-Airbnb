import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Share2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
} from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import Calendar from '../components/Calendar';
import { allProperties } from '../data/properties';
import { useAuth } from '../context/AuthContext';

const PropertyDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Find property by slug, fallback to hawassa-lake-villa if not found
  const property = useMemo(() => {
    const found = allProperties.find((p) => p.slug === slug);
    return found || allProperties[0];
  }, [slug]);

  // Date selection state
  const [checkIn, setCheckIn] = useState('2026-09-12');
  const [checkOut, setCheckOut] = useState('2026-09-16');
  const [guestsCount, setGuestsCount] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Today's date string for min attribute (YYYY-MM-DD) — use local time not UTC
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  // Calculate nights
  const nights = useMemo(() => {
    try {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diffTime = outDate - inDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 4;
    } catch {
      return 4;
    }
  }, [checkIn, checkOut]);

  const basePrice = property.price * nights;
  const cleaningFee = Math.round(property.price * 0.12);
  const serviceFee = Math.round(property.price * 0.15);
  const totalPrice = basePrice + cleaningFee + serviceFee;

  const handleReserve = () => {
    navigate(`/book/${property.slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestsCount}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-[1240px] mx-auto">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} /> Back to explore
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-border bg-white hover:bg-stone-50 transition-colors"
              >
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>

          {/* Title and Top Subheader */}
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-2.5">
              {property.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Star size={16} className="fill-primary text-primary" />
                <span>{property.rating}</span>
                <span className="text-muted-foreground font-normal">
                  ({property.reviews} reviews)
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin size={15} className="text-primary" />
                {property.detailedLocation || property.location}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                {property.type}
              </span>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden mb-10 h-[320px] md:h-[460px]">
            {/* Primary Large Image */}
            <div
              className="md:col-span-2 md:row-span-2 relative cursor-pointer group overflow-hidden"
              onClick={() => {
                setSelectedPhotoIndex(0);
                setActivePhotoModal(true);
              }}
            >
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Sub images */}
            {property.gallery &&
              property.gallery.slice(1, 5).map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="hidden md:block relative cursor-pointer group overflow-hidden"
                  onClick={() => {
                    setSelectedPhotoIndex(idx + 1);
                    setActivePhotoModal(true);
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={`${property.name} ${idx + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  {idx === 3 && (
                    <div className="absolute bottom-3 right-3 bg-white/95 text-foreground px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
                      View all photos
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Main Content Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            {/* Left Column: Details */}
            <div className="space-y-10">
              {/* Host & Property Overview Box */}
              <div className="pb-8 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                    {property.host.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold">
                      {property.type} hosted by {property.host.name}
                    </h2>
                    <p className="text-xs text-primary font-semibold">
                      {property.host.joined} {property.host.superhost && '· ★ Superhost'}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-[15px]">
                  {property.guests} guests · {property.bedrooms} bedrooms · {property.beds} beds · {property.bathrooms} baths
                </p>
              </div>

              {/* Availability Calendar Section */}
              <div className="pb-8 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-2xl font-bold">Availability</h2>
                  <span className="text-sm text-muted-foreground">Prices shown in ETB</span>
                </div>
                <div className="p-6 bg-white border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{nights} nights in {property.location}</h3>
                    <p className="text-sm text-muted-foreground">12 Sep 2026 – 16 Sep 2026</p>
                  </div>
                  <Calendar
                    selectedDate={new Date('2026-09-12')}
                    rangeStart={new Date('2026-09-12')}
                    rangeEnd={new Date('2026-09-16')}
                    className="w-full sm:w-[280px]"
                  />
                </div>
              </div>

              {/* About this place */}
              <div className="pb-8 border-b border-border">
                <h2 className="font-serif text-2xl font-bold mb-4">About this place</h2>
                <p className="text-muted-foreground leading-relaxed text-[15px] whitespace-pre-line">
                  {property.about}
                </p>
              </div>

              {/* What this place offers */}
              <div className="pb-8 border-b border-border">
                <h2 className="font-serif text-2xl font-bold mb-6">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[15px]">
                      <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* House rules */}
              <div className="pb-8 border-b border-border">
                <h2 className="font-serif text-2xl font-bold mb-4">House rules</h2>
                <ul className="space-y-2.5">
                  {property.houseRules.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-[15px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Star size={24} className="fill-primary text-primary" />
                  <h2 className="font-serif text-2xl font-bold">
                    {property.rating} · {property.reviews} reviews
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {property.reviewList.map((review, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-stone-50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[15px] text-foreground">{review.author}</span>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        "{review.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Booking Widget */}
            <aside className="bg-white border border-border rounded-3xl p-6 shadow-xl sticky top-24">
              <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <span className="font-serif text-2xl font-bold text-foreground">
                    ETB {property.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Star size={14} className="fill-primary text-primary" />
                  <span>{property.rating}</span>
                  <span className="text-muted-foreground">({property.reviews})</span>
                </div>
              </div>

              {/* Booking Dates Inputs */}
              <div className="border border-border rounded-2xl overflow-hidden mb-4">
                <div className="grid grid-cols-2 border-b border-border">
                  <div className="p-3 border-r border-border bg-stone-50/50">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      min={todayStr}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer mt-1"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                  <div className="p-3 bg-stone-50/50">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || todayStr}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer mt-1"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50/50">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Guests
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer mt-1"
                  >
                    {[...Array(property.guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reserve Button */}
              <button
                type="button"
                onClick={handleReserve}
                className="w-full bg-primary hover:bg-[#c82333] text-white py-3.5 rounded-2xl font-bold text-[16px] shadow-md hover:shadow-lg transition-all mb-3 cursor-pointer"
              >
                Reserve
              </button>

              <p className="text-center text-xs text-muted-foreground mb-6">
                You won't be charged yet
              </p>

              {/* Price Breakdown */}
              <div className="space-y-3 text-[14px] text-muted-foreground pb-5 border-b border-border">
                <div className="flex justify-between">
                  <span className="underline">
                    ETB {property.price.toLocaleString()} x {nights} nights
                  </span>
                  <span className="text-foreground font-medium">
                    ETB {basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Cleaning fee</span>
                  <span className="text-foreground font-medium">
                    ETB {cleaningFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">EthioStays service fee</span>
                  <span className="text-foreground font-medium">
                    ETB {serviceFee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 text-[16px] font-bold text-foreground">
                <span>Total before taxes</span>
                <span className="text-primary text-xl">
                  ETB {totalPrice.toLocaleString()}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Reservation Confirmation Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center border border-border shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2">Reservation Request Sent!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your booking request for <span className="font-semibold text-foreground">{property.name}</span> ({nights} nights) has been forwarded to {property.host.name}.
            </p>
            <div className="bg-stone-50 rounded-2xl p-4 text-left text-xs space-y-2 mb-6 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-semibold text-foreground">{checkIn} to {checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests:</span>
                <span className="font-semibold text-foreground">{guestsCount} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">ETB {totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBookingSuccess(false)}
              className="w-full bg-primary hover:bg-[#c82333] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}




      {/* Photo View Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setActivePhotoModal(false)}
            className="absolute top-6 right-6 text-white hover:text-stone-300 p-2"
          >
            <X size={28} />
          </button>
          <div className="max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <img
              src={property.gallery ? property.gallery[selectedPhotoIndex] || property.image : property.image}
              alt="Expanded view"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetail;
