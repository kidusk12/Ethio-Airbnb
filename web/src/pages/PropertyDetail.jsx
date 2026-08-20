import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Share2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import Calendar from '../components/Calendar';
import { getPublicListing, getListingReviews } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Map backend category slugs → display labels
const CATEGORY_LABELS = {
  apartment:    'Apartment',
  villa:        'Villa',
  hotel:        'Hotel',
  guesthouse:   'Guesthouse',
  private_room: 'Private room',
  unique_stay:  'Unique stay',
};

// Map stored amenity values → readable display labels
function formatAmenity(value) {
  const map = {
    wifi:         'Wi-Fi',
    kitchen:      'Kitchen',
    free_parking: 'Free parking',
    washer:       'Washer',
  };
  return map[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // ── API state ────────────────────────────────────────────────────────────
  const [listing, setListing]         = useState(null);
  const [reviews, setReviews]         = useState([]);
  const [averageRating, setAvgRating] = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [apiError, setApiError]       = useState('');

  // ── UI state ─────────────────────────────────────────────────────────────
  const [checkIn, setCheckIn]                   = useState('');
  const [checkOut, setCheckOut]                 = useState('');
  const [guestsCount, setGuestsCount]           = useState(1);
  const [activePhotoModal, setActivePhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Today string for min date attr
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // ── Fetch listing + reviews ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setIsLoading(true);
    setApiError('');

    (async () => {
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          getPublicListing(id),
          getListingReviews(id),
        ]);

        if (cancelled) return;

        if (listingRes.status === 200) {
          setListing(listingRes.body.data);
        } else if (listingRes.status === 404) {
          setApiError('This listing could not be found.');
        } else {
          setApiError('Failed to load this listing. Please try again.');
        }

        if (reviewsRes.status === 200) {
          setReviews(reviewsRes.body.data?.reviews ?? []);
          setAvgRating(reviewsRes.body.data?.averageRating ?? 0);
        }
      } catch {
        if (!cancelled) setApiError('Network error. Please check your connection.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  // ── Derived values ───────────────────────────────────────────────────────
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    const d = Math.round(diff / 86_400_000);
    return d > 0 ? d : 0;
  }, [checkIn, checkOut]);

  const totalPrice = listing ? listing.pricePerNight * nights : 0;

  const allPhotos = useMemo(() => {
    if (!listing) return [];
    return listing.photos?.length ? listing.photos : [];
  }, [listing]);

  const handleReserve = () => {
    if (!checkIn || !checkOut || nights < 1) return;

    const bookingPath = `/book/${listing.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestsCount}`;

    if (!user) {
      navigate('/login', { state: { from: bookingPath } });
      return;
    }

    navigate(bookingPath);
  };

  // ── Loading / error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Loading listing…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (apiError || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-lg font-semibold text-foreground">{apiError || 'Listing not found.'}</p>
          <Link to="/explore" className="text-primary hover:underline font-medium">Back to explore</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[listing.category] ?? listing.category;
  const displayLocation = `${listing.subCity}, ${listing.city}`;
  const hostInitial = listing.hostName?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-[1240px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={16} /> Back to explore
            </Link>
            <button
              type="button"
              onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); } }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-border bg-white hover:bg-stone-50 transition-colors"
            >
              <Share2 size={13} /> Share
            </button>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-2.5">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
              {averageRating > 0 && (
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <Star size={16} className="fill-primary text-primary" />
                  <span>{averageRating.toFixed(2)}</span>
                  <span className="text-muted-foreground font-normal">
                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin size={15} className="text-primary" />
                {displayLocation}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                {categoryLabel}
              </span>
            </div>
          </div>

          {/* Photo gallery */}
          {allPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden mb-10 h-[320px] md:h-[460px]">
              <div
                className="md:col-span-2 md:row-span-2 relative cursor-pointer group overflow-hidden"
                onClick={() => { setSelectedPhotoIndex(0); setActivePhotoModal(true); }}
              >
                <img src={allPhotos[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              {allPhotos.slice(1, 5).map((src, idx) => (
                <div key={idx} className="hidden md:block relative cursor-pointer group overflow-hidden"
                  onClick={() => { setSelectedPhotoIndex(idx + 1); setActivePhotoModal(true); }}>
                  <img src={src} alt={`${listing.title} ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {idx === 3 && (
                    <div className="absolute bottom-3 right-3 bg-white/95 text-foreground px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
                      View all photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl overflow-hidden mb-10 h-[320px] bg-stone-100 flex items-center justify-center text-muted-foreground">
              No photos available
            </div>
          )}

          {/* Main 2-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            {/* Left column */}
            <div className="space-y-10">
              {/* Host & overview */}
              <div className="pb-8 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                    {hostInitial}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold">
                      {categoryLabel} hosted by {listing.hostName}
                    </h2>
                  </div>
                </div>
                <p className="text-muted-foreground text-[15px]">
                  {listing.maxGuests} guests · {listing.bedrooms} bedrooms · {listing.bathrooms} baths
                </p>
              </div>

              {/* About */}
              {listing.description && (
                <div className="pb-8 border-b border-border">
                  <h2 className="font-serif text-2xl font-bold mb-4">About this place</h2>
                  <p className="text-muted-foreground leading-relaxed text-[15px] whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="pb-8 border-b border-border">
                  <h2 className="font-serif text-2xl font-bold mb-6">What this place offers</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                    {listing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-[15px]">
                        <CheckCircle size={18} className="text-primary flex-shrink-0" />
                        <span>{formatAmenity(amenity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* House rules */}
              {listing.houseRules?.length > 0 && (
                <div className="pb-8 border-b border-border">
                  <h2 className="font-serif text-2xl font-bold mb-4">House rules</h2>
                  <ul className="space-y-2.5">
                    {listing.houseRules.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-[15px] text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Star size={24} className="fill-primary text-primary" />
                    <h2 className="font-serif text-2xl font-bold">
                      {averageRating.toFixed(2)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-5 rounded-2xl bg-stone-50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[15px] text-foreground">{review.guestName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-ET', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} style={{
                              fill: i < review.rating ? '#f59e0b' : '#e5e7eb',
                              color: i < review.rating ? '#f59e0b' : '#e5e7eb',
                            }} />
                          ))}
                        </div>
                        {review.text && (
                          <p className="text-[14px] text-muted-foreground leading-relaxed">"{review.text}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: booking widget */}
            <aside className="bg-white border border-border rounded-3xl p-6 shadow-xl sticky top-24">
              <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <span className="font-serif text-2xl font-bold text-foreground">
                    ETB {listing.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm"> / night</span>
                </div>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    <Star size={14} className="fill-primary text-primary" />
                    <span>{averageRating.toFixed(2)}</span>
                    <span className="text-muted-foreground">({reviews.length})</span>
                  </div>
                )}
              </div>

              {/* Date + guest inputs */}
              <div className="border border-border rounded-2xl overflow-hidden mb-4">
                <div className="grid grid-cols-2 border-b border-border">
                  <div className="p-3 border-r border-border bg-stone-50/50">
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Check-in</label>
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
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Check-out</label>
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
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Guests</label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer mt-1"
                  >
                    {[...Array(listing.maxGuests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReserve}
                disabled={!checkIn || !checkOut || nights < 1}
                className="w-full bg-primary hover:bg-[#c82333] text-white py-3.5 rounded-2xl font-bold text-[16px] shadow-md hover:shadow-lg transition-all mb-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reserve
              </button>

              <p className="text-center text-xs text-muted-foreground mb-4">You won't be charged yet</p>

              {/* Price breakdown — no fees, just nightly total */}
              {nights > 0 && (
                <div className="space-y-3 text-[14px] text-muted-foreground pb-5 border-b border-border">
                  <div className="flex justify-between">
                    <span>ETB {listing.pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
                    <span className="text-foreground font-medium">ETB {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {nights > 0 && (
                <div className="flex justify-between items-center pt-4 text-[16px] font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary text-xl">ETB {totalPrice.toLocaleString()}</span>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* Photo modal */}
      {activePhotoModal && allPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <button type="button" onClick={() => setActivePhotoModal(false)} className="absolute top-6 right-6 text-white hover:text-stone-300 p-2">
            <X size={28} />
          </button>

          {/* Prev / next */}
          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 p-2"
                onClick={() => setSelectedPhotoIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length)}
              >
                <ChevronLeft size={36} />
              </button>
              <button
                type="button"
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 p-2"
                onClick={() => setSelectedPhotoIndex((i) => (i + 1) % allPhotos.length)}
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <img
              src={allPhotos[selectedPhotoIndex]}
              alt="Expanded view"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
          <p className="text-white/60 text-sm mt-3">
            {selectedPhotoIndex + 1} / {allPhotos.length}
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetail;
