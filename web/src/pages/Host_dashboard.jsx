import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, WalletCards, Building2, Star,
  ArrowUpRight, List as ListIcon, MessageSquare, Home,
  PanelLeft, X, Calendar as CalendarIcon, Clock,
  Settings, LogOut, Trash2, CheckCircle2, Loader2, AlertCircle,
} from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import { useAuth } from '../context/AuthContext';
import { getMyListings, getHostBookings, deleteListing } from '../lib/api';

// ── Status badge helpers ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  'bg-amber-50 text-amber-700 border border-amber-100',
  approved: 'bg-green-50 text-green-700 border border-green-100',
  rejected: 'bg-red-50 text-red-600 border border-red-100',
};

const BOOKING_STATUS_STYLES = {
  pending_payment: 'bg-amber-50 text-amber-700',
  confirmed:       'bg-green-50 text-green-700',
  cancelled:       'bg-red-50 text-red-600',
};

const BOOKING_STATUS_LABELS = {
  pending_payment: 'Awaiting Payment',
  confirmed:       'Confirmed',
  cancelled:       'Cancelled',
};

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-ET', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      <p className="mt-4 font-serif text-[30px] md:text-[34px] font-bold leading-none text-foreground">{value}</p>
      {helper && <p className="mt-2 text-[12px] text-muted-foreground font-medium">{helper}</p>}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

function Host_dashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab]       = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // API state
  const [listings, setListings]           = useState([]);
  const [bookings, setBookings]           = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');
  const [bookingsError, setBookingsError] = useState('');

  const hostFirstName = user?.firstName ?? (user?.name ? user.name.split(' ')[0] : 'Host');
  const initialLetter = hostFirstName.charAt(0).toUpperCase();

  // ── Fetch ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;
    setListingsLoading(true);
    getMyListings(token)
      .then(({ status, body }) => {
        if (status === 200) setListings(body.data?.listings ?? []);
        else setListingsError('Failed to load listings.');
      })
      .catch(() => setListingsError('Network error loading listings.'))
      .finally(() => setListingsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setBookingsLoading(true);
    getHostBookings(token)
      .then(({ status, body }) => {
        if (status === 200) setBookings(body.data?.bookings ?? []);
        else setBookingsError('Failed to load bookings.');
      })
      .catch(() => setBookingsError('Network error loading bookings.'))
      .finally(() => setBookingsLoading(false));
  }, [token]);

  // ── Derived stats ────────────────────────────────────────────────────────

  const activeListingsCount    = listings.filter((l) => l.status === 'approved' && l.active).length;
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;
  const totalEarnings          = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

  const reviewScore = listings.length > 0
    ? (listings.reduce((sum) => sum, 0) / listings.length)
    : null;

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Remove this listing? This cannot be undone.')) return;
    try {
      const { status } = await deleteListing(token, id);
      if (status === 200) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      // silent — user can retry
    }
  };

  const tabs = [
    { label: 'Overview',  icon: Home },
    { label: 'Listings',  icon: ListIcon },
    { label: 'Bookings',  icon: CalendarIcon },
    { label: 'Reviews',   icon: MessageSquare },
  ];

  const sidebarLinks = [
    { label: 'Overview',        icon: Home,        tab: 'Overview' },
    { label: 'My Listings',     icon: ListIcon,    tab: 'Listings',  count: listings.length },
    { label: 'Bookings',        icon: CalendarIcon, tab: 'Bookings', count: confirmedBookingsCount },
    { label: 'Profile Settings',icon: Settings,    action: () => navigate('/profile') },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavBar1 />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-[100] flex flex-col justify-between p-5 transition-transform duration-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white font-bold text-[15px] flex items-center justify-center shadow-sm">{initialLetter}</div>
              <div>
                <h3 className="font-bold text-[14px] text-foreground leading-tight">{hostFirstName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full mt-0.5">
                  <CheckCircle2 size={10} /> Verified Host
                </span>
              </div>
            </div>
            <button type="button" onClick={() => setIsSidebarOpen(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted-foreground"><X size={16} /></button>
          </div>

          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button key={item.label} type="button"
                  onClick={() => { if (item.action) { item.action(); } else { setActiveTab(item.tab); } setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-foreground hover:bg-gray-100/80'}`}>
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-primary flex-shrink-0'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
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

      {/* Content */}
      <div className={`transition-all duration-200 ${isSidebarOpen ? 'md:ml-72' : ''}`}>
        {/* Top bar */}
        <div className="pt-20 pb-2 px-6 max-w-[1440px] mx-auto flex items-center justify-between">
          <button type="button" onClick={() => setIsSidebarOpen(true)} title="Open menu"
            className="w-10 h-10 rounded-2xl bg-white border border-border hover:border-primary text-foreground flex items-center justify-center shadow-sm hover:shadow transition-all group">
            <PanelLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <button type="button" onClick={() => navigate('/host/list')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-[#c82333] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all">
            <Plus size={18} /> Add property
          </button>
        </div>

        {/* Main */}
        <main className="w-full px-6 py-6 md:px-10 max-w-[1440px] mx-auto">
          {/* Welcome banner */}
          <div className="mb-8">
            <h1 className="font-serif text-[34px] md:text-[40px] font-bold leading-tight text-foreground">Welcome back, {hostFirstName}!</h1>
            <p className="text-[14px] text-muted-foreground mt-1">Here's what's happening with your properties.</p>
          </div>

          {/* Stats grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard label="Total earnings" value={`ETB ${totalEarnings.toLocaleString()}`} helper="From confirmed bookings" icon={WalletCards} />
            <StatCard label="Active listings" value={listingsLoading ? '…' : activeListingsCount} helper={`${listings.length} listing${listings.length !== 1 ? 's' : ''} total`} icon={Building2} />
            <StatCard label="Confirmed bookings" value={bookingsLoading ? '…' : confirmedBookingsCount} helper="Guests currently or upcoming" icon={CalendarIcon} />
            <StatCard label="Review score" value="—" helper="Based on guest reviews" icon={Star} />
          </div>

          {/* Tabs bar */}
          <div className="mb-8 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-2xl bg-[#f4f1eb] p-1.5 border border-border/50">
            {tabs.map(({ label, icon: Icon }) => {
              const active = activeTab === label;
              return (
                <button key={label} type="button" onClick={() => setActiveTab(label)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-bold transition-all ${active ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon size={15} /> {label}
                </button>
              );
            })}
          </div>

          {/* ── Overview tab ── */}
          {activeTab === 'Overview' && (
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              {/* Listings summary */}
              <section className="rounded-3xl border border-border bg-white p-7 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-[24px] font-bold text-foreground">Your properties</h2>
                    <p className="text-[13px] text-muted-foreground">Manage your current active places</p>
                  </div>
                  <button type="button" onClick={() => setActiveTab('Listings')} className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:underline">
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>
                {listingsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4"><Loader2 size={18} className="animate-spin text-primary" /> Loading listings…</div>
                ) : listingsError ? (
                  <p className="text-red-600 text-[13px]">{listingsError}</p>
                ) : listings.length === 0 ? (
                  <p className="text-muted-foreground text-[14px]">No listings yet. <button type="button" onClick={() => navigate('/host/list')} className="text-primary font-semibold hover:underline">Add your first property.</button></p>
                ) : (
                  <div className="divide-y divide-border">
                    {listings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><Building2 size={22} /></div>
                          <div className="min-w-0">
                            <p className="font-bold text-[15px] text-foreground truncate">{listing.title}</p>
                            <p className="text-[13px] text-muted-foreground truncate">{listing.subCity}, {listing.city} · {listing.category}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[15px] text-foreground">ETB {Number(listing.pricePerNight || 0).toLocaleString()}<span className="text-[12px] font-normal text-muted-foreground">/nt</span></p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS_STYLES[listing.status] ?? 'bg-gray-50 text-gray-600'}`}>{listing.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent bookings */}
              <section className="rounded-3xl border border-border bg-white p-7 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-[24px] font-bold text-foreground">Recent reservations</h2>
                    <p className="text-[13px] text-muted-foreground">Upcoming guest stays</p>
                  </div>
                </div>
                {bookingsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4"><Loader2 size={18} className="animate-spin text-primary" /> Loading bookings…</div>
                ) : bookingsError ? (
                  <p className="text-red-600 text-[13px]">{bookingsError}</p>
                ) : bookings.length === 0 ? (
                  <p className="text-muted-foreground text-[14px]">No bookings yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {bookings.slice(0, 4).filter((b) => b.status !== 'cancelled').map((booking) => (
                      <div key={booking.id} className="p-4 rounded-2xl bg-gray-50/70 border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-[14px] text-foreground">{booking.guestName}</p>
                          <span className="font-bold text-[14px] text-primary">ETB {Number(booking.totalPrice).toLocaleString()}</span>
                        </div>
                        <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                          <Clock size={13} /> {fmtDate(booking.checkIn)} – {fmtDate(booking.checkOut)}
                        </p>
                        <span className={`mt-1.5 inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${BOOKING_STATUS_STYLES[booking.status] ?? 'bg-gray-50 text-gray-600'}`}>
                          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── Listings tab ── */}
          {activeTab === 'Listings' && (
            <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-[28px] font-bold text-foreground">My Properties ({listings.length})</h2>
                  <p className="text-[14px] text-muted-foreground">Manage your listed properties.</p>
                </div>
                <button type="button" onClick={() => navigate('/host/list')}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-[#c82333] px-5 py-3 text-[14px] font-bold text-white shadow-sm transition-all">
                  <Plus size={18} /> Add new place
                </button>
              </div>

              {listingsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={20} className="animate-spin text-primary" /> Loading…</div>
              ) : listingsError ? (
                <p className="text-red-600 text-[14px]">{listingsError}</p>
              ) : listings.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">You have no listings yet.</p>
                  <button type="button" onClick={() => navigate('/host/list')} className="bg-primary text-white px-6 py-3 rounded-xl font-bold">List your first property</button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
                    <div key={listing.id} className="rounded-3xl border border-border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {listing.coverPhoto ? (
                        <div className="aspect-[16/9] w-full bg-gray-100 overflow-hidden relative">
                          <img src={listing.coverPhoto} alt={listing.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold uppercase tracking-wider text-foreground">{listing.category}</div>
                        </div>
                      ) : (
                        <div className="aspect-[16/9] w-full bg-gray-100 flex items-center justify-center text-muted-foreground text-sm">{listing.category}</div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-[16px] text-foreground mb-1 truncate">{listing.title}</h3>
                        <p className="text-[13px] text-muted-foreground mb-1">{listing.subCity}, {listing.city}</p>
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full capitalize mb-3 ${STATUS_STYLES[listing.status] ?? 'bg-gray-50 text-gray-600'}`}>{listing.status}</span>
                        {listing.status === 'rejected' && listing.rejectionReason && (
                          <p className="text-[12px] text-red-600 mb-2 flex items-start gap-1.5"><AlertCircle size={13} className="flex-shrink-0 mt-0.5" />{listing.rejectionReason}</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <p className="text-[16px] font-bold text-primary">ETB {Number(listing.pricePerNight || 0).toLocaleString()}<span className="text-[12px] font-normal text-muted-foreground"> / night</span></p>
                          <button type="button" onClick={() => handleDeleteListing(listing.id)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="Remove listing">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Bookings tab ── */}
          {activeTab === 'Bookings' && (
            <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <h2 className="font-serif text-[28px] font-bold text-foreground mb-2">Guest Bookings</h2>
              <p className="text-[14px] text-muted-foreground mb-6">All bookings across your properties.</p>

              {bookingsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={20} className="animate-spin text-primary" /> Loading…</div>
              ) : bookingsError ? (
                <p className="text-red-600 text-[14px]">{bookingsError}</p>
              ) : bookings.length === 0 ? (
                <p className="text-muted-foreground text-[14px]">No bookings yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-5 rounded-2xl border border-border bg-gray-50/50">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-bold text-[16px] text-foreground">{booking.guestName}</p>
                          <p className="text-[14px] text-muted-foreground">{booking.listingTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[16px] text-primary">ETB {Number(booking.totalPrice).toLocaleString()}</p>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${BOOKING_STATUS_STYLES[booking.status] ?? 'bg-gray-50 text-gray-600'}`}>
                            {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[13px] text-muted-foreground">
                        <span className="flex items-center gap-1.5"><CalendarIcon size={13} /> {fmtDate(booking.checkIn)} – {fmtDate(booking.checkOut)}</span>
                        <span>{booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Reviews tab ── */}
          {activeTab === 'Reviews' && (
            <section className="rounded-3xl border border-border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Star size={24} /></div>
                <div>
                  <h2 className="font-serif text-[28px] font-bold text-foreground">Guest Reviews &amp; Feedback</h2>
                  <p className="text-[14px] text-muted-foreground">Reviews appear here after guests complete their stays.</p>
                </div>
              </div>
              <p className="text-muted-foreground text-[14px]">Guest reviews for your listings will appear here once guests have checked out and submitted their reviews.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Host_dashboard;
