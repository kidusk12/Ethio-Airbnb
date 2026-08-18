import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, LayoutGrid, CalendarDays, History,
  Settings as SettingsIcon, ChevronDown, ChevronRight, ShieldCheck,
  CreditCard, LifeBuoy, LogOut, Wallet, Menu, Bell, Star, Users,
  ChevronsLeft, ChevronsRight, Search, TrendingUp, Clock, CheckCircle2,
  MessageCircle, Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  mockBookings, mockMessages, mockSavedStays,
  mockPastTrips, mockGuest,
} from "../data/mockDashboardData";

// ─── Design tokens ────────────────────────────────────────────────────────────
const A       = "#E8473F";   // accent
const A_DARK  = "#C73B34";
const A_LITE  = "#fdf2f2";
const GRAY    = "#6b7280";
const STONE   = "#f7f6f4";   // page bg

// ─── Data ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  label: "Overview",   icon: LayoutGrid    },
  { id: "bookings",  label: "Bookings",   icon: CalendarDays  },
  { id: "trips",     label: "Past trips", icon: History       },
  { id: "settings",  label: "Settings",   icon: SettingsIcon  },
];

const STATUS_MAP = {
  upcoming:  { color: "#2563eb", bg: "#eff6ff", label: "Upcoming"    },
  active:    { color: A,         bg: A_LITE,    label: "Active now"  },
  completed: { color: "#6b7280", bg: "#f3f4f6", label: "Completed"   },
  cancelled: { color: "#dc2626", bg: "#fef2f2", label: "Cancelled"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });

const nightsBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86_400_000);

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = "md" }) {
  const s = size === "sm" ? { icon: 13, text: "text-[16px]", box: "w-7 h-7 rounded-lg" }
                          : { icon: 16, text: "text-[19px]", box: "w-8 h-8 rounded-xl" };
  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <div className={`${s.box} flex items-center justify-center`} style={{ background: A }}>
        <MapPin size={s.icon} color="#fff" strokeWidth={2.5} />
      </div>
      <span className={`${s.text} font-bold tracking-tight text-gray-900 whitespace-nowrap`}>
        Ethio<span style={{ color: A }}>Stays</span>
      </span>
    </Link>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ guestName, unreadCount, onLogout, onMenuClick, onTabChange }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 h-16 bg-white/95 border-b border-gray-100"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-8 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <Logo />
        </div>

        {/* Centre search — hidden on small */}
        <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-72 hover:border-gray-300 transition-colors cursor-pointer">
          <Search size={14} color={GRAY} />
          <span className="text-[13px] text-gray-400">Search destinations in Ethiopia…</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Bell */}
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Bell size={18} color={GRAY} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white" style={{ background: A }} />
            )}
          </button>

          {/* Profile pill */}
          <div className="relative ml-1">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:shadow-md transition-all bg-white"
            >
              <Menu size={16} color={GRAY} />
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: A }}
              >
                {guestName?.[0]?.toUpperCase() || "G"}
              </div>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-[13px] font-semibold text-gray-900">{guestName}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Guest · EthioStays</p>
                  </div>
                  {[
                    ["My trips",         "bookings"],
                    ["Account settings", "settings"],
                  ].map(([label, tabId]) => (
                    <button
                      key={label}
                      onClick={() => { setProfileOpen(false); onTabChange(tabId); }}
                      className="w-full text-left block px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => { setProfileOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onSelect, collapsed, onToggle, unreadCount }) {
  const enriched = TABS.map((t) => ({
    ...t,
    badge: t.id === "bookings"
      ? mockBookings.filter((b) => b.status === "upcoming" || b.status === "active").length
      : 0,
  }));

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 bg-white border-r border-gray-100 sticky overflow-y-auto"
      style={{
        top: "var(--topbar-h, 64px)",
        width: collapsed ? "var(--sidebar-w-sm, 72px)" : "var(--sidebar-w, 240px)",
        height: "calc(100vh - 64px)",
        transition: "width 0.2s ease",
      }}
    >
      <nav className="flex-1 py-4 px-2.5 space-y-0.5">
        {enriched.map(({ id, label, icon: Icon, badge }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              title={collapsed ? label : undefined}
              onClick={() => onSelect(id)}
              className="relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all group"
              style={{
                background: active ? A_LITE : "transparent",
                color: active ? A : GRAY,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {/* Active bar */}
              <span
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-opacity"
                style={{ background: A, opacity: active ? 1 : 0 }}
              />
              <Icon size={17} strokeWidth={active ? 2.25 : 1.875} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
              {!!badge && (
                <span
                  className="flex-shrink-0 text-[9px] font-bold rounded-full flex items-center justify-center text-white leading-none"
                  style={{
                    background: A,
                    ...(collapsed
                      ? { position: "absolute", top: 4, left: 24, width: 15, height: 15 }
                      : { marginLeft: "auto", minWidth: 17, height: 17, padding: "0 4px" }),
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2.5 border-t border-gray-100">
        <button
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
          className="w-full flex items-center justify-center rounded-xl py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}

// ─── Hero Banner (Overview only) ──────────────────────────────────────────────
function HeroBanner({ guestName, stats, onStatClick }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="relative rounded-3xl overflow-hidden mb-8 et-pattern"
      style={{
        background: `linear-gradient(135deg, ${A} 0%, #c0392b 55%, #922b21 100%)`,
        minHeight: 200,
      }}
    >
      {/* Decorative circle */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
        style={{ background: "#fff" }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10"
        style={{ background: "#fff" }}
      />

      <div className="relative px-6 pt-7 pb-6">
        {/* Greeting */}
        <p className="text-white/70 text-[13px] font-medium mb-1">{greeting}</p>
        <h1 className="font-display text-[26px] md:text-[30px] text-white font-normal leading-tight mb-1">
          {guestName}
        </h1>
        <p className="text-white/60 text-[13px] mb-6">Here's your travel overview</p>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          {stats.map(({ icon: Icon, label, value, tab }) => (
            <button
              key={label}
              onClick={() => onStatClick(tab)}
              className="flex items-center gap-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl px-4 py-2.5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon size={15} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white font-bold text-[18px] leading-none tabular-nums">{value}</p>
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
          className="text-[12px] font-semibold flex items-center gap-0.5 hover:opacity-75 transition-opacity"
          style={{ color: A }}
        >
          {action.label} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────
function Empty({ icon: Icon, text, cta, onCta }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 flex flex-col items-center gap-3 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: A_LITE }}>
          <Icon size={22} style={{ color: A }} strokeWidth={1.5} />
        </div>
      )}
      <p className="text-[14px] text-gray-400 max-w-[220px]">{text}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-1 text-[13px] font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
          style={{ background: A }}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

// ─── BookingCard ─────────────────────────────────────────────────────────────
function BookingCard({ booking, compact = false }) {
  const { propertyName, propertyType, location, image, checkIn, checkOut, guests, totalPriceETB, status, hostName } = booking;
  const s = STATUS_MAP[status] ?? STATUS_MAP.upcoming;
  const n = nightsBetween(checkIn, checkOut);

  if (compact) {
    return (
      <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
          <img src={image} alt={propertyName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-semibold text-gray-900 truncate">{propertyName}</p>
            <span
              className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: s.bg, color: s.color }}
            >
              {s.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 mb-0.5">
            <MapPin size={11} />
            <span className="text-[12px] truncate">{location}</span>
          </div>
          <p className="text-[11px] text-gray-400">
            {fmtDate(checkIn)} — {fmtDate(checkOut)} · {n} night{n !== 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-[14px] font-bold text-gray-900 flex-shrink-0 tabular-nums">
          ETB {totalPriceETB.toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="sm:w-56 flex-shrink-0 relative overflow-hidden">
        <img
          src={image}
          alt={propertyName}
          className="w-full h-52 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status badge on image */}
        <span
          className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm"
          style={{ background: s.bg + "e0", color: s.color }}
        >
          {s.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: A }}
              >
                {propertyType}
              </p>
              <h3 className="text-[17px] font-semibold text-gray-900 leading-snug">{propertyName}</h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400 mb-4">
            <MapPin size={13} />
            <span className="text-[13px]">{location}</span>
          </div>

          {/* Details row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} color="#9ca3af" />
              {fmtDate(checkIn)} — {fmtDate(checkOut)}
              <span className="text-gray-400 font-medium">· {n} night{n !== 1 ? "s" : ""}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={13} color="#9ca3af" />
              {guests} guest{guests !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: A }}
            >
              {hostName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] text-gray-400 leading-none">Hosted by</p>
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

// ─── MessageItem ──────────────────────────────────────────────────────────────
function MessageItem({ msg }) {
  const { hostName, hostAvatar, propertyName, preview, timestamp, unread } = msg;
  return (
    <div
      className="flex items-start gap-3.5 px-5 py-3.5 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
      style={{ background: unread ? "#fff9f9" : "transparent" }}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {hostAvatar
            ? <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
            : <span className="w-full h-full flex items-center justify-center text-[13px] font-semibold text-gray-600">{hostName?.[0]?.toUpperCase()}</span>
          }
        </div>
        {unread && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ background: A }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-[13px] truncate ${unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
            {hostName}
          </p>
          <span className="text-[11px] text-gray-400 flex-shrink-0">{timestamp}</span>
        </div>
        <p className="text-[11px] font-medium truncate mb-0.5" style={{ color: A }}>{propertyName}</p>
        <p className={`text-[12px] truncate ${unread ? "text-gray-600" : "text-gray-400"}`}>{preview}</p>
      </div>
    </div>
  );
}

// ─── SavedStayCard ────────────────────────────────────────────────────────────
function SavedStayCard({ stay }) {
  const { name, type, location, image, rating, reviews, pricePerNightETB } = stay;
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          aria-label="Unsave"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <Heart size={14} style={{ fill: A, color: A }} />
        </button>
        <span className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {type}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-[14px] font-semibold text-gray-900 truncate">{name}</h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={11} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
            <span className="text-[12px] font-semibold text-gray-700">{rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-3">
          <MapPin size={11} color="#9ca3af" />
          <span className="text-[12px] text-gray-400 truncate">{location}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-[14px] font-bold text-gray-900 tabular-nums">
            ETB {pricePerNightETB.toLocaleString()}
            <span className="text-[12px] font-normal text-gray-400"> / night</span>
          </p>
          <button
            className="text-[12px] font-semibold px-3 py-1 rounded-full transition-colors"
            style={{ background: A_LITE, color: A }}
            onMouseEnter={(e) => { e.currentTarget.style.background = A; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = A_LITE; e.currentTarget.style.color = A; }}
          >
            Book again
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PastTripCard ─────────────────────────────────────────────────────────────
function PastTripCard({ trip, onReview }) {
  const { id, propertyName, location, image, stayedDates, reviewed, myRating } = trip;
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
        <img src={image} alt={propertyName} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900 truncate mb-0.5">{propertyName}</p>
        <div className="flex items-center gap-1 text-gray-400 mb-0.5">
          <MapPin size={11} /><span className="text-[12px] truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock size={11} /><span className="text-[12px]">{stayedDates}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {reviewed ? (
          <div>
            <div className="flex items-center gap-0.5 justify-end mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} style={{
                  fill: i < (myRating ?? 0) ? "#f59e0b" : "#e5e7eb",
                  color: i < (myRating ?? 0) ? "#f59e0b" : "#e5e7eb",
                }} />
              ))}
            </div>
            <div className="flex items-center gap-1 justify-end">
              <CheckCircle2 size={11} color="#22c55e" />
              <span className="text-[11px] text-gray-400">Reviewed</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onReview?.(id)}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-85"
            style={{ background: A }}
          >
            Leave a review
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ onNav }) {
  const upcoming = mockBookings.filter((b) => b.status === "upcoming" || b.status === "active");

  return (
    <div className="space-y-10">

      {/* Active / upcoming trips */}
      <section>
        <Heading title="Your trips" action={{ label: "All bookings", fn: () => onNav("bookings") }} />
        {upcoming.length
          ? <div className="space-y-5">{upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
          : <Empty icon={CalendarDays} text="No upcoming trips yet." cta="Explore stays" onCta={() => {}} />
        }
      </section>

      {/* Past trips */}
      <section>
        <Heading title="Past trips" action={{ label: "View history", fn: () => onNav("trips") }} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5">
          {mockPastTrips.map((t) => (
            <PastTripCard key={t.id} trip={t} onReview={() => onNav("trips")} />
          ))}
        </div>
      </section>

      {/* Ethiopian travel tip strip */}
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

// ─── Bookings tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const groups = [
    { label: "Upcoming & active", items: mockBookings.filter((b) => b.status === "upcoming" || b.status === "active") },
    { label: "Completed",         items: mockBookings.filter((b) => b.status === "completed") },
    { label: "Cancelled",         items: mockBookings.filter((b) => b.status === "cancelled") },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.label}>
          <Heading title={g.label} />
          <div className="space-y-5">
            {g.items.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      ))}
      {groups.length === 0 && (
        <Empty icon={CalendarDays} text="No bookings yet. Start exploring Ethiopian stays." cta="Explore stays" />
      )}
    </div>
  );
}

// ─── Trips tab ────────────────────────────────────────────────────────────────
function TripsTab() {
  return (
    <div className="max-w-2xl">
      <Heading title="Past trips" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5">
        {mockPastTrips.length
          ? mockPastTrips.map((t) => <PastTripCard key={t.id} trip={t} />)
          : <Empty icon={History} text="No past trips yet." />
        }
      </div>
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────
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
          <p className="font-display text-[20px] text-white">{guestName}</p>
          <p className="text-white/70 text-[12px] mt-0.5">Guest · EthioStays member</p>
        </div>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {items.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: A_LITE }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fce8e7"}
              onMouseLeave={(e) => e.currentTarget.style.background = A_LITE}
            >
              <Icon size={17} style={{ color: A }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900">{title}</p>
              <p className="text-[12px] text-gray-400">{desc}</p>
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
  const { user, logout }            = useAuth();
  const navigate                    = useNavigate();
  const [tab, setTab]               = useState("overview");
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const guestName   = user?.name ?? mockGuest.name;
  const unreadCount = 0; // messages tab removed

  function handleLogout() { logout(); navigate("/"); }

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
      <TopBar
        guestName={guestName}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        onMenuClick={() => setMobileOpen(true)}
        onTabChange={(id) => { setTab(id); setMobileOpen(false); }}
      />

      <div className="flex">
        <Sidebar
          activeTab={tab}
          onSelect={(id) => { setTab(id); setMobileOpen(false); }}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          unreadCount={unreadCount}
        />

        {/* Mobile slide-over */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col">
              <div className="h-16 flex items-center px-5 border-b border-gray-100">
                <Logo />
              </div>
              <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setTab(id); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-colors"
                      style={{
                        background: active ? A_LITE : "transparent",
                        color: active ? A : GRAY,
                      }}
                    >
                      <Icon size={18} strokeWidth={active ? 2.25 : 1.875} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
              {/* User strip */}
              <div className="p-4 border-t border-gray-100 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                  style={{ background: A }}
                >
                  {guestName?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{guestName}</p>
                  <p className="text-[11px] text-gray-400">Guest account</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 md:px-8 lg:px-10 pt-7 pb-24">

          {tab === "overview" && (
            <>
              <HeroBanner guestName={guestName} stats={stats} onStatClick={setTab} />
              <OverviewTab onNav={setTab} />
            </>
          )}

          {tab === "bookings"  && <BookingsTab />}
          {tab === "trips"     && <TripsTab />}
          {tab === "settings"  && <SettingsTab guestName={guestName} />}
        </main>
      </div>
    </div>
  );
}
