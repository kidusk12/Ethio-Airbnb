import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, LayoutGrid, CalendarDays, History,
  Settings as SettingsIcon, ChevronRight, ShieldCheck,
  CreditCard, LifeBuoy, LogOut, Wallet, Star, Users,
  TrendingUp, Clock, CheckCircle2, X, Home, Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  mockBookings, mockMessages, mockSavedStays,
  mockPastTrips, mockGuest,
} from "../data/mockDashboardData";

// ─── Design tokens ────────────────────────────────────────────────────────────
const A      = "#E8473F";
const A_DARK = "#C73B34";
const A_LITE = "#fdf2f2";
const GRAY   = "#6b7280";
const STONE  = "#f7f6f4";

const TABS = [
  { id: "overview",  label: "Overview",   icon: LayoutGrid   },
  { id: "bookings",  label: "Bookings",   icon: CalendarDays },
  { id: "trips",     label: "Past trips", icon: History      },
  { id: "settings",  label: "Settings",   icon: SettingsIcon },
];

const STATUS_MAP = {
  upcoming:  { color: "#2563eb", bg: "#eff6ff", label: "Upcoming"   },
  active:    { color: A,         bg: A_LITE,    label: "Active now" },
  completed: { color: "#6b7280", bg: "#f3f4f6", label: "Completed"  },
  cancelled: { color: "#dc2626", bg: "#fef2f2", label: "Cancelled"  },
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
const nightsBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86_400_000);

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: A }}>
        <Home size={18} color="#fff" strokeWidth={2.25} />
      </div>
      <span className="text-[19px] font-bold tracking-tight text-gray-900 whitespace-nowrap leading-none">
        Ethio<span style={{ color: A }}>Stays</span>
      </span>
    </Link>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ trip, onClose, onSubmit }) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText]       = useState("");
  const overlayRef            = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => { overlayRef.current?.focus(); }, []);

  function handleSubmit() {
    if (!rating) return;
    onSubmit({ tripId: trip.id, rating, text });
    onClose();
  }

  const active = hovered || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      ref={overlayRef}
      tabIndex={-1}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5 et-pattern" style={{ background: `linear-gradient(135deg, ${A} 0%, #c0392b 100%)` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white/70 text-[12px] font-medium mb-0.5">Share your experience</p>
              <h3 className="font-display text-[22px] text-white leading-tight">{trip.propertyName}</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin size={12} color="rgba(255,255,255,0.65)" />
                <span className="text-white/65 text-[12px]">{trip.location}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5" aria-label="Close">
              <X size={15} color="#fff" />
            </button>
          </div>
          <div className="mt-4 rounded-2xl overflow-hidden h-28 w-full">
            <img src={trip.image} alt={trip.propertyName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
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
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Your review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell others what you loved about this stay…"
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition-shadow"
            />
            <p className="text-[11px] text-gray-400 mt-1 text-right">{text.length}/500</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={!rating} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: rating ? A : "#d1d5db", cursor: rating ? "pointer" : "not-allowed" }}>
              Submit review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ guestName, onAvatarClick }) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-100">
      <div className="h-full max-w-[1400px] mx-auto flex items-center justify-between px-5 lg:px-8">
        <Logo />

        {/* Airbnb-style pill: hamburger lines + avatar circle */}
        <button
          onClick={onAvatarClick}
          className="flex items-center gap-2.5 border border-gray-200 rounded-full pl-3 pr-0.5 py-0.5 hover:shadow-md transition-shadow bg-white focus:outline-none"
          aria-label="Open menu"
        >
          <div className="flex flex-col gap-[4.5px]">
            <span className="block w-[15px] h-[1.5px] rounded-full" style={{ background: "#222" }} />
            <span className="block w-[15px] h-[1.5px] rounded-full" style={{ background: "#222" }} />
            <span className="block w-[15px] h-[1.5px] rounded-full" style={{ background: "#222" }} />
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0"
            style={{ background: "#717171" }}
          >
            {guestName?.[0]?.toUpperCase() || "G"}
          </div>
        </button>
      </div>
    </header>
  );
}

// ─── Profile dropdown (true Airbnb style) ────────────────────────────────────
function DashboardPanel({ guestName, activeTab, onSelect, onLogout, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const topItems = [
    { id: "overview",  label: "Overview"   },
    { id: "bookings",  label: "Bookings"   },
  ];
  const bottomItems = [
    { id: "trips",    label: "Past trips" },
    { id: "settings", label: "Settings"   },
  ];

  function Item({ id, label }) {
    const active = activeTab === id;
    return (
      <button
        onClick={() => { onSelect(id); onClose(); }}
        className="w-full text-left px-4 py-3 text-[14px] transition-colors rounded-none"
        style={{
          color:           active ? A : "#222222",
          fontWeight:      active ? 600 : 400,
          background:      "transparent",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f7f7f7"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        {label}
      </button>
    );
  }

  return (
    <>
      {/* Transparent backdrop — click outside to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown card anchored to top-right */}
      <div
        className="fixed z-50 bg-white rounded-2xl overflow-hidden"
        style={{
          top:       72,
          right:     20,
          width:     240,
          boxShadow: "0 2px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
        role="menu"
      >
        {/* User identity */}
        <div className="px-4 py-3.5 border-b border-gray-100">
          <p className="text-[13px] font-semibold text-gray-900">{guestName}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Guest · EthioStays</p>
        </div>

        {/* Top nav group */}
        <div className="py-1 border-b border-gray-100">
          {topItems.map(({ id, label }) => <Item key={id} id={id} label={label} />)}
        </div>

        {/* Bottom nav group */}
        <div className="py-1 border-b border-gray-100">
          {bottomItems.map(({ id, label }) => <Item key={id} id={id} label={label} />)}
        </div>

        {/* Log out */}
        <div className="py-1">
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-[14px] text-gray-700 transition-colors"
            style={{ fontWeight: 400 }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f7f7f7"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({ guestName, stats, onStatClick }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative rounded-3xl overflow-hidden mb-8 et-pattern" style={{ background: `linear-gradient(135deg, ${A} 0%, #c0392b 55%, #922b21 100%)`, minHeight: 200 }}>
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "#fff" }} />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
      <div className="relative px-7 pt-7 pb-7">
        <p className="text-white/70 text-[13px] font-medium mb-1">{greeting}</p>
        <h1 className="font-display text-[28px] md:text-[32px] text-white font-normal leading-tight mb-1">{guestName}</h1>
        <p className="text-white/60 text-[13px] mb-7">Here's your travel overview</p>
        <div className="flex flex-wrap gap-3">
          {stats.map(({ icon: Icon, label, value, tab }) => (
            <button key={label} onClick={() => onStatClick(tab)} className="flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl px-4 py-3 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} color="#fff" strokeWidth={2} />
              </div>
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

// ─── Section heading ──────────────────────────────────────────────────────────
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

// ─── Empty ────────────────────────────────────────────────────────────────────
function Empty({ icon: Icon, text, cta, onCta }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: A_LITE }}>
          <Icon size={22} style={{ color: A }} strokeWidth={1.5} />
        </div>
      )}
      <p className="text-[14px] text-gray-400 max-w-[220px] leading-relaxed">{text}</p>
      {cta && (
        <button onClick={onCta} className="mt-1 text-[13px] font-semibold px-5 py-2 rounded-full text-white" style={{ background: A }}>{cta}</button>
      )}
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking }) {
  const { propertyName, propertyType, location, image, checkIn, checkOut, guests, totalPriceETB, status, hostName } = booking;
  const s = STATUS_MAP[status] ?? STATUS_MAP.upcoming;
  const n = nightsBetween(checkIn, checkOut);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
      <div className="sm:w-56 flex-shrink-0 relative overflow-hidden">
        <img src={image} alt={propertyName} className="w-full h-52 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg + "e8", color: s.color }}>{s.label}</span>
      </div>
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: A }}>{propertyType}</p>
          <h3 className="text-[17px] font-semibold text-gray-900 leading-snug mb-2">{propertyName}</h3>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin size={13} /><span className="text-[13px]">{location}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-gray-500">
          <span className="flex items-center gap-1.5"><CalendarDays size={13} color="#9ca3af" />{fmtDate(checkIn)} — {fmtDate(checkOut)}<span className="font-medium text-gray-400"> · {n} night{n !== 1 ? "s" : ""}</span></span>
          <span className="flex items-center gap-1.5"><Users size={13} color="#9ca3af" />{guests} guest{guests !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: A }}>{hostName?.[0]?.toUpperCase()}</div>
            <div>
              <p className="text-[10px] text-gray-400 leading-none">Hosted by</p>
              <p className="text-[12px] font-semibold text-gray-700">{hostName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[17px] font-bold text-gray-900 tabular-nums">ETB {totalPriceETB.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400">total charged</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Past Trip Card ───────────────────────────────────────────────────────────
function PastTripCard({ trip, onReview }) {
  const { id, propertyName, location, image, stayedDates, reviewed, myRating } = trip;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-44 overflow-hidden">
        <img src={image} alt={propertyName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {reviewed && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
            <CheckCircle2 size={11} color="#22c55e" />
            <span className="text-[10px] font-semibold text-gray-600">Reviewed</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-[14px] font-semibold text-gray-900 truncate mb-1">{propertyName}</h4>
        <div className="flex items-center gap-1 text-gray-400 mb-1">
          <MapPin size={11} /><span className="text-[12px] truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 mb-3">
          <Clock size={11} /><span className="text-[12px]">{stayedDates}</span>
        </div>
        {reviewed ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} style={{ fill: i < (myRating ?? 0) ? "#f59e0b" : "#e5e7eb", color: i < (myRating ?? 0) ? "#f59e0b" : "#e5e7eb" }} />
            ))}
            <span className="text-[11px] text-gray-400 ml-1.5">{myRating}/5</span>
          </div>
        ) : (
          <button
            onClick={() => onReview?.(trip)}
            className="w-full py-2 rounded-xl text-[12px] font-semibold text-white transition-opacity hover:opacity-85"
            style={{ background: A }}
          >
            Write a review
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ onNav, onOpenReview }) {
  const upcoming = mockBookings.filter((b) => b.status === "upcoming" || b.status === "active");
  return (
    <div className="space-y-10">
      <section>
        <Heading title="Your trips" action={{ label: "All bookings", fn: () => onNav("bookings") }} />
        {upcoming.length
          ? <div className="space-y-5">{upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
          : <Empty icon={CalendarDays} text="No upcoming trips yet." cta="Explore stays" />
        }
      </section>

      <section>
        <Heading title="Past trips" action={{ label: "View all", fn: () => onNav("trips") }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockPastTrips.map((t) => <PastTripCard key={t.id} trip={t} onReview={onOpenReview} />)}
        </div>
      </section>

      <div className="rounded-2xl p-5 flex items-center gap-4 et-pattern" style={{ background: `linear-gradient(120deg, ${A} 0%, #c0392b 100%)` }}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={20} color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[14px]">Discover more of Ethiopia</p>
          <p className="text-white/70 text-[12px] mt-0.5">Lalibela · Gondar · Axum · Harar · Omo Valley</p>
        </div>
        <Link to="/explore" className="flex-shrink-0 bg-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: A }}>Explore</Link>
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const upcoming  = mockBookings.filter((b) => b.status === "upcoming" || b.status === "active");
  const completed = mockBookings.filter((b) => b.status === "completed");
  const cancelled = mockBookings.filter((b) => b.status === "cancelled");

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <Heading title="Upcoming & active" />
          <div className="space-y-5">{upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
        </section>
      )}
      {completed.length > 0 && (
        <section>
          <Heading title="Completed" />
          <div className="space-y-5">{completed.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
        </section>
      )}
      {cancelled.length > 0 && (
        <section>
          <Heading title="Cancelled" />
          <div className="space-y-5">{cancelled.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
        </section>
      )}
      {mockBookings.length === 0 && <Empty icon={CalendarDays} text="No bookings yet." cta="Explore stays" />}
    </div>
  );
}

// ─── Trips Tab ────────────────────────────────────────────────────────────────
function TripsTab({ onOpenReview }) {
  const reviewed   = mockPastTrips.filter((t) => t.reviewed);
  const unreviewed = mockPastTrips.filter((t) => !t.reviewed);

  const avgRating = reviewed.length
    ? (reviewed.reduce((s, t) => s + (t.myRating || 0), 0) / reviewed.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Trips completed", value: mockPastTrips.length,    accent: false },
          { label: "Reviews left",    value: reviewed.length,         accent: false },
          { label: "Awaiting review", value: unreviewed.length,       accent: unreviewed.length > 0 },
          { label: "Avg. rating",     value: avgRating ?? "—",        accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1" style={{ borderColor: accent ? A + "55" : undefined, background: accent ? A_LITE : undefined }}>
            <p className="text-[26px] font-bold tabular-nums" style={{ color: accent ? A : "#111827" }}>{value}</p>
            <p className="text-[12px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      {mockPastTrips.length > 0 ? (
        <section>
          <Heading title="All past trips" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {mockPastTrips.map((t) => <PastTripCard key={t.id} trip={t} onReview={onOpenReview} />)}
          </div>
        </section>
      ) : (
        <Empty icon={History} text="Your completed stays will appear here." />
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ guestName, guestEmail }) {
  const [profile, setProfile] = useState({
    name:            guestName  || "Kidus",
    email:           guestEmail || "kidus@ethiostays.com",
    avatar:          null,
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("avatar", reader.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    setProfile((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    setSaved(true);
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8473F] transition-colors bg-white";
  const labelCls = "block text-[14px] font-semibold text-gray-800 mb-1.5";

  return (
    /* Outer wrapper — full width, card centred */
    <div className="flex justify-center">
      <div className="w-full max-w-[560px] rounded-3xl overflow-hidden shadow-sm border border-gray-100">

        {/* ── RED top half — avatar + name only ── */}
        <div
          className="px-8 pt-8 pb-8 flex flex-col items-center gap-4"
          style={{ background: A }}
        >
          {/* Avatar upload */}
          <label className="relative cursor-pointer group flex-shrink-0">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/30">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-[36px]"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* + badge */}
            <div
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all group-hover:scale-110"
              style={{ background: "#222" }}
            >
              <Plus size={15} color="#fff" strokeWidth={3} />
            </div>
          </label>

          {/* Name + role */}
          <div className="text-center">
            <p className="text-white font-bold text-[20px] leading-tight">{profile.name}</p>
            <p className="text-white/70 text-[13px] mt-1">Guest · EthioStays</p>
            <p className="text-white/55 text-[12px] mt-0.5">Click the photo to change your avatar</p>
          </div>
        </div>

        {/* ── WHITE bottom half — form ── */}
        <div className="bg-white px-8 py-8">

          {/* Name */}
          <div className="mb-5">
            <label className={labelCls}>Full name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="mb-8 pb-8 border-b border-gray-100">
            <label className={labelCls}>Email address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Password section */}
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Change password</h3>

          <div className="mb-4">
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              value={profile.currentPassword}
              onChange={(e) => update("currentPassword", e.target.value)}
              placeholder="Enter current password"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className={labelCls}>New password</label>
              <input
                type="password"
                value={profile.newPassword}
                onChange={(e) => update("newPassword", e.target.value)}
                placeholder="At least 8 characters"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Confirm new password</label>
              <input
                type="password"
                value={profile.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter new password"
                className={inputCls}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-7 py-3 rounded-xl text-[14px] font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ background: A }}
            >
              Save changes
            </button>
            {saved && (
              <span className="text-[14px] font-semibold text-green-600">Changes saved successfully</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard root ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout }            = useAuth();
  const navigate                    = useNavigate();
  const [tab, setTab]               = useState("overview");
  const [panelOpen, setPanelOpen]   = useState(false);
  const [reviewTrip, setReviewTrip] = useState(null);
  const [reviews, setReviews]       = useState({});

  const guestName = user?.name ?? mockGuest.name;

  function handleLogout() { logout(); navigate("/"); }
  function handleSubmitReview({ tripId, rating, text }) {
    setReviews((prev) => ({ ...prev, [tripId]: { rating, text } }));
  }

  const enrichedTrips = useMemo(() =>
    mockPastTrips.map((t) => reviews[t.id] ? { ...t, reviewed: true, myRating: reviews[t.id].rating } : t),
    [reviews]
  );

  const stats = useMemo(() => [
    { icon: CalendarDays, label: "Upcoming trips", value: mockBookings.filter((b) => b.status === "upcoming" || b.status === "active").length, tab: "bookings" },
    { icon: Wallet,       label: "Spent this year", value: `${(mockGuest.totalSpentETB / 1000).toFixed(0)}K ETB`, tab: "bookings" },
  ], []);

  return (
    <div className="min-h-screen" style={{ background: STONE }}>
      <TopBar guestName={guestName} onAvatarClick={() => setPanelOpen(true)} />

      {panelOpen && (
        <DashboardPanel
          guestName={guestName}
          activeTab={tab}
          onSelect={setTab}
          onLogout={() => { setPanelOpen(false); handleLogout(); }}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {reviewTrip && (
        <ReviewModal
          trip={reviewTrip}
          onClose={() => setReviewTrip(null)}
          onSubmit={handleSubmitReview}
        />
      )}

      <main className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-10 pt-7 pb-24">
        {tab === "overview" && (
          <>
            <HeroBanner guestName={guestName} stats={stats} onStatClick={setTab} />
            <OverviewTab onNav={setTab} onOpenReview={(trip) => setReviewTrip(trip)} />
          </>
        )}
        {tab === "bookings" && <BookingsTab />}
        {tab === "trips"    && <TripsTab onOpenReview={(trip) => setReviewTrip(trip)} enrichedTrips={enrichedTrips} />}
        {tab === "settings" && <SettingsTab guestName={guestName} guestEmail={user?.email} />}
      </main>
    </div>
  );
}
