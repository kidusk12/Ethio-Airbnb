import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  LayoutGrid,
  CalendarCheck,
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

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "saved", label: "Saved stays", icon: Heart },
  { id: "trips", label: "Past trips", icon: History },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="w-[34px] h-[34px] rounded-full bg-amber-600 flex items-center justify-center">
      <HomeIcon size={17} className="text-white" strokeWidth={2.5} />
    </div>
    <span className="font-serif text-[22px] font-bold tracking-tight">
      <span className="text-stone-900">Sheba</span>
      <span className="text-amber-600">Stays</span>
    </span>
  </Link>
);

function ProfileMenu({ name, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-stone-200 hover:border-stone-300 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[13px] font-semibold">
          {name?.[0]?.toUpperCase() || "G"}
        </div>
        <ChevronDown size={14} className="text-stone-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 z-50">
            <div className="px-3.5 py-2 border-b border-stone-100 mb-1">
              <p className="text-[13px] font-semibold text-stone-900 truncate">{name}</p>
            </div>
            <Link to="/dashboard" className="block px-3.5 py-2 text-[13px] text-stone-700 hover:bg-stone-50">
              My Dashboard
            </Link>
            <Link to="/dashboard?tab=saved" className="block px-3.5 py-2 text-[13px] text-stone-700 hover:bg-stone-50">
              Saved Stays
            </Link>
            <Link to="/dashboard?tab=settings" className="block px-3.5 py-2 text-[13px] text-stone-700 hover:bg-stone-50">
              Settings
            </Link>
            <button
              onClick={onLogout}
              className="w-full text-left px-3.5 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1 border-t border-stone-100 pt-2"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Logo />

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/explore" className="text-stone-600 hover:text-stone-900 text-[14px] transition-colors">
              Explore
            </Link>
            <Link to="/dashboard?tab=bookings" className="text-stone-600 hover:text-stone-900 text-[14px] transition-colors">
              Stays
            </Link>
            <Link to="/dashboard?tab=messages" className="text-stone-600 hover:text-stone-900 text-[14px] transition-colors">
              Messages
            </Link>
            <Link to="/help" className="text-stone-600 hover:text-stone-900 text-[14px] transition-colors">
              Help
            </Link>
            <Link to="/host" className="text-stone-600 hover:text-stone-900 text-[14px] transition-colors">
              Become a Host
            </Link>
          </nav>

          <ProfileMenu name={user?.name || mockGuest.name} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

function OverviewTab({ bookings, messages, savedStays, setActiveTab }) {
  return (
    <div className="space-y-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white">
          <div className="px-5 pt-5">
            <SectionHeading
              title="Messages"
              compact
              action={{ label: "See all", onClick: () => setActiveTab("messages") }}
            />
          </div>
          <div className="pb-2">
            {messages.slice(0, 3).map((m) => (
              <MessageItem key={m.id} message={m} />
            ))}
          </div>
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

function SectionHeading({ title, action, compact }) {
  return (
    <div className={`flex items-center justify-between ${compact ? "mb-2" : "mb-4"}`}>
      <h2 className={`font-serif font-bold text-stone-900 ${compact ? "text-[16px]" : "text-[20px]"}`}>
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[13px] font-medium text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
        >
          {action.label}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function SettingsTab() {
  const items = [
    { icon: ShieldCheck, title: "Account & security", desc: "Password, two-factor authentication, login activity" },
    { icon: CreditCard, title: "Payment methods", desc: "Telebirr, CBE Birr, and saved cards" },
    { icon: Wallet, title: "Payouts & receipts", desc: "Download invoices for past stays" },
    { icon: LifeBuoy, title: "Help & support", desc: "Contact the Sheba Stays support center" },
  ];

  return (
    <div className="max-w-2xl">
      <SectionHeading title="Account & settings" />
      <div className="rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100">
        {items.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-stone-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Icon size={17} className="text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-stone-900">{title}</p>
              <p className="text-[12px] text-stone-500">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const guestName = user?.name || mockGuest.name;

  const stats = useMemo(
    () => [
      { icon: CalendarCheck, label: "Upcoming trips", value: mockBookings.length },
      { icon: Heart, label: "Saved favorites", value: mockSavedStays.length },
      { icon: MessageCircle, label: "Unread messages", value: mockMessages.filter((m) => m.unread).length },
      { icon: Wallet, label: "Spent this year", value: `ETB ${mockGuest.totalSpentETB.toLocaleString()}` },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-0">
      <DashboardHeader />

      <main className="max-w-[1200px] mx-auto px-6 pt-8 pb-14">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl md:text-[28px] font-bold text-stone-900 mb-1">
            Welcome back, {guestName}! 🇪🇹
          </h1>
          <p className="text-stone-500 text-[14px] mb-5">
            Here's what's happening with your trips.
          </p>

          <div className="flex gap-3 overflow-x-auto pb-1 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto mb-8 border-b border-stone-200 -mx-6 px-6 md:mx-0 md:px-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
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
          <div className="max-w-2xl rounded-2xl border border-stone-200 bg-white">
            <div className="px-5 pt-5">
              <SectionHeading title="Messages" compact />
            </div>
            <div className="pb-2">
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
          <div className="max-w-2xl">
            <SectionHeading title="Past trips" />
            <div className="rounded-2xl border border-stone-200 bg-white px-5">
              {mockPastTrips.map((t) => (
                <PastTripCard key={t.id} trip={t} onLeaveReview={(id) => console.log("review", id)} />
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