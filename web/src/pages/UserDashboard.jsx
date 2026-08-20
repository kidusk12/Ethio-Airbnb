import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, LayoutGrid, CalendarDays, History,
  Settings as SettingsIcon, ChevronRight, ShieldCheck,
  CreditCard, LifeBuoy, LogOut, Wallet, Star, Users,
  TrendingUp, Clock, CheckCircle2, X, PanelLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  mockBookings, mockMessages, mockSavedStays,
  mockPastTrips, mockGuest,
} from "../data/mockDashboardData";
import Profile from "./Profile";
import NavBar1 from "../components/NavBar1";

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

// ─── Profile dropdown (true Airbnb style) ────────────────────────────────────
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

// ─── Dashboard root ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout }            = useAuth();
  const navigate                    = useNavigate();
  const [tab, setTab]               = useState("overview");
  const [reviewTrip, setReviewTrip] = useState(null);
  const [reviews, setReviews]       = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const guestName = user?.name ?? mockGuest.name;
  const guestFirstName = (() => {
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name.split(' ')[0];
    return 'Guest';
  })();
  const initialLetter = guestFirstName.charAt(0).toUpperCase() || 'G';

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

  const sidebarLinks = [
    { label: 'Overview', icon: LayoutGrid, tab: 'overview' },
    { label: 'Bookings', icon: CalendarDays, tab: 'bookings', count: mockBookings.filter((b) => b.status === "upcoming" || b.status === "active").length },
    { label: 'Past trips', icon: History, tab: 'trips', count: mockPastTrips.length },
    { label: 'Profile Settings', icon: SettingsIcon, tab: 'settings' },
  ];

  return (
    <div className="min-h-screen" style={{ background: STONE }}>
      <NavBar1
        userName={guestName}
        onLogout={handleLogout}
        dashboardLabel="My Dashboard"
        dashboardLink="/guest_dashboard"
        showProfileLink={false}
      />

      {/* Sliding Sidebar - fixed panel, pushes content instead of covering it */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-[100] flex flex-col justify-between p-5 transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between pb-5 border-b border-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white font-bold text-[15px] flex items-center justify-center shadow-sm">
                {initialLetter}
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-foreground leading-tight">
                  {guestName}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full mt-0.5">
                  <CheckCircle2 size={10} /> Verified Guest
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted-foreground"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.tab;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setTab(item.tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'text-foreground hover:bg-gray-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-primary flex-shrink-0'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom / Logout */}
        <div className="pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Backdrop - only needed on small screens where content can't shift; click to close */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[90] hidden md:block"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Content wrapper - shifts right when sidebar is open on md+ screens */}
      <div className={`transition-all duration-200 ${isSidebarOpen ? 'md:ml-72' : ''}`}>
        {/* Top Controls with Sidebar Icon Toggle */}
        <div className="pt-20 pb-2 px-6 max-w-[1200px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Open guest menu"
            className="w-10 h-10 rounded-2xl bg-white border border-border hover:border-primary text-foreground flex items-center justify-center shadow-sm hover:shadow transition-all group"
          >
            <PanelLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>

        {reviewTrip && (
          <ReviewModal
            trip={reviewTrip}
            onClose={() => setReviewTrip(null)}
            onSubmit={handleSubmitReview}
          />
        )}

        <main className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-10 pt-4 pb-24">
          {tab === "overview" && (
            <>
              <HeroBanner guestName={guestName} stats={stats} onStatClick={setTab} />
              <OverviewTab onNav={setTab} onOpenReview={(trip) => setReviewTrip(trip)} />
            </>
          )}
          {tab === "bookings" && <BookingsTab />}
          {tab === "trips"    && <TripsTab onOpenReview={(trip) => setReviewTrip(trip)} enrichedTrips={enrichedTrips} />}
          {tab === "settings" && <Profile guestName={guestName} guestEmail={user?.email} embedded />}
        </main>
      </div>
    </div>
  );
}