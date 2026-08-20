import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Menu, FileText, ArrowUpRight, ArrowDownLeft,
  LogOut, AlertCircle, Clock, Wallet, Users,
  Building2, CalendarCheck, Hourglass, Loader2,
  CheckCircle2, ExternalLink, Star,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import NavBar1 from '../components/NavBar1';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';
import {
  adminGetStats, adminGetPendingListings, adminGetAllListings,
  adminApproveListing, adminRejectListing, adminDeleteListing,
  adminGetPendingPayments, adminConfirmPayment, adminRejectPayment,
  adminGetDuePayouts, adminMarkPayoutPaid,
  adminGetTransactions, adminGetReviews, adminDeleteReview,
} from '../lib/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const A      = "#E8473F";
const A_LITE = "#fdf2f2";
const STATUS_COLORS = { Approved: '#10b981', Pending: '#f59e0b', Rejected: A };

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-ET', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function hoursAgo(str) {
  if (!str) return '';
  const diff = Date.now() - new Date(str).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m ago`;
  return `${m}m ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function OverviewCard({ label, value, helper, icon: Icon, tone = 'primary', changeLabel, changePositive }) {
  const iconWrapClass = tone === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary';
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-semibold text-gray-500">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconWrapClass}`}><Icon size={17} strokeWidth={2} /></div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[26px] font-extrabold leading-none text-gray-900">{value}</p>
        {changeLabel && (
          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${changePositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{changeLabel}</span>
        )}
      </div>
      {helper && <p className={`mt-1.5 text-[11px] font-medium ${tone === 'warning' ? 'text-amber-600' : 'text-gray-400'}`}>{helper}</p>}
    </div>
  );
}

function LoadingSection() {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
      <Loader2 size={24} className="animate-spin text-primary" />
      <span>Loading…</span>
    </div>
  );
}

function ErrorSection({ message, onRetry }) {
  return (
    <div className="py-16 text-center">
      <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
      <p className="text-red-600 text-[14px] mb-3">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="text-primary text-[13px] font-semibold hover:underline">Retry</button>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [activeTab, setActiveTab]       = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── API state ────────────────────────────────────────────────────────────
  const [stats, setStats]               = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError]     = useState('');

  const [listings, setListings]           = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState('');
  const [rejectModal, setRejectModal]     = useState(null); // { id, title }
  const [rejectReason, setRejectReason]   = useState('');

  const [payments, setPayments]           = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');
  const [paymentRefCodes, setPaymentRefCodes] = useState({}); // { paymentId: code }

  const [payouts, setPayouts]             = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsError, setPayoutsError]   = useState('');
  const [payoutRefCodes, setPayoutRefCodes] = useState({});

  const [transactions, setTransactions]   = useState([]);
  const [txLoading, setTxLoading]         = useState(false);
  const [txError, setTxError]             = useState('');

  const [reviews, setReviews]             = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError]   = useState('');

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true); setStatsError('');
    try {
      const { status, body } = await adminGetStats(token);
      if (status === 200) setStats(body.data);
      else setStatsError('Failed to load stats.');
    } catch { setStatsError('Network error.'); }
    finally { setStatsLoading(false); }
  }, [token]);

  const fetchListings = useCallback(async () => {
    setListingsLoading(true); setListingsError('');
    try {
      const { status, body } = await adminGetAllListings(token);
      if (status === 200) setListings(body.data?.listings ?? []);
      else setListingsError('Failed to load listings.');
    } catch { setListingsError('Network error.'); }
    finally { setListingsLoading(false); }
  }, [token]);

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true); setPaymentsError('');
    try {
      const { status, body } = await adminGetPendingPayments(token);
      if (status === 200) setPayments(body.data?.payments ?? []);
      else setPaymentsError('Failed to load payments.');
    } catch { setPaymentsError('Network error.'); }
    finally { setPaymentsLoading(false); }
  }, [token]);

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true); setPayoutsError('');
    try {
      const { status, body } = await adminGetDuePayouts(token);
      if (status === 200) setPayouts(body.data?.payouts ?? []);
      else setPayoutsError('Failed to load payouts.');
    } catch { setPayoutsError('Network error.'); }
    finally { setPayoutsLoading(false); }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true); setTxError('');
    try {
      const { status, body } = await adminGetTransactions(token);
      if (status === 200) setTransactions(body.data?.transactions ?? []);
      else setTxError('Failed to load transactions.');
    } catch { setTxError('Network error.'); }
    finally { setTxLoading(false); }
  }, [token]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true); setReviewsError('');
    try {
      const { status, body } = await adminGetReviews(token);
      if (status === 200) setReviews(body.data?.reviews ?? []);
      else setReviewsError('Failed to load reviews.');
    } catch { setReviewsError('Network error.'); }
    finally { setReviewsLoading(false); }
  }, [token]);

  // Fetch on mount
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Fetch tab data on tab change
  useEffect(() => {
    if (activeTab === 'listings')     fetchListings();
    if (activeTab === 'payments')     fetchPayments();
    if (activeTab === 'payouts')      fetchPayouts();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'reviews')      fetchReviews();
  }, [activeTab]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleApproveListing = async (id) => {
    const { status } = await adminApproveListing(token, id);
    if (status === 200) setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'approved' } : l));
  };

  const handleRejectListing = async () => {
    if (!rejectModal) return;
    const { status } = await adminRejectListing(token, rejectModal.id, rejectReason);
    if (status === 200) {
      setListings((prev) => prev.map((l) => l.id === rejectModal.id ? { ...l, status: 'rejected', rejectionReason: rejectReason } : l));
      setRejectModal(null); setRejectReason('');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Permanently remove this listing?')) return;
    const { status } = await adminDeleteListing(token, id);
    if (status === 200) setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const handleConfirmPayment = async (paymentId) => {
    const code = (paymentRefCodes[paymentId] || '').trim();
    if (!code) return;
    const { status } = await adminConfirmPayment(token, paymentId, code);
    if (status === 200) {
      setPayments((prev) => prev.filter((p) => p.paymentId !== paymentId));
      fetchStats();
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = window.prompt('Reason for rejection (optional):') ?? '';
    const { status } = await adminRejectPayment(token, paymentId, reason);
    if (status === 200) setPayments((prev) => prev.filter((p) => p.paymentId !== paymentId));
  };

  const handleMarkPayoutPaid = async (payoutId) => {
    const code = (payoutRefCodes[payoutId] || '').trim();
    if (!code) return;
    const { status } = await adminMarkPayoutPaid(token, payoutId, code);
    if (status === 200) {
      setPayouts((prev) => prev.filter((p) => p.payoutId !== payoutId));
      fetchStats();
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Remove this review?')) return;
    const { status } = await adminDeleteReview(token, reviewId);
    if (status === 200) setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const pendingListingsCount  = listings.filter((l) => l.status === 'pending' && l.active).length;
  const pendingPaymentsCount  = payments.length;
  const pendingPayoutsCount   = payouts.length;

  const propertyStatusData = useMemo(() => {
    if (!listings.length && !stats) return [];
    if (stats) {
      return [
        { name: 'Approved', value: Number(stats.approvedListings || 0) },
        { name: 'Pending',  value: Number(stats.pendingListings  || 0) },
        { name: 'Rejected', value: Number(stats.rejectedListings || 0) },
      ];
    }
    return [
      { name: 'Approved', value: listings.filter((l) => l.status === 'approved').length },
      { name: 'Pending',  value: listings.filter((l) => l.status === 'pending').length },
      { name: 'Rejected', value: listings.filter((l) => l.status === 'rejected').length },
    ];
  }, [listings, stats]);

  const totalListingsForChart = propertyStatusData.reduce((s, d) => s + d.value, 0);

  const sidebarLinks = [
    { label: 'Overview',               key: 'overview' },
    { label: 'Listings approval',       key: 'listings',     badge: pendingListingsCount },
    { label: 'Payments verification',   key: 'payments',     badge: pendingPaymentsCount },
    { label: 'Payouts due',             key: 'payouts',      badge: pendingPayoutsCount },
    { label: 'Transaction log',         key: 'transactions' },
    { label: 'Review moderation',       key: 'reviews' },
    { label: 'Profile Settings',        key: 'profile' },
  ];

  const getPageTitle = () => {
    const found = sidebarLinks.find((l) => l.key === activeTab);
    return found?.label ?? 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-foreground font-sans flex flex-col pb-10">
      <NavBar1 userName="Admin" onLogout={() => { logout(); navigate('/'); }} dashboardLabel="Admin Portal" dashboardLink="/admin" showProfileLink={false} />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-[100] flex flex-col justify-between p-5 transition-transform duration-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-[16px] flex items-center justify-center shadow-inner">A</div>
              <div>
                <h3 className="font-bold text-[14px] text-foreground leading-tight">Admin</h3>
                <span className="text-[11px] text-gray-500 font-medium">Administrator</span>
              </div>
            </div>
            <button type="button" onClick={() => setIsSidebarOpen(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted-foreground"><X size={16} /></button>
          </div>
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button key={item.key} type="button"
                  onClick={() => { setActiveTab(item.key); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-foreground hover:bg-gray-100/80'}`}>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{item.badge}</span>
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
      <div className={`flex-1 transition-all duration-200 ${isSidebarOpen ? 'md:ml-72' : ''}`}>
        <header className={`fixed top-16 left-0 right-0 h-14 bg-[#FAF6F0] border-b border-gray-200/60 z-30 px-4 flex items-center gap-3 transition-all duration-200 ${isSidebarOpen ? 'md:left-72' : ''}`}>
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="p-1 rounded-lg hover:bg-gray-200/50 transition-colors text-gray-800"><Menu size={22} /></button>
          <h1 className="text-[17px] font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
        </header>

        <main className={`w-full mx-auto px-4 pt-32 flex-1 pb-12 ${activeTab === 'overview' ? 'max-w-[1120px]' : 'max-w-[860px]'}`}>

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {statsLoading ? <LoadingSection /> : statsError ? <ErrorSection message={statsError} onRetry={fetchStats} /> : stats ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <OverviewCard label="Total Users"        value={stats.totalUsers}                          helper="Registered accounts"    icon={Users} />
                    <OverviewCard label="Total Properties"   value={stats.totalListings}                       helper="Listed on platform"     icon={Building2} />
                    <OverviewCard label="Total Bookings"     value={stats.totalBookings}                       helper={`${stats.confirmedBookings} confirmed`} icon={CalendarCheck} />
                    <OverviewCard label="Total Revenue"      value={`ETB ${Number(stats.totalRevenue || 0).toLocaleString()}`} helper="Confirmed payments"  icon={Wallet} />
                    <OverviewCard label="Pending Approvals"  value={stats.pendingListings}                     helper="Listings awaiting review" icon={Hourglass} tone="warning" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Property status donut */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                      <h3 className="text-[14px] font-bold text-gray-900 mb-1">Property Status</h3>
                      <p className="text-[11px] text-gray-400 mb-4">Approval status across all listings</p>
                      {totalListingsForChart === 0 ? (
                        <div className="py-10 text-center text-gray-400 text-[13px]">No listings yet.</div>
                      ) : (
                        <>
                          <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer>
                              <PieChart>
                                <Pie data={propertyStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                                  {propertyStatusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [`${v} properties`, n]} contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-2 space-y-2">
                            {propertyStatusData.map((entry) => {
                              const pct = totalListingsForChart ? Math.round((entry.value / totalListingsForChart) * 100) : 0;
                              return (
                                <div key={entry.name} className="flex items-center justify-between text-[13px]">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] }} />
                                    <span className="text-gray-700 font-medium">{entry.name}</span>
                                  </div>
                                  <span className="text-gray-500">{entry.value} <span className="text-gray-400">({pct}%)</span></span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                      <h3 className="text-[14px] font-bold text-gray-900 mb-1">Pending Actions</h3>
                      <p className="text-[11px] text-gray-400 mb-4">Items requiring your attention</p>
                      <div className="space-y-3">
                        {[
                          { label: 'Listings to approve', count: stats.pendingListings, tab: 'listings', color: '#f59e0b' },
                          { label: 'Payments to verify', count: pendingPaymentsCount, tab: 'payments', color: '#3b82f6' },
                          { label: 'Payouts due',         count: pendingPayoutsCount,  tab: 'payouts',  color: A },
                        ].map(({ label, count, tab, color }) => (
                          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                            <span className="text-[14px] font-medium text-gray-700">{label}</span>
                            <span className="text-[15px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: count > 0 ? color + '18' : '#f3f4f6', color: count > 0 ? color : '#9ca3af' }}>{count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* ── Listings ── */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              {listingsLoading ? <LoadingSection /> : listingsError ? <ErrorSection message={listingsError} onRetry={fetchListings} /> :
                listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{listing.listing?.title ?? listing.title ?? '—'}</h3>
                        <p className="text-[13px] text-gray-400 mt-0.5">Host: {listing.host?.name ?? '—'}</p>
                        {listing.listing?.city && <p className="text-[12px] text-gray-400">{listing.listing.subCity}, {listing.listing.city} · {listing.listing.category}</p>}
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${listing.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : listing.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {listing.status}
                      </span>
                    </div>

                    {/* Photos */}
                    {listing.listing?.photos?.length > 0 && (
                      <div className="flex gap-2 my-3">
                        {listing.listing.photos.slice(0, 4).map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* House deed */}
                    {listing.listing?.houseDeedPhotoUrl && (
                      <p className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
                        <FileText size={12} />
                        <a href={listing.listing.houseDeedPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                          House deed / rental agreement <ExternalLink size={11} />
                        </a>
                      </p>
                    )}

                    {/* Host ID */}
                    {listing.host?.idDocumentUrl && (
                      <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <a href={listing.host.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                          Host ID document <ExternalLink size={11} />
                        </a>
                      </p>
                    )}

                    <p className="text-[11px] text-gray-400">{hoursAgo(listing.createdAt)}</p>

                    {listing.status === 'rejected' && listing.rejectionReason && (
                      <p className="mt-1 text-[12px] text-red-500">Rejection reason: {listing.rejectionReason}</p>
                    )}

                    <div className="flex gap-3 mt-4 pt-2.5 border-t border-gray-100">
                      {listing.status === 'pending' && (
                        <>
                          <button type="button" onClick={() => setRejectModal({ id: listing.id, title: listing.listing?.title })}
                            className="flex-1 py-2.5 rounded-xl border border-primary text-primary font-bold text-[13px] hover:bg-red-50/50 transition-colors">Reject</button>
                          <button type="button" onClick={() => handleApproveListing(listing.id)}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-[13px] hover:bg-[#c82333] transition-colors">Approve</button>
                        </>
                      )}
                      {(listing.status === 'approved' || listing.status === 'rejected') && listing.active && (
                        <button type="button" onClick={() => handleDeleteListing(listing.id)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-[13px] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">Delete listing</button>
                      )}
                    </div>
                  </div>
                ))
              }
              {!listingsLoading && !listingsError && listings.length === 0 && (
                <div className="py-16 text-center text-gray-400 text-[14px]">No listings found.</div>
              )}
            </div>
          )}

          {/* ── Payments ── */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              {paymentsLoading ? <LoadingSection /> : paymentsError ? <ErrorSection message={paymentsError} onRetry={fetchPayments} /> :
                payments.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-[14px]">No pending payments to verify.</div>
                ) : payments.map((p) => {
                  const deadlineMs = p.paymentDeadline ? new Date(p.paymentDeadline).getTime() - Date.now() : null;
                  const pastSLA = deadlineMs !== null && deadlineMs < 0;
                  return (
                    <div key={p.paymentId} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{p.listingTitle}</h3>
                          <p className="text-[12px] text-gray-400 mt-0.5">{p.guestName} → {p.hostName}</p>
                        </div>
                        <span className="text-[15px] font-extrabold text-gray-900">ETB {Number(p.amount).toLocaleString()}</span>
                      </div>
                      {pastSLA && (
                        <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-semibold">
                          <AlertCircle size={14} /> Past deadline — confirm or reject now
                        </div>
                      )}
                      {p.receiptImageUrl && (
                        <a href={p.receiptImageUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-[12px] font-semibold flex items-center gap-1 hover:underline">
                          <FileText size={13} /> View payment receipt <ExternalLink size={11} />
                        </a>
                      )}
                      <p className="text-[11px] text-gray-400">Submitted: {hoursAgo(p.submittedAt)}</p>
                      <div className="space-y-2 mt-2">
                        <input type="text" placeholder="Transaction / reference code"
                          value={paymentRefCodes[p.paymentId] || ''}
                          onChange={(e) => setPaymentRefCodes((prev) => ({ ...prev, [p.paymentId]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400" />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleRejectPayment(p.paymentId)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">Reject</button>
                          <button type="button" onClick={() => handleConfirmPayment(p.paymentId)}
                            disabled={!(paymentRefCodes[p.paymentId] || '').trim()}
                            className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white transition-colors disabled:bg-primary/40 disabled:cursor-not-allowed bg-primary hover:bg-[#c82333]">
                            Confirm payment
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}

          {/* ── Payouts ── */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              {payoutsLoading ? <LoadingSection /> : payoutsError ? <ErrorSection message={payoutsError} onRetry={fetchPayouts} /> :
                payouts.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-[14px]">No pending payouts due.</div>
                ) : payouts.map((p) => {
                  const confirmedAt = p.paymentConfirmedAt ? new Date(p.paymentConfirmedAt) : null;
                  const deadline    = confirmedAt ? new Date(confirmedAt.getTime() + 24 * 3600 * 1000) : null;
                  const msLeft      = deadline ? deadline.getTime() - Date.now() : null;
                  const isWarning   = msLeft !== null && msLeft < 0;
                  const slaText     = msLeft === null ? '' : isWarning ? 'Past 24hr SLA — pay host now' : `${Math.floor(msLeft / 3_600_000)}h ${Math.floor((msLeft % 3_600_000) / 60_000)}m left`;
                  return (
                    <div key={p.payoutId} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Host: {p.hostName}</h3>
                          <p className="text-[12px] text-gray-400 mt-0.5">{p.listingTitle}</p>
                          <p className="text-[11px] text-gray-400">Guest: {p.guestName}</p>
                        </div>
                        <span className="text-[15px] font-extrabold text-gray-900">ETB {Number(p.amount).toLocaleString()}</span>
                      </div>
                      {slaText && (
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${isWarning ? 'text-red-600' : 'text-gray-500'}`}>
                          {isWarning ? <AlertCircle size={14} /> : <Clock size={14} />} {slaText}
                        </div>
                      )}
                      <div className="space-y-2 mt-2">
                        <input type="text" placeholder="Transaction / reference code"
                          value={payoutRefCodes[p.payoutId] || ''}
                          onChange={(e) => setPayoutRefCodes((prev) => ({ ...prev, [p.payoutId]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400" />
                        <button type="button" onClick={() => handleMarkPayoutPaid(p.payoutId)}
                          disabled={!(payoutRefCodes[p.payoutId] || '').trim()}
                          className="w-full py-2.5 rounded-xl font-bold text-[13px] text-white transition-colors disabled:bg-primary/40 disabled:cursor-not-allowed bg-primary hover:bg-[#c82333]">
                          Mark paid
                        </button>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}

          {/* ── Transactions ── */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              {txLoading ? <LoadingSection /> : txError ? <ErrorSection message={txError} onRetry={fetchTransactions} /> :
                transactions.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-[14px]">No transactions yet.</div>
                ) : transactions.map((tx) => (
                  <div key={tx.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'hostPayout' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {tx.type === 'hostPayout' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-bold text-gray-900 leading-tight">
                          {tx.type === 'hostPayout' ? `Payout to ${tx.counterpartyName}` : `Payment from ${tx.counterpartyName}`}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Code: {tx.transactionCode}</p>
                        <p className="text-[10px] text-gray-400">{fmtDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <span className="text-[15px] font-extrabold text-gray-900">ETB {Number(tx.amount).toLocaleString()}</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* ── Reviews ── */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviewsLoading ? <LoadingSection /> : reviewsError ? <ErrorSection message={reviewsError} onRetry={fetchReviews} /> :
                reviews.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-[14px]">No reviews yet.</div>
                ) : reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-[15px] font-bold text-gray-900">{review.guest?.name ?? '—'}</h3>
                        <p className="text-[12px] text-gray-400">{review.listing?.title ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-bold">{review.rating}</span>
                      </div>
                    </div>
                    {review.text && <p className="text-[14px] text-muted-foreground mb-2">"{review.text}"</p>}
                    <p className="text-[11px] text-gray-400 mb-3">{fmtDate(review.createdAt)}</p>
                    <button type="button" onClick={() => handleDeleteReview(review.id)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors">
                      Remove review
                    </button>
                  </div>
                ))
              }
            </div>
          )}

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <Profile userName="Admin" embedded />
          )}
        </main>
      </div>

      {/* Reject listing modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-[17px] font-bold text-gray-900 mb-1">Reject listing</h3>
            <p className="text-[13px] text-gray-500 mb-4">"{rejectModal.title}" — provide a reason for the host.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Missing house deed, incomplete photos, location mismatch…" rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:border-primary resize-none mb-4" />
            <div className="flex gap-3">
              <button type="button" onClick={() => { setRejectModal(null); setRejectReason(''); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleRejectListing} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-[#c82333]">Reject listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
