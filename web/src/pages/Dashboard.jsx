import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, LayoutGrid, CalendarDays, History,
  Settings as SettingsIcon, ChevronRight, ShieldCheck,
  CreditCard, LifeBuoy, LogOut, Wallet, Star, Users,
  TrendingUp, Clock, CheckCircle2,
  X, Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  mockBookings, mockMessages, mockSavedStays,
  mockPastTrips, mockGuest,
} from "../data/mockDashboardData";

// ─── Design tokens (unchanged) ───────────────────────────────────────────────
const A      = "#E8473F";
const A_DARK = "#C73B34";
const A_LITE = "#fdf2f2";
const GRAY   = "#6b7280";
const STONE  = "#f7f6f4";

// ─── Sidebar tabs ─────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });

const nightsBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86_400_000);

// ─── House Logo  (matches ethio-stays-find.lovable.app) ──────────────────────
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
      {/* House icon — matches the Lovable reference */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
        style={{ background: A }}
      >
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
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [text, setText]         = useState("");
  const overlayRef              = useRef(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap focus inside modal
  useEffect(() => {
    overlayRef.current?.focus();
  }, []);

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
      aria-label="Write a review"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="px-6 pt-6 pb-5 et-pattern"
          style={{ background: `linear-gradient(135deg, ${A} 0%, #c0392b 100%)` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white/70 text-[12px] font-medium mb-0.5">Share your experience</p>
              <h3 className="font-display text-[22px] text-white leading-tight">
                {trip.propertyName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin size={12} color="rgba(255,255,255,0.65)" />
                <span className="text-white/65 text-[12px]">{trip.location}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5"
              aria-label="Close"
            >
              <X size={15} color="#fff" />
            </button>
          </div>

          {/* Property thumbnail */}
          <div className="mt-4 rounded-2xl overflow-hidden h-28 w-full">
            <img
              src={trip.image}
              alt={trip.propertyName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 overflow-y-auto">

          {/* Star rating */}
          <div className="mb-5">
            <p className="text-[13px] font-semibold text-gray-700 mb-3">Your rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    size={32}
                    strokeWidth={1.5}
                    style={{
                      fill:   n <= active ? "#f59e0b" : "transparent",
                      color:  n <= active ? "#f59e0b" : "#d1d5db",
                      filter: n <= active ? "drop-shadow(0 1px 3px rgba(245,158,11,0.4))" : "none",
                      transition: "all 0.12s ease",
                    }}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-[13px] font-medium text-gray-500">
                  {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                </span>
              )}
            </div>
            {!rating && (
              <p className="text-[11px] text-gray-400 mt-2">Click a star to rate</p>
            )}
          </div>

          {/* Text area */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Your review
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell others what you loved about this stay — the view, the host, the location…"
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition-shadow"
              style={{ "--tw-ring-color": A + "66" }}
            />
            <p className="text-[11px] text-gray-400 mt-1 text-right">{text.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!rating}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity"
              style={{
                background: rating ? A : "#d1d5db",
                cursor: rating ? "pointer" : "not-allowed",
                opacity: rating ? 1 : 0.7,
              }}
            >
              Submit review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
// Spec: only interactive element is the profile avatar → opens dashboard panel.
// Remove: search bar, bell, My Trips link, Accounts section.
function TopBar({ guestName, onAvatarClick }) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-100">
      <div className="h-full max-w-[1400px] mx-auto flex items-center justify-between px-5 lg:px-8">

        {/* Left — logo */}
        <Logo />

        {/* Right — avatar pill (Airbnb-style: hamburger + avatar in a pill) */}
        <button
          onClick={onAvatarClick}
          className="flex items-center gap-2 border border-gray-200 rounded-full pl-3 pr-1 py-1 hover:shadow-md transition-shadow bg-white focus:outline-none"
          aria-label="Open menu"
        >
          {/* Hamburger lines */}
          <div className="flex flex-col gap-[4px]">
            <span className="block w-[16px] h-[1.5px] bg-gray-600 rounded-full" />
            <span className="block w-[16px] h-[1.5px] bg-gray-600 rounded-full" />
            <span className="block w-[16px] h-[1.5px] bg-gray-600 rounded-full" />
          </div>
          {/* Avatar circle */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
            style={{ background: A }}
          >
            {guestName?.[0]?.toUpperCase() || "G"}
          </div>
        </button>
      </div>
    </header>
  );
}

// ─── Dashboard dropdown (Airbnb-style: appears below avatar, no slide-in) ────
function DashboardPanel({ guestName, activeTab, onSelect, onLogout, onClose }) {
  const ref = useRef(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const items = [
    { id: "overview",  label: "Overview"   },
    { id: "bookings",  label: "Bookings"   },
    { id: "trips",     label: "Past trips" },
    { id: "settings",  label: "Settings"   },
  ];

  return (
    <>
      {/* Invisible backdrop — click outside closes */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown card — anchored top-right below the topbar */}
      <div
        ref={ref}
        className="fixed top-[72px] right-4 sm:right-6 lg:right-8 z-50 bg-white rounded-2xl overflow-hidden"
        style={{
          width: 280,
          boxShadow: "0 8px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
        }}
        role="dialog"
        aria-label="Account menu"
      >
        {/* ── User identity row ── */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
            style={{ background: A }}
          >
            {guestName?.[0]?.toUpperCase() || "G"}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-gray-900 truncate">{guestName}</p>
            <p className="text-[12px] text-gray-400 truncate">Guest · EthioStays</p>
          </div>
        </div>

        {/* ── Menu items — no icons, clean text rows ── */}
        <div className="py-1">
          {items.map(({ id, label }, i) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { onSelect(id); onClose(); }}
                className="w-full text-left px-4 py-3 text-[14px] transition-colors"
                style={{
                  color:      active ? A : "#111827",
                  fontWeight: active ? 600 : 400,
                  background: "transparent",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f7f6f4"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Divider + Log out ── */}
        <div className="border-t border-gray-100 py-1">
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-[14px] transition-colors"
            style={{ color: "#111827", fontWeight: 400 }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f7f6f4"}
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
    <div
      className="relative rounded-3xl overflow-hidden mb-8 et-pattern"
      style={{ background: `linear-gradient(135deg, ${A} 0%, #c0392b 55%, #922b21 100%)`, minHeight: 200 }}
    >
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "#fff" }} />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />

      <div className="relative px-7 pt-7 pb-7">
        <p className="text-white/70 text-[13px] font-medium mb-1">{greeting}</p>
        <h1 className="font-display text-[28px] md:text-[32px] text-white font-normal leading-tight mb-1">
          {guestName}
        </h1>
        <p className="text-white/60 text-[13px] mb-7">Here's your travel overview</p>

        <div className="flex flex-wrap gap-3">
          {stats.map(({ icon: Icon, label, value, tab }) => (
            <button
              key={label}
              onClick={() => onStatClick(tab)}
              className="flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl px-4 py-3 transition-colors text-left"
            >
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
        <button
          onClick={action.fn}
          className="text-[12px] font-semibold flex items-center gap-0.5 transition-opacity hover:opacity-70"
          style={{ color: A }}
        >
          {action.label} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ icon: Icon, text, cta, onCta }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center gap-3 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: A_LITE }}>
          <Icon size={22} style={{ color: A }} strokeWidth={1.5} />
        </div>
      )}
      <p className="text-[14px] text-gray-400 max-w-[220px] leading-relaxed">{text}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-1 text-[13px] font-semibold px-5 py-2 rounded-full text-white"
          style={{ background: A }}
        >
          {cta}
        </button>
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
        <img
          src={image}
          alt={propertyName}
          className="w-full h-52 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: s.bg + "e8", color: s.color }}
        >
          {s.label}
        </span>
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: A }}>
            {propertyType}
          </p>
          <h3 className="text-[17px] font-semibold text-gray-900 leading-snug mb-2">{propertyName}</h3>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin size={13} />
            <span className="text-[13px]">{location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} color="#9ca3af" />
            {fmtDate(checkIn)} — {fmtDate(checkOut)}
            <span className="font-medium text-gray-400"> · {n} night{n !== 1 ? "s" : ""}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} color="#9ca3af" />
            {guests} guest{guests !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: A }}
            >
              {hostName?.[0]?.toUpperCase()}
            </div>
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

// ─── Past Trip Card (with review CTA) ────────────────────────────────────────
function PastTripCard({ trip, onReview }) {
  const { id, propertyName, location, image, stayedDates, reviewed, myRating } = trip;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
        <img src={image} alt={propertyName} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900 truncate mb-0.5">{propertyName}</p>
        <div className="flex items-center gap-1 text-gray-400 mb-0.5">
          <MapPin size={11} />
          <span className="text-[12px] truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock size={11} />
          <span className="text-[12px]">{stayedDates}</span>
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        {reviewed ? (
          <div>
            <div className="flex items-center gap-0.5 justify-end mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  style={{
                    fill:  i < (myRating ?? 0) ? "#f59e0b" : "#e5e7eb",
                    color: i < (myRating ?? 0) ? "#f59e0b" : "#e5e7eb",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 justify-end">
              <CheckCircle2 size={11} color="#22c55e" />
              <span className="text-[11px] text-gray-400">Reviewed</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onReview(trip)}
            className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full text-white transition-opacity hover:opacity-85 whitespace-nowrap"
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
        <Heading title="Past trips" action={{ label: "View history", fn: () => onNav("trips") }} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 divide-y divide-gray-100">
          {mockPastTrips.map((t) => (
            <PastTripCard key={t.id} trip={t} onReview={onOpenReview} />
          ))}
        </div>
      </section>

      {/* Ethiopian promo strip */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4 et-pattern"
        style={{ background: `linear-gradient(120deg, ${A} 0%, #c0392b 100%)` }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={20} color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[14px]">Discover more of Ethiopia</p>
          <p className="text-white/70 text-[12px] mt-0.5">
            Lalibela · Gondar · Axum · Harar · Omo Valley — new stays added weekly
          </p>
        </div>
        <Link
          to="/explore"
          className="flex-shrink-0 bg-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: A }}
        >
          Explore
        </Link>
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const groups = [
    { label: "Upcoming & active", items: mockBookings.filter((b) => b.status === "upcoming" || b.status === "active") },
    { label: "Completed",         items: mockBookings.filter((b) => b.status === "completed") },
    { label: "Cancelled",         items: mockBookings.filter((b) => b.status === "cancelled") },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      {groups.length
        ? groups.map((g) => (
            <section key={g.label}>
              <Heading title={g.label} />
              <div className="space-y-5">{g.items.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
            </section>
          ))
        : <Empty icon={CalendarDays} text="No bookings yet. Start exploring Ethiopian stays." cta="Explore stays" />
      }
    </div>
  );
}

// ─── Trips Tab ────────────────────────────────────────────────────────────────
function TripsTab({ onOpenReview }) {
  return (
    <div className="max-w-2xl">
      <Heading title="Past trips" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 divide-y divide-gray-100">
        {mockPastTrips.length
          ? mockPastTrips.map((t) => (
              <PastTripCard key={t.id} trip={t} onReview={onOpenReview} />
            ))
          : <Empty icon={History} text="No past trips yet." />
        }
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ guestName }) {
  const items = [
    { icon: ShieldCheck, title: "Account & security",  desc: "Password, two-factor auth, login history"  },
    { icon: CreditCard,  title: "Payment methods",     desc: "Telebirr, CBE Birr, and saved cards"       },
    { icon: Wallet,      title: "Payouts & receipts",  desc: "Download invoices and payment history"      },
    { icon: LifeBuoy,    title: "Help & support",      desc: "Contact the EthioStays support team"       },
  ];

  return (
    <div className="max-w-xl">
      <Heading title="Account settings" />

      {/* Profile card */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-center gap-4 et-pattern"
        style={{ background: `linear-gradient(135deg, ${A} 0%, #c0392b 100%)` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-[22px] font-bold text-white flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          {guestName?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-display text-[20px] text-white leading-tight">{guestName}</p>
          <p className="text-white/70 text-[12px] mt-0.5">Guest · EthioStays member</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {items.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: A_LITE }}
            >
              <Icon size={17} style={{ color: A }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900">{title}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={15} color="#d1d5db" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard root ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();
  const [tab, setTab]                 = useState("overview");
  const [panelOpen, setPanelOpen]     = useState(false);  // profile dashboard panel
  const [reviewTrip, setReviewTrip]   = useState(null);   // trip being reviewed
  const [reviews, setReviews]         = useState({});     // { tripId: { rating, text } }

  const guestName = user?.name ?? mockGuest.name;

  function handleLogout() { logout(); navigate("/"); }

  function handleSubmitReview({ tripId, rating, text }) {
    setReviews((prev) => ({ ...prev, [tripId]: { rating, text } }));
  }

  // Merge review state into trips
  const enrichedTrips = useMemo(() =>
    mockPastTrips.map((t) =>
      reviews[t.id]
        ? { ...t, reviewed: true, myRating: reviews[t.id].rating }
        : t
    ),
    [reviews]
  );

  const stats = useMemo(() => [
    {
      icon: CalendarDays,
      label: "Upcoming trips",
      value: mockBookings.filter((b) => b.status === "upcoming" || b.status === "active").length,
      tab: "bookings",
    },
    {
      icon: Wallet,
      label: "Spent this year",
      value: `${(mockGuest.totalSpentETB / 1000).toFixed(0)}K ETB`,
      tab: "bookings",
    },
  ], []);

  return (
    <div className="min-h-screen" style={{ background: STONE }}>

      {/* ── Top bar ── */}
      <TopBar
        guestName={guestName}
        onAvatarClick={() => setPanelOpen(true)}
      />

      {/* ── Dashboard slide-in panel ── */}
      {panelOpen && (
        <DashboardPanel
          guestName={guestName}
          activeTab={tab}
          onSelect={(id) => { setTab(id); }}
          onLogout={() => { setPanelOpen(false); handleLogout(); }}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {/* ── Review modal ── */}
      {reviewTrip && (
        <ReviewModal
          trip={reviewTrip}
          onClose={() => setReviewTrip(null)}
          onSubmit={handleSubmitReview}
        />
      )}

      <div className="flex">

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-5 md:px-8 lg:px-10 pt-7 pb-24">

          {tab === "overview" && (
            <>
              <HeroBanner guestName={guestName} stats={stats} onStatClick={setTab} />
              <OverviewTab
                onNav={setTab}
                onOpenReview={(trip) => setReviewTrip(trip)}
              />
            </>
          )}

          {tab === "bookings" && <BookingsTab />}

          {tab === "trips" && (
            <TripsTab
              onOpenReview={(trip) => setReviewTrip(trip)}
            />
          )}

          {tab === "settings" && <SettingsTab guestName={guestName} />}

        </main>
      </div>
    </div>
  );
}
