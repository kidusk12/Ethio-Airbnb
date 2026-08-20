import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  WalletCards,
  Building2,
  Star,
  ArrowUpRight,
  List as ListIcon,
  Banknote,
  MessageSquare,
  Home,
  PanelLeft,
  X,
  Calendar as CalendarIcon,
  Clock,
  Settings,
  LogOut,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import Calendar from '../components/Calendar';
import { useAuth } from '../context/AuthContext';

const getStoredArray = (keys) => {
  for (const key of keys) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      if (Array.isArray(value) && value.length > 0) return value;
    } catch {
      // Ignore
    }
  }
  return [];
};

function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>

      <p className="mt-4 font-serif text-[30px] md:text-[34px] font-bold leading-none text-foreground">
        {value}
      </p>

      {helper && (
        <p className="mt-2 text-[12px] text-muted-foreground font-medium">{helper}</p>
      )}
    </div>
  );
}

function Host_dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic host identity
  const hostFirstName = (() => {
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name.split(' ')[0];
    try {
      const stored = localStorage.getItem('ethio_user') || localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.firstName) return parsed.firstName;
        if (parsed?.name) return parsed.name.split(' ')[0];
      }
    } catch {
      // ignore
    }
    return 'Host';
  })();

  const initialLetter = hostFirstName.charAt(0).toUpperCase() || 'H';

  // Load listings from localStorage or fallback
  const [listings, setListings] = useState(() => {
    const stored = getStoredArray(['hostListings', 'properties', 'listings']);
    if (stored.length > 0) return stored;
    return [
      {
        id: 'bole-skyline-suite',
        title: 'Bole Skyline Luxury Suite',
        name: 'Bole Skyline Luxury Suite',
        type: 'Apartment',
        city: 'Addis Ababa',
        subCity: 'Bole',
        location: 'Bole, Addis Ababa',
        price: 4800,
        nightlyPrice: 4800,
        rating: 4.92,
        reviews: 18,
        status: 'Active',
      },
    ];
  });

  const bookings = [
    {
      id: 'bk-101',
      guestName: 'Dawit Mekonnen',
      propertyName: listings[0]?.title || 'Bole Skyline Suite',
      dates: 'Aug 22 – Aug 26, 2026',
      amount: 19200,
      status: 'Confirmed',
    },
    {
      id: 'bk-102',
      guestName: 'Hana Girma',
      propertyName: listings[0]?.title || 'Bole Skyline Suite',
      dates: 'Sep 01 – Sep 04, 2026',
      amount: 14400,
      status: 'Upcoming',
    },
  ];

  const totalEarnings = useMemo(() => {
    return listings.reduce((sum, item) => sum + (Number(item.price || item.nightlyPrice || 0) * 8), 42600);
  }, [listings]);

  const reviewScore = 4.92;

  const goToNewProperty = () => {
    navigate('/host/list');
  };

  const deleteListing = (id) => {
    const updated = listings.filter((l) => l.id !== id);
    setListings(updated);
    try {
      localStorage.setItem('hostListings', JSON.stringify(updated));
      localStorage.setItem('properties', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const tabs = [
    { label: 'Overview', icon: Home },
    { label: 'Listings', icon: ListIcon },
    { label: 'Reviews', icon: MessageSquare },
  ];

  const sidebarLinks = [
    { label: 'Overview', icon: Home, tab: 'Overview' },
    { label: 'My Listings', icon: ListIcon, tab: 'Listings', count: listings.length },
    { label: 'Profile Settings', icon: Settings, action: () => navigate('/profile') },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavBar1 />

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
                  {hostFirstName}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full mt-0.5">
                  <CheckCircle2 size={10} /> Verified Host
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
              const isActive = activeTab === item.tab;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.tab) {
                      setActiveTab(item.tab);
                    }
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
                  {item.count !== undefined && (
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
              logout();
              navigate('/');
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
        {/* Top Bar with Sidebar Icon Toggle & Add Property */}
        <div className="pt-20 pb-2 px-6 max-w-[1440px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Open menu"
            className="w-10 h-10 rounded-2xl bg-white border border-border hover:border-primary text-foreground flex items-center justify-center shadow-sm hover:shadow transition-all group"
          >
            <PanelLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            onClick={goToNewProperty}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-[#c82333] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all"
          >
            <Plus size={18} />
            Add property
          </button>
        </div>

        {/* Main Content Container */}
        <main className="w-full px-6 py-6 md:px-10 max-w-[1440px] mx-auto">
          {/* Welcome Banner */}
          <div className="mb-8">
            <h1 className="font-serif text-[34px] md:text-[40px] font-bold leading-tight text-foreground">
              Welcome back, {hostFirstName}!
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Here is what's happening with your properties.
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              label="Total earnings"
              value={`ETB ${totalEarnings.toLocaleString()}`}
              helper="ETB payouts direct to CBE / Telebirr"
              icon={WalletCards}
            />

            <StatCard
              label="Active listings"
              value={listings.length}
              helper={`${listings.length} property listed`}
              icon={Building2}
            />

            <StatCard
              label="Confirmed bookings"
              value={bookings.length}
              helper="2 guest arrivals upcoming"
              icon={CalendarIcon}
            />

            <StatCard
              label="Host rating score"
              value={reviewScore.toFixed(2)}
              helper="Based on guest reviews"
              icon={Star}
            />
          </div>

          {/* Navigation Tabs Bar */}
          <div className="mb-8 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-2xl bg-[#f4f1eb] p-1.5 border border-border/50">
            {tabs.map(({ label, icon: Icon }) => {
              const active = activeTab === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveTab(label)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-bold transition-all ${
                    active
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              {/* Left: Listings Card */}
              <section className="rounded-3xl border border-border bg-white p-7 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-[24px] font-bold text-foreground">
                      Your properties
                    </h2>
                    <p className="text-[13px] text-muted-foreground">Manage your current active places</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Listings')}
                    className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:underline"
                  >
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="divide-y divide-border">
                  {listings.map((listing) => (
                    <div key={listing.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Building2 size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[15px] text-foreground truncate">
                            {listing.title || listing.name}
                          </p>
                          <p className="text-[13px] text-muted-foreground truncate">
                            {listing.location || `${listing.subCity}, ${listing.city}`} · {listing.type}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[15px] text-foreground">
                          ETB {Number(listing.price || listing.nightlyPrice || 0).toLocaleString()}
                          <span className="text-[12px] font-normal text-muted-foreground">/nt</span>
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-bold">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Right: Upcoming Reservations */}
              <section className="rounded-3xl border border-border bg-white p-7 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-[24px] font-bold text-foreground">
                      Recent reservations
                    </h2>
                    <p className="text-[13px] text-muted-foreground">Upcoming guest stays</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 rounded-2xl bg-gray-50/70 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-[14px] text-foreground">{booking.guestName}</p>
                        <span className="font-bold text-[14px] text-primary">
                          ETB {booking.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                        <Clock size={13} /> {booking.dates}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: LISTINGS */}
          {activeTab === 'Listings' && (
            <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[28px] font-bold text-foreground">
                    My Properties ({listings.length})
                  </h2>
                  <p className="text-[14px] text-muted-foreground">
                    Update your descriptions, nightly prices, and photos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToNewProperty}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-[#c82333] px-5 py-3 text-[14px] font-bold text-white shadow-sm transition-all"
                >
                  <Plus size={18} />
                  Add new place
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <div key={listing.id} className="rounded-3xl border border-border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    {listing.image && (
                      <div className="aspect-[16/9] w-full bg-gray-100 overflow-hidden relative">
                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold uppercase tracking-wider text-foreground">
                          {listing.type || 'Property'}
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="font-bold text-[16px] text-foreground mb-1 truncate">
                        {listing.title || listing.name}
                      </h3>
                      <p className="text-[13px] text-muted-foreground mb-3">
                        {listing.location || `${listing.subCity}, ${listing.city}`}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <p className="text-[16px] font-bold text-primary">
                          ETB {Number(listing.price || listing.nightlyPrice || 0).toLocaleString()}
                          <span className="text-[12px] font-normal text-muted-foreground"> / night</span>
                        </p>

                        <button
                          type="button"
                          onClick={() => deleteListing(listing.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'Reviews' && (
            <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Star size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-[28px] font-bold text-foreground">
                    Guest Reviews & Feedback
                  </h2>
                  <p className="text-[14px] text-muted-foreground">
                    Overall rating score: <strong>4.92 / 5.0</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Bethlehem Alemu', comment: 'Wonderful host! The apartment was spotless and exactly as described in Bole.', date: 'Aug 2026', rating: 5 },
                  { name: 'Michael Jenkins', comment: 'Fast Wi-Fi, great location, and very responsive communication. Will stay again.', date: 'Jul 2026', rating: 5 },
                ].map((rev, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-border bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-[15px] text-foreground">{rev.name}</p>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-bold">{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-[14px] text-muted-foreground">{rev.comment}</p>
                    <p className="text-[12px] text-muted-foreground/80 mt-2">{rev.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Host_dashboard;