import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  LayoutGrid,
  CalendarDays,
  MessageCircle,
  Heart,
  History,
  Settings as SettingsIcon,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  LifeBuoy,
  LogOut,
  Wallet,
  ChevronRight,
  Bell,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";
import { StatCard } from "../components/dashboard/StatCard";
import { BookingCard } from "../components/dashboard/BookingCard";
import { MessageItem } from "../components/dashboard/MessageItem";
import { SavedStayCard } from "../components/dashboard/SavedStayCard";
import { PastTripCard } from "../components/dashboard/PastTripCard";
import {
  mockBookings,
  mockMessages,
  mockSavedStays,
  mockPastTrips,
  mockGuest,
} from "../data/mockDashboardData";

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Overview",    icon: LayoutGrid   },
  { id: "bookings",  label: "Bookings",    icon: CalendarDays },
  { id: "messages",  label: "Messages",    icon: MessageCircle },
  { id: "saved",     label: "Saved",       icon: Heart        },
  { id: "trips",     label: "Past trips",  icon: History      },
  { id: "settings",  label: "Settings",    icon: SettingsIcon },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8473F" }}>
        <MapPin size={15} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-[19px] font-bold tracking-tight text-gray-900">
        Ethio<span style={{ color: "#E8473F" }}>Stays</span>
      </span>
    </Link>
  );
}

// ─── Profile dropdown ─────────────────────────────────────────────────────────

function ProfileMenu({ name, onLogout }) {
  const [open, setOpen] = useState(false);
  const initials = name?.[0]?.toUpperCase() || "G";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors bg-white"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[12px] font-bold" style={{ backgroundColor: "#E8473F" }}>
          {initials}
        </div>
        <span className="hidden sm:block text-[13px] font-medium text-gray-700 pr-1">{name}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{name}</p>
              <p className="text-[11px] text-gray-400">Guest account</p>
            </div>
            <div className="py-1">
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                My Dashboard
              </Link>
              <Link to="/dashboard?tab=saved" onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                Saved Stays
              </Link>
              <Link to="/dashboard?tab=settings" onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                Settings
              </Link>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function DashboardHeader({ guestName, onLogout }) {
  const unreadCount = mockMessages.filter((m) => m.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Logo />

          <nav className="hidden md:flex items-center gap-6">
            {[
              ["Explore",       "/explore"],
              ["Stays",         "/dashboard?tab=bookings"],
              ["Become a Host", "/host"],
            ].map(([label, to]) => (
              <Link key={label} to={to} className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors font-medium">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Notifications">
              <Bell size={18} className="text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E8473F]" />
              )}
            </button>
            <ProfileMenu name={guestName} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ title, action, compact = false }) {
  return (
    <div className={`flex items-center justify-between ${compact ? "mb-3" : "mb-5"}`}>
      <h2 className={`font-semibold text-gray-900 ${compact ? "text-[15px]" : "text-[18px]"}`}>
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[13px] font-semibold text-[#E8473F] hover:text-[#D63C34] flex items-center gap-0.5 transition-colors"
        >
          {action.label}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ bookings, messages, savedStays, setActiveTab }) {
  return (
    <div className="space-y-8">
      {/* Bookings */}
      <section>
        <SectionHeading
          title="Upcoming & active bookings"
          action={{ label: "View all", onClick: () => setActiveTab("bookings") }}
        />
        <div className="space-y-4">
          {bookings.slice(0, 2).map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      </section>

      {/* Messages + Saved */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <SectionHeading
              title="Messages"
              compact
              action={{ label: "See all", onClick: () => setActiveTab("messages") }}
            />
          </div>
          {messages.slice(0, 3).map((m) => (
            <MessageItem key={m.id} message={m} />
          ))}
          <div className="h-2" />
        </section>

        <section className="lg:col-span-3">
          <SectionHeading
            title="Saved stays"
            action={{ label: "View all", onClick: () => setActiveTab("saved") }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedStays.slice(0, 2).map((s) => (
              <SavedStayCard key={s.id} stay={s} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const items = [
    { icon: ShieldCheck, title: "Account & security",  desc: "Password, two-factor auth, login activity" },
    { icon: CreditCard,  title: "Payment methods",     desc: "Telebirr, CBE Birr, and saved cards"       },
    { icon: Wallet,      title: "Payouts & receipts",  desc: "Download invoices for past stays"           },
    { icon: LifeBuoy,    title: "Help & support",      desc: "Contact the Ethio-Stays support team"       },
  ];

  return (
    <div className="max-w-xl">
      <SectionHeading title="Account settings" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {items.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#fdf2f2] flex items-center justify-center flex-shrink-0 group-hover:bg-[#fce8e7] transition-colors">
              <Icon size={17} className="text-[#E8473F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900">{title}</p>
              <p className="text-[12px] text-gray-400">{desc}</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const guestName = user?.name || mockGuest.name;

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const stats = useMemo(() => [
    { icon: CalendarDays,   label: "Upcoming trips",   value: mockBookings.filter((b) => b.status === "upcoming" || b.status === "active").length },
    { icon: Heart,          label: "Saved stays",      value: mockSavedStays.length },
    { icon: MessageCircle,  label: "Unread messages",  value: mockMessages.filter((m) => m.unread).length },
    { icon: Wallet,         label: "Spent this year",  value: `ETB ${mockGuest.totalSpentETB.toLocaleString()}` },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <DashboardHeader guestName={guestName} onLogout={handleLogout} />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* ── Welcome banner ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900">
                Welcome back, {guestName}
              </h1>
              <p className="text-[14px] text-gray-400 mt-1">
                Here's what's happening with your trips.
              </p>
            </div>
          </div>

          {/* Stat cards — horizontally scrollable on mobile */}
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-4 snap-x snap-mandatory md:snap-none">
            {stats.map((s) => (
              <div key={s.label} className="snap-start">
                <StatCard {...s} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-7 border-b border-gray-200">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                  active
                    ? "border-[#E8473F] text-[#E8473F]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "overview" && (
          <OverviewTab
            bookings={mockBookings}
            messages={mockMessages}
            savedStays={mockSavedStays}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "bookings" && (
          <div>
            <SectionHeading title="Upcoming & active bookings" />
            <div className="space-y-4">
              {mockBookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <SectionHeading title="Messages" />
            <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {mockMessages.map((m) => (
                <MessageItem key={m.id} message={m} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div>
            <SectionHeading title="Saved stays" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockSavedStays.map((s) => (
                <SavedStayCard key={s.id} stay={s} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "trips" && (
          <div>
            <SectionHeading title="Past trips" />
            <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm px-5">
              {mockPastTrips.map((t) => (
                <PastTripCard
                  key={t.id}
                  trip={t}
                  onLeaveReview={(id) => console.log("review", id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && <SettingsTab />}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <MobileBottomNav />
    </div>
  );
}
