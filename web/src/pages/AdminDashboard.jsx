import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Menu,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  AlertCircle,
  Clock,
  Wallet,
  Users,
  Building2,
  CalendarCheck,
  Hourglass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import NavBar1 from '../components/NavBar1';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';
import { getPendingListings, approveListing, rejectListing, getPendingPayments, confirmPayment, rejectPayment, resolveFileUrl, getAllListingsAdmin, getDuePayouts, markPayoutPaid, getAllTransactions } from '../lib/api';


// Color theme
const A = "#E8473F";
const A_DARK = "#C73B34";
const A_LITE = "#fdf2f2";

// Property-status donut colors
const STATUS_COLORS = {
  Approved: '#10b981',
  Pending: '#f59e0b',
  Rejected: A,
};

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function OverviewCard({ label, value, helper, icon: Icon, tone = 'primary', changeLabel, changePositive }) {
  const iconWrapClass =
    tone === 'warning'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-primary/10 text-primary';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-semibold text-gray-500">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconWrapClass}`}>
          <Icon size={17} strokeWidth={2} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[26px] font-extrabold leading-none text-gray-900">{value}</p>
        {changeLabel && (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
              changePositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {changeLabel}
          </span>
        )}
      </div>
      {helper && (
        <p className={`mt-1.5 text-[11px] font-medium ${tone === 'warning' ? 'text-amber-600' : 'text-gray-400'}`}>
          {helper}
        </p>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'listings', 'payments', 'payouts', 'transactions', 'profile'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Listings Approval State
    const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchPendingListings() {
      setListingsLoading(true);
      setListingsError('');
      try {
        const { status, body } = await getPendingListings(token);
        if (!isMounted) return;

        if (status !== 200) {
          setListingsError(body?.message || 'Failed to load pending listings.');
          return;
        }

        const mapped = body.data.listings.map((item) => ({
          id: item.id,
          title: item.listing.title,
          host: item.host.name,
          filesCount: item.listing.photos.length + (item.listing.houseDeedPhotoUrl ? 1 : 0),
          submitted: timeAgo(item.createdAt),
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        }));

        setListings(mapped);
      } catch (err) {
        if (isMounted) setListingsError('Could not reach the server.');
      } finally {
        if (isMounted) setListingsLoading(false);
      }
    }

    fetchPendingListings();
    return () => { isMounted = false; };
  }, [token]);
  const [allListingsCount, setAllListingsCount] = useState(0);

useEffect(() => {
  getAllListingsAdmin(token).then(({ status, body }) => {
    if (status === 200) {
      setAllListingsCount(body.data.listings.length);
    }
  });
}, [token]);

  // 2. Payments Verification State
  const [payments, setPayments] = useState([]);
const [paymentsLoading, setPaymentsLoading] = useState(true);
const [paymentsError, setPaymentsError] = useState('');

useEffect(() => {
  let isMounted = true;

  async function fetchPendingPayments() {
    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const { status, body } = await getPendingPayments(token);
      if (!isMounted) return;

      if (status !== 200) {
        setPaymentsError(body?.message || 'Failed to load pending payments.');
        return;
      }

      const now = Date.now();
      const mapped = body.data.payments.map((p) => {
        const deadlinePassed = new Date(p.paymentDeadline).getTime() < now;
        return {
          id: p.paymentId,
          bookingId: p.bookingId,
          title: p.listingTitle,
          host: p.hostName,
          guest: p.guestName,
          amount: p.amount,
          receiptImageUrl: p.receiptImageUrl,
          slaWarning: deadlinePassed ? 'Past payment deadline — needs attention' : '',
          refCode: '',
          status: 'Pending',
        };
      });

      setPayments(mapped);
    } catch (err) {
      if (isMounted) setPaymentsError('Could not reach the server.');
    } finally {
      if (isMounted) setPaymentsLoading(false);
    }
  }

  fetchPendingPayments();
  return () => { isMounted = false; };
}, [token]);
 
  // 3. Payouts Due State
    const [payouts, setPayouts] = useState([]);
const [payoutsLoading, setPayoutsLoading] = useState(true);
const [payoutsError, setPayoutsError] = useState('');

useEffect(() => {
  let isMounted = true;

  async function fetchDuePayouts() {
    setPayoutsLoading(true);
    setPayoutsError('');
    try {
      const { status, body } = await getDuePayouts(token);
      if (!isMounted) return;

      if (status !== 200) {
        setPayoutsError(body?.message || 'Failed to load due payouts.');
        return;
      }

      const now = Date.now();
      const mapped = body.data.payouts.map((p) => {
        const confirmedAt = new Date(p.paymentConfirmedAt).getTime();
        const deadline = confirmedAt + 24 * 60 * 60 * 1000; // 24h window per contract
        const msLeft = deadline - now;
        const isWarning = msLeft <= 0;
        const hoursLeft = Math.floor(Math.abs(msLeft) / (60 * 60 * 1000));
        const minsLeft = Math.floor((Math.abs(msLeft) % (60 * 60 * 1000)) / (60 * 1000));

        return {
          id: p.payoutId,
          bookingId: p.bookingId,
          host: p.hostName,
          amount: p.amount,
          slaText: isWarning
            ? 'Past 24hr SLA — pay host now'
            : `${hoursLeft}h ${minsLeft}m left`,
          isWarning,
          refCode: '',
          status: 'Pending',
        };
      });

      setPayouts(mapped);
    } catch (err) {
      if (isMounted) setPayoutsError('Could not reach the server.');
    } finally {
      if (isMounted) setPayoutsLoading(false);
    }
  }

  fetchDuePayouts();
  return () => { isMounted = false; };
}, [token]);

  // 4. Transaction Log State
  const [transactions, setTransactions] = useState([]);
const [transactionsLoading, setTransactionsLoading] = useState(true);
const [transactionsError, setTransactionsError] = useState('');

useEffect(() => {
  let isMounted = true;

  getAllTransactions(token).then(({ status, body }) => {
    if (!isMounted) return;
    if (status !== 200) {
      setTransactionsError(body?.message || 'Failed to load transactions.');
      setTransactionsLoading(false);
      return;
    }

    const mapped = body.data.transactions.map((t) => ({
      id: t.id,
      type: t.type === 'hostPayout' ? 'Payout' : 'Payment',
      recipient: t.type === 'hostPayout' ? t.counterpartyName : undefined,
      sender: t.type === 'userPayment' ? t.counterpartyName : undefined,
      code: t.transactionCode,
      amount: t.amount,
      timestamp: new Date(t.timestamp).toISOString().replace('T', ' ').slice(0, 19),
    }));

    setTransactions(mapped);
    setTransactionsLoading(false);
  }).catch(() => {
    if (isMounted) {
      setTransactionsError('Could not reach the server.');
      setTransactionsLoading(false);
    }
  });

  return () => { isMounted = false; };
}, [token]);
  // Helper actions
    const handleApproveListing = async (id) => {
    const { status, body } = await approveListing(id, token);
    if (status !== 200) {
      setListingsError(body?.message || 'Failed to approve listing.');
      return;
    }
    setListings(prev => prev.filter(item => item.id !== id));
  };
  const handleRejectListing = async (id) => {
  const { status, body } = await rejectListing(id, token);
  if (status !== 200) {
    setListingsError(body?.message || 'Failed to reject listing.');
    return;
  }
  setListings(prev => prev.filter(item => item.id !== id));
};
  const handleRejectPayment = async (id) => {
  const { status, body } = await rejectPayment(id, token);
  if (status !== 200) {
    setPaymentsError(body?.message || 'Failed to reject payment.');
    return;
  }
  setPayments(prev => prev.filter(p => p.id !== id));
};

 const handleConfirmPayment = async (id) => {
  const payment = payments.find(p => p.id === id);
  if (!payment || !payment.refCode.trim()) return;

  const { status, body } = await confirmPayment(id, payment.refCode.trim(), token);
  if (status !== 200) {
    setPaymentsError(body?.message || 'Failed to confirm payment.');
    return;
  }

  setPayments(prev => prev.filter(p => p.id !== id));
  // Real transaction log now comes from the backend — no local push needed here.
};

  

  const handleMarkPaid = async (id) => {
    
  const payout = payouts.find(p => p.id === id);
  if (!payout || !payout.refCode.trim()) return;

  const { status, body } = await markPayoutPaid(id, payout.refCode.trim(), token);
  if (status !== 200) {
    setPayoutsError(body?.message || 'Failed to mark payout as paid.');
    return;
  }

  setPayouts(prev => prev.filter(p => p.id !== id));
  // Real transaction log now comes from the backend — no local push needed here.
  };

  // Badge counts
  const pendingListingsCount = listings.filter(l => l.status === 'Pending').length;
  const pendingPaymentsCount = payments.length;
  const pendingPayoutsCount = payouts.length;

  // --- Overview metrics ---

  // Total Users — derived from every distinct host/guest name that appears
  // across the mock listings, payments, payouts and transaction log, since
  // there's no separate users table yet.
  const totalUsersCount = useMemo(() => {
    const names = new Set();
    listings.forEach(l => l.host && names.add(l.host));
    payments.forEach(p => { p.host && names.add(p.host); p.guest && names.add(p.guest); });
    payouts.forEach(p => p.host && names.add(p.host));
    transactions.forEach(t => { t.recipient && names.add(t.recipient); t.sender && names.add(t.sender); });
    return names.size;
  }, [listings, payments, payouts, transactions]);

  // Total Revenue — sum of everything logged in the transaction log
  const paymentsVolume = useMemo(
    () => transactions.filter(t => t.type === 'Payment').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const payoutsVolume = useMemo(
    () => transactions.filter(t => t.type === 'Payout').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const totalTransactionVolume = paymentsVolume + payoutsVolume;

  // Total Bookings — monthly mock series backs both the "Booking Overview"
  // bar chart and the Total Bookings stat card, so the two stay consistent.


  // Property Status — live counts from the listings state, so it updates
  // as listings get approved/rejected from the Listings tab.
  const approvedListingsCount = listings.filter(l => l.status === 'Approved').length;
  const rejectedListingsCount = listings.filter(l => l.status === 'Rejected').length;
  const totalListingsCount = listings.length;

  const propertyStatusData = [
    { name: 'Approved', value: approvedListingsCount },
    { name: 'Pending', value: pendingListingsCount },
    { name: 'Rejected', value: rejectedListingsCount },
  ];

  const sidebarLinks = [
    { label: 'Overview', key: 'overview' },
    { label: 'Listings approval', key: 'listings', badge: pendingListingsCount },
    { label: 'Payments verification', key: 'payments', badge: pendingPaymentsCount },
    { label: 'Payouts due', key: 'payouts', badge: pendingPayoutsCount },
    { label: 'Transaction log', key: 'transactions' },
    { label: 'Profile Settings', key: 'profile' },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Overview';
      case 'listings':
        return 'Listings approval';
      case 'payments':
        return 'Payments verification';
      case 'payouts':
        return 'Payouts due';
      case 'transactions':
        return 'Transaction log';
      case 'profile':
        return 'Admin Profile';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-foreground font-sans flex flex-col pb-10">
      <NavBar1
        userName="Admin"
        onLogout={() => { logout(); navigate('/'); }}
        dashboardLabel="My Dashboard"
        dashboardLink="/admin"
        showProfileLink={false}
      />

      {/* Sliding Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-[100] flex flex-col justify-between p-5 transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between pb-5 border-b border-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-[16px] flex items-center justify-center shadow-inner">
                A
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-foreground leading-tight">
                  Admin
                </h3>
                <span className="text-[11px] text-gray-500 font-medium">
                  Administrator
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

          {/* Sidebar Navigation Items */}
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.key);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'text-foreground hover:bg-gray-100/80'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout bottom section */}
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

      {/* Backdrop - blurred dim only needed on small screens where content can't shift; click to close */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Transparent click-catcher on md+ screens, since content just shifts over instead of dimming */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[90] hidden md:block"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Content wrapper - shifts right when sidebar is open on md+ screens, matching Host_dashboard */}
      <div className={`flex-1 transition-all duration-200 ${isSidebarOpen ? 'md:ml-72' : ''}`}>
        {/* Top beige-toned Header matching screens */}
        <header className={`fixed top-16 left-0 right-0 h-14 bg-[#FAF6F0] border-b border-gray-200/60 z-30 px-4 flex items-center gap-3 transition-all duration-200 ${isSidebarOpen ? 'md:left-72' : ''}`}>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 rounded-lg hover:bg-gray-200/50 transition-colors text-gray-800"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-[17px] font-bold text-gray-800 tracking-tight">
            {getPageTitle()}
          </h1>
        </header>

        {/* Main scrollable body */}
        <main className={`w-full mx-auto px-4 pt-32 flex-1 pb-12 ${activeTab === 'overview' ? 'max-w-[1120px]' : 'max-w-[800px]'}`}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top statistic cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <OverviewCard
                  label="Total Users"
                  value={totalUsersCount}
                  helper="Unique hosts & guests"
                  icon={Users}
                />
                
                <OverviewCard
  label="Total Properties"
  value={allListingsCount}
  helper="Listed on the platform"
  icon={Building2}
/>
                
                <OverviewCard
                  label="Total Revenue"
                  value={`ETB ${totalTransactionVolume.toLocaleString()}`}
                  helper="From all bookings"
                  icon={Wallet}
                />
                <OverviewCard
                  label="Pending Approvals"
                  value={pendingListingsCount}
                  helper="Needs review"
                  icon={Hourglass}
                  tone="warning"
                />
              </div>

              {/* Charts — side by side on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            

                {/* Property Status donut chart */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                  <h3 className="text-[14px] font-bold text-gray-900 mb-1">Property Status</h3>
                  <p className="text-[11px] text-gray-400 mb-4">Approval status across all listings</p>

                  {totalListingsCount === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-[13px]">
                      No properties listed yet.
                    </div>
                  ) : (
                    <>
                      <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={propertyStatusData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                            >
                              {propertyStatusData.map((entry) => (
                                <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [`${value} properties`, name]}
                              contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Custom legend: status, count, percentage */}
                      <div className="mt-2 space-y-2">
                        {propertyStatusData.map((entry) => {
                          const pct = totalListingsCount
                            ? Math.round((entry.value / totalListingsCount) * 100)
                            : 0;
                          return (
                            <div key={entry.name} className="flex items-center justify-between text-[13px]">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                                />
                                <span className="text-gray-700 font-medium">{entry.name}</span>
                              </div>
                              <span className="text-gray-500">
                                {entry.value} <span className="text-gray-400">({pct}%)</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-4">
              {listingsLoading && <div className="py-16 text-center text-gray-400 text-[14px]">Loading pending listings…</div>}
{listingsError && <div className="py-4 text-center text-red-600 text-[13px]">{listingsError}</div>}
{!listingsLoading && listings.length === 0 && !listingsError && (
  <div className="py-16 text-center text-gray-400 text-[14px]">No pending listings.</div>
)}
              {listings.map((list) => (
                <div key={list.id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                        {list.title}
                      </h3>
                      <p className="text-[13px] text-gray-400 mt-0.5">
                        Host: {list.host}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      list.status === 'Pending'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : list.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {list.status}
                    </span>
                  </div>

                  {/* Beige square file placeholders */}
                  <div className="flex gap-2.5 my-3.5">
                    {Array.from({ length: list.filesCount }).map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-xl bg-[#F5ECE2] flex items-center justify-center text-amber-900/60"
                      >
                        <FileText size={18} />
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400 font-medium">
                    {list.filesCount} file{list.filesCount > 1 ? 's' : ''} submitted · {list.submitted}
                  </p>

                  {/* Reject / Approve action buttons for Pending */}
                  {list.status === 'Pending' && (
                    <div className="flex gap-3 mt-4 pt-2.5 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleRejectListing(list.id)}
                        className="flex-1 py-2.5 rounded-xl border border-primary text-primary font-bold text-[13px] hover:bg-red-50/50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveListing(list.id)}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-[13px] hover:bg-primary-dark transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
  <div className="space-y-4">
    {paymentsLoading && <div className="py-16 text-center text-gray-400 text-[14px]">Loading pending payments…</div>}
    {paymentsError && <div className="py-4 text-center text-red-600 text-[13px]">{paymentsError}</div>}
    {!paymentsLoading && payments.length === 0 && !paymentsError ?  (
                <div className="py-16 text-center text-gray-400 text-[14px]">
                  No pending payments to verify.
                </div>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                          {p.title}
                        </h3>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          {p.guest} &gt; {p.host}
                        </p>
                      </div>
                      <span className="text-[15px] font-extrabold text-gray-900">
                        ETB {p.amount.toFixed(2)}
                      </span>
                    </div>


                    {/* SLA Warning */}
                    {p.slaWarning && (
                      <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-semibold">
                        <AlertCircle size={14} />
                        {p.slaWarning}
                      </div>
                    )}
                      {p.receiptImageUrl && (
  <a
    href={resolveFileUrl(p.receiptImageUrl)}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[12px] font-semibold text-primary hover:underline"
  >
    View payment screenshot
  </a>
)}
                    {/* Verification Input & Action */}
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        placeholder="Transaction / reference code"
                        value={p.refCode}
                        onChange={(e) => setPayments(prev =>
                          prev.map(item => item.id === p.id ? { ...item, refCode: e.target.value } : item)
                        )}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400"
                      />
                      <div className="flex gap-3 mt-2">
  <button
    type="button"
    onClick={() => handleRejectPayment(p.id)}
    className="flex-1 py-2.5 rounded-xl border border-primary text-primary font-bold text-[13px] hover:bg-red-50/50 transition-colors"
  >
    Reject
  </button>
  <button
    type="button"
    onClick={() => handleConfirmPayment(p.id)}
    disabled={!p.refCode.trim()}
    className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white transition-colors ${
      p.refCode.trim()
        ? 'bg-primary hover:bg-[#c82333]'
        : 'bg-primary/40 cursor-not-allowed'
    }`}
  >
                    
                        Confirm payment
                      </button>
                    </div>
                  </div>
                </div>
                ))  
              )}
              </div>
          )}
          {activeTab === 'payouts' && (
  <div className="space-y-4">
    {payoutsLoading && <div className="py-16 text-center text-gray-400 text-[14px]">Loading due payouts…</div>}
    {payoutsError && <div className="py-4 text-center text-red-600 text-[13px]">{payoutsError}</div>}
    {!payoutsLoading && payouts.length === 0 && !payoutsError ? (
      <div className="py-16 text-center text-gray-400 text-[14px]">
        No pending payouts due.
      </div>
    ) : (
      payouts.map((p) => (
  <div key={p.id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
          Host: {p.host}
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">Payout amount</p>
      </div>
      <span className="text-[15px] font-extrabold text-gray-900">
        ETB {p.amount.toFixed(2)}
      </span>
    </div>

    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${
      p.isWarning ? 'text-red-600' : 'text-gray-500'
    }`}>
      {p.isWarning ? <AlertCircle size={14} /> : <Clock size={14} />}
      {p.slaText}
    </div>

    <div className="space-y-2 mt-2">
      <input
        type="text"
        placeholder="Transaction / reference code"
        value={p.refCode}
        onChange={(e) => setPayouts(prev =>
          prev.map(item => item.id === p.id ? { ...item, refCode: e.target.value } : item)
        )}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400"
      />
      <button
        type="button"
        onClick={() => handleMarkPaid(p.id)}
        disabled={!p.refCode.trim()}
        className={`w-full py-2.5 rounded-xl font-bold text-[13px] text-white transition-colors ${
          p.refCode.trim()
            ? 'bg-primary hover:bg-[#c82333]'
            : 'bg-primary/40 cursor-not-allowed'
        }`}
      >
        Mark paid
      </button>
    </div>
  </div>
))
    )}
  </div>
          )}
    
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      tx.type === 'Payout'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {tx.type === 'Payout' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-bold text-gray-900 leading-tight">
                        {tx.type === 'Payout' ? `Payout to ${tx.recipient}` : `Payment from ${tx.sender}`}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Code: {tx.code}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {tx.timestamp}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[15px] font-extrabold ${
                    tx.type === 'Payout' ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    ETB {tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'profile' && (
            <Profile userName="Admin" userEmail="admin@ethioairbnb.com" embedded />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;