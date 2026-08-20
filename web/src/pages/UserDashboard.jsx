import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, LayoutGrid, CalendarDays, History,
  Settings as SettingsIcon, ChevronRight, LogOut,
  Wallet, Star, Users, TrendingUp, Clock,
  CheckCircle2, X, PanelLeft, AlertCircle, Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyBookings, cancelBooking, submitReview } from "../lib/api";
import Profile from "./Profile";
import NavBar1 from "../components/NavBar1";

// ── Design tokens ─────────────────────────────────────────────────────────────
const A      = "#E8473F";
const A_DARK = "#C73B34";
const A_LITE = "#fdf2f2";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
};

const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  return Math.round((new Date(b) - new Date(a)) / 86_400_000);
};

/** Map backend booking status to a display-friendly value. */
function resolveDisplayStatus(booking) {
  if (booking.status === 'cancelled') return 'cancelled';
  if (booking.status === 'pending_payment') return 'pending';
  if (booking.status === 'confirmed') {
    const checkOut = new Date(booking.checkOut);
    const now = new Date();
    if (checkOut < now) return 'completed';
    const checkIn = new Date(booking.checkIn);
    if (checkIn <= now) return 'active';
    return 'upcoming';
  }
  return 'upcoming';
}

const STATUS_MAP = {
  upcoming:        { color: "#2563eb", bg: "#eff6ff",   label: "Upcoming" },
  active:          { color: A,         bg: A_LITE,       label: "Active now" },
  pending:         { color: "#d97706", bg: "#fffbeb",    label: "Awaiting Payment" },
  completed:       { color: "#6b7280", bg: "#f3f4f6",   label: "Completed" },
  cancelled:       { color: "#dc2626", bg: "#fef2f2",   label: "Cancelled" },
};

// ── Review Modal ───────────────────────────────────────────────────────────────
function ReviewModal({ booking, onClose, onSubmitted }) {
  const { token } = useAuth();
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [text, setText]         = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const overlayRef              = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => { overlayRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!rating) return;
    setIsSubmitting(true);
    setError("");
    try {
      const { status, body } = await submitReview(token, booking.id, { rating, text: text.trim() || undefined });
      if (status === 201) {
        onSubmitted(booking.id);
        onClose();
      } else {
        setError(body?.message || "Failed to submit review. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const active = hovered || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      ref={overlayRef} tabIndex={-1}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-5" style={{ background: `linear-gradient(135deg, ${A} 0%, #c0392b 100%)` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white/70 text-[12px] font-medium mb-0.5">Share your experience</p>
              <h3 className="font-serif text-[22px] text-white leading-tight">{booking.listingTitle}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors" aria-label="Close">
              <X size={15} color="#fff" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />{error}
            </div>
          )}

          <div className="mb-5">
            <p className="text-[13px] font-semibold text-gray-700 mb-3">Your rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)} className="transition-transform hover:scale-110 focus:outline-none">
                  <Star size={32} strokeWidth={1.5} style={{ fill: n <= active ? "#f59e0b" : "transparent", color: n <= active ? "#f59e0b" : "#d1d5db", transition: "all 0.12s ease" }} />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-[13px] font-medium text-gray-500">{["","Poor","Fair","Good","Very good","Excellent"][rating]}</span>}
            </div>
            {!rating && <p className="text-[11px] text-gray-400 mt-2">Click a star to rate</p>}
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Your review (optional)</label>
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="Tell others what you loved about this stay…" rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition-shadow" />
            <p className="text-[11px] text-gray-400 mt-1 text-right">{text.length}/500</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={!rating || isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: rating && !isSubmitting ? A : "#d1d5db", cursor: rating && !isSubmitting ? "pointer" : "not-allowed" }}>
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : "Submit review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero Banner ────────────────────────────────────────────────────────────────
function HeroBanner({ guestName, stats, onStatClick }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="relative rounded-3xl overflow-hidden mb-8" style={{ background: `linear-gradient(135deg, ${A} 0%, #c0392b 55%, #922b21 100%)`, minHeight: 200 }}>
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "#fff" }} />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
      <div className="relative px-7 pt-7 pb-7">
        <p className="text-white/70 text-[13px] font-medium mb-1">{greeting}</p>
        <h1 className="font-serif text-[28px] md:text-[32px] text-white font-normal leading-tight mb-1">{guestName}</h1>
        <p className="text-white/60 text-[13px] mb-7">Here's your travel overview</p>
        <div className="flex flex-wrap gap-3">
          {stats.map(({ icon: Icon, label, value, tab }) => (
            <button key={label} onClick={() => onStatClick(tab)}
              className="flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl px-4 py-3 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><Icon size={16} color="#fff" strokeWidth={2} /></div>
              <div>
                <p className="text-white font-bold text-[20px] leading-none tabular-nums">{value}</p>
                <p className="text-white/65 text-[11px] mt-0.5 whitespace-nowrap">{label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Booking Card ───────────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel }) {
  const displayStatus = resolveDisplayStatus(booking);
  const s = STATUS_MAP[displayStatus] ?? STATUS_MAP.upcoming;
  const n = nightsBetween(booking.checkIn, booking.checkOut);
  const [cancelling, setCancelling] = useState(false);

  const canCancel = displayStatus === 'upcoming' || displayStatus === 'pending';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
      <div className="sm:w-56 flex-shrink-0 relative overflow-hidden">
        {booking.coverPhoto ? (
          <img src={booking.coverPhoto} alt={booking.listingTitle} className="w-full h-52 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-52 sm:h-full bg-stone-100 flex items-center justify-center text-muted-foreground text-sm">{booking.listingTitle}</div>
        )}
        <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg + "e8", color: s.color }}>{s.label}</span>
      </div>
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-semibold text-gray-900 leading-snug mb-2">{booking.listingTitle}</h3>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-gray-500">
          <span className="flex items-center gap-1.5"><CalendarDays size={13} color="#9ca3af" />{fmtDate(booking.checkIn)} — {fmtDate(booking.checkOut)}<span className="font-medium text-gray-400"> · {n} night{n !== 1 ? "s" : ""}</span></span>
          <span className="flex items-center gap-1.5"><Users size={13} color="#9ca3af" />{booking.guestCount} guest{booking.guestCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-right">
            <p className="text-[17px] font-bold text-gray-900 tabular-nums">ETB {Number(booking.totalPrice).toLocaleString()}</p>
            <p className="text-[11px] text-gray-400">total</p>
          </div>
          {canCancel && (
            <button onClick={async () => { setCancelling(true); await onCancel(booking.id); setCancelling(false); }}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[12px] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
              {cancelling ? "Cancelling…" : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Past Trip Card ─────────────────────────────────────────────────────────────
function PastTripCard({ booking, onReview }) {
  const reviewed = booking.hasReviewed;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-44 overflow-hidden">
        {booking.coverPhoto
          ? <img src={booking.coverPhoto} alt={booking.listingTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-stone-100 flex items-center justify-center text-muted-foreground text-sm">{booking.listingTitle}</div>}
        {reviewed && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
            <CheckCircle2 size={11} color="#22c55e" />
            <span className="text-[10px] font-semibold text-gray-600">Reviewed</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-[14px] font-semibold text-gray-900 truncate mb-1">{booking.listingTitle}</h4>
        <div className="flex items-center gap-1 text-gray-400 mb-3">
          <Clock size={11} /><span className="text-[12px]">{fmtDate(booking.checkIn)} – {fmtDate(booking.checkOut)}</span>
        </div>
        {reviewed ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
            ))}
            <span className="text-[11px] text-gray-400 ml-1.5">Reviewed</span>
          </div>
        ) : (
          <button onClick={() => onReview(booking)}
            className="w-full py-2 rounded-xl text-[12px] font-semibold text-white transition-opacity hover:opacity-85"
            style={{ background: A }}>
            Write a review
          </button>
        )}
      </div>
    </div>
  );
}

// ── Heading ────────────────────────────────────────────────────────────────────
function Heading({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[17px] font-semibold text-gray-900">{title}</h2>
      {action && (
        <button onClick={action.fn} className="text-[12px] font-semibold flex items-center gap-0.5 hover:opacity-70 transition-opacity" style={{ color: A }}>
          {action.label} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

function Empty({ icon: Icon, text, cta, onCta }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
      {Icon && <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: A_LITE }}><Icon size={22} style={{ color: A }} strokeWidth={1.5} /></div>}
      <p className="text-[14px] text-gray-400 max-w-[220px] leading-relaxed">{text}</p>
      {cta && <button onClick={onCta} className="mt-1 text-[13px] font-semibold px-5 py-2 rounded-full text-white" style={{ background: A }}>{cta}</button>}
    </div>
  );
}

// ── Dashboard root ─────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]                   = useState("overview");
  const [bookings, setBookings]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [fetchError, setFetchError]     = useState("");
  const [reviewedIds, setReviewedIds]   = useState(new Set());
  const [reviewBooking, setReviewBooking] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const guestName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Guest';
  const guestFirstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : 'Guest');
  const initialLetter = guestFirstName.charAt(0).toUpperCase();

  // ── Fetch bookings ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    getMyBookings(token)
      .then(({ status, body }) => {
        if (status === 200) setBookings(body.data?.bookings ?? []);
        else setFetchError('Failed to load your bookings.');
      })
      .catch(() => setFetchError('Network error. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  // ── Derived lists ────────────────────────────────────────────────────────
  const activeBookings = useMemo(() =>
    bookings.filter((b) => ['upcoming', 'active', 'pending'].includes(resolveDisplayStatus(b))),
    [bookings]
  );

  const completedBookings = useMemo(() =>
    bookings.filter((b) => resolveDisplayStatus(b) === 'completed'),
    [bookings]
  );

  const cancelledBookings = useMemo(() =>
    bookings.filter((b) => resolveDisplayStatus(b) === 'cancelled'),
    [bookings]
  );

  // Past trips = completed bookings
  const pastTrips = useMemo(() =>
    completedBookings.map((b) => ({
      ...b,
      hasReviewed: b.hasReviewed || reviewedIds.has(b.id),
    })),
    [completedBookings, reviewedIds]
  );

  const totalSpent = useMemo(() =>
    bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0),
    [bookings]
  );

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleCancel = async (bookingId) => {
    try {
      const { status } = await cancelBooking(token, bookingId);
      if (status === 200) {
        setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      }
    } catch {
      // silent — user sees no update, can retry
    }
  };

  const handleReviewSubmitted = (bookingId) => {
    setReviewedIds((prev) => new Set([...prev, bookingId]));
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, hasReviewed: true } : b));
  };

  const stats = useMemo(() => [
    { icon: CalendarDays, label: "Upcoming trips",  value: activeBookings.length,  tab: "bookings" },
    { icon: Wallet,       label: "Spent on stays",  value: totalSpent > 0 ? `${(totalSpent / 1000).toFixed(0)}K ETB` : '0 ETB', tab: "bookings" },
  ], [activeBookings, totalSpent]);

  const sidebarLinks = [
    { label: 'Overview',        icon: LayoutGrid,   tab: 'overview' },
    { label: 'Bookings',        icon: CalendarDays, tab: 'bookings', count: activeBookings.length },
    { label: 'Past trips',      icon: History,      tab: 'trips',    count: pastTrips.length },
    { label: 'Profile Settings',icon: SettingsIcon, tab: 'settings' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f7f6f4' }}>
      <NavBar1
        userName={guestName}
        onLogout={() => { logout(); navigate("/"); }}
        dashboardLabel="My Dashboard"
        dashboardLink="/guest_dashboard"
        showProfileLink={false}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-[100] flex flex-col justify-between p-5 transition-transform duration-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white font-bold text-[15px] flex items-center justify-center shadow-sm">{initialLetter}</div>
              <div>
                <h3 className="font-bold text-[14px] text-foreground leading-tight">{guestName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full mt-0.5">
                  <CheckCircle2 size={10} /> Guest
                </span>
              </div>
            </div>
            <button type="button" onClick={() => setIsSidebarOpen(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted-foreground"><X size={16} /></button>
          </div>
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.tab;
              return (
                <button key={item.label} type="button"
                  onClick={() => { setTab(item.tab); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-foreground hover:bg-gray-100/80'}`}>
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-primary flex-shrink-0'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-border">
          <button type="button" onClick={() => { setIsSidebarOpen(false); logout(); navigate('/'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs transition-opacity md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      {isSidebarOpen && <div className="fixed inset-0 z-[90] hidden md:block" onClick={() => setIsSidebarOpen(false)} />}

      <div className={`transition-all duration-200 ${isSidebarOpen ? 'md:ml-72' : ''}`}>
        <div className="pt-20 pb-2 px-6 max-w-[1200px] mx-auto flex items-center justify-between">
          <button type="button" onClick={() => setIsSidebarOpen(true)} title="Open guest menu"
            className="w-10 h-10 rounded-2xl bg-white border border-border hover:border-primary text-foreground flex items-center justify-center shadow-sm hover:shadow transition-all group">
            <PanelLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>

        {reviewBooking && (
          <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSubmitted={handleReviewSubmitted} />
        )}

        <main className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-10 pt-4 pb-24">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
              <Loader2 size={28} className="animate-spin text-primary" />
              <span>Loading your bookings…</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
              <AlertCircle size={32} className="text-red-500" />
              <p className="text-red-600 font-semibold">{fetchError}</p>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <HeroBanner guestName={guestFirstName} stats={stats} onStatClick={setTab} />

                  <div className="space-y-10">
                    <section>
                      <Heading title="Your trips" action={{ label: "All bookings", fn: () => setTab("bookings") }} />
                      {activeBookings.length > 0
                        ? <div className="space-y-5">{activeBookings.map((b) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}</div>
                        : <Empty icon={CalendarDays} text="No upcoming trips yet." cta="Explore stays" onCta={() => navigate('/explore')} />}
                    </section>

                    {pastTrips.length > 0 && (
                      <section>
                        <Heading title="Past trips" action={{ label: "View all", fn: () => setTab("trips") }} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {pastTrips.slice(0, 3).map((b) => <PastTripCard key={b.id} booking={b} onReview={setReviewBooking} />)}
                        </div>
                      </section>
                    )}

                    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: `linear-gradient(120deg, ${A} 0%, #c0392b 100%)` }}>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><TrendingUp size={20} color="#fff" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-[14px]">Discover more of Ethiopia</p>
                        <p className="text-white/70 text-[12px] mt-0.5">Lalibela · Gondar · Axum · Harar · Omo Valley</p>
                      </div>
                      <Link to="/explore" className="flex-shrink-0 bg-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: A }}>Explore</Link>
                    </div>
                  </div>
                </>
              )}

              {tab === "bookings" && (
                <div className="space-y-8">
                  {activeBookings.length > 0 && (
                    <section>
                      <Heading title="Upcoming & active" />
                      <div className="space-y-5">{activeBookings.map((b) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}</div>
                    </section>
                  )}
                  {completedBookings.length > 0 && (
                    <section>
                      <Heading title="Completed" />
                      <div className="space-y-5">{completedBookings.map((b) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}</div>
                    </section>
                  )}
                  {cancelledBookings.length > 0 && (
                    <section>
                      <Heading title="Cancelled" />
                      <div className="space-y-5">{cancelledBookings.map((b) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}</div>
                    </section>
                  )}
                  {bookings.length === 0 && <Empty icon={CalendarDays} text="No bookings yet." cta="Explore stays" onCta={() => navigate('/explore')} />}
                </div>
              )}

              {tab === "trips" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Trips completed",  value: pastTrips.length },
                      { label: "Reviews left",      value: pastTrips.filter((t) => t.hasReviewed).length },
                      { label: "Awaiting review",   value: pastTrips.filter((t) => !t.hasReviewed).length, accent: pastTrips.filter((t) => !t.hasReviewed).length > 0 },
                      { label: "Avg. rating given", value: "—" },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1" style={{ borderColor: accent ? A + "55" : undefined, background: accent ? A_LITE : undefined }}>
                        <p className="text-[26px] font-bold tabular-nums" style={{ color: accent ? A : "#111827" }}>{value}</p>
                        <p className="text-[12px] text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  {pastTrips.length > 0 ? (
                    <section>
                      <Heading title="All past trips" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {pastTrips.map((b) => <PastTripCard key={b.id} booking={b} onReview={setReviewBooking} />)}
                      </div>
                    </section>
                  ) : (
                    <Empty icon={History} text="Your completed stays will appear here." />
                  )}
                </div>
              )}

              {tab === "settings" && (
                <Profile guestName={guestFirstName} guestEmail={user?.email} embedded />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
