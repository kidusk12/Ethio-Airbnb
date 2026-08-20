import React, { useState, useMemo } from 'react';
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
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'listings', 'payments', 'payouts', 'transactions', 'profile'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Listings Approval State
  const [listings, setListings] = useState([
    {
      id: 'l1',
      title: 'Modern 2BR Apartment, Bole',
      host: 'Selam Tesfaye',
      filesCount: 3,
      submitted: '3h ago',
      status: 'Pending',
    },
    {
      id: 'l2',
      title: 'Cozy Studio near Plazza',
      host: 'Dawit Bekele',
      filesCount: 1,
      submitted: '1d ago',
      status: 'Pending',
    },
    {
      id: 'l3',
      title: 'Traditional Compound House, CMC',
      host: 'Selam Tesfaye',
      filesCount: 4,
      submitted: '40m ago',
      status: 'Pending',
    },
    {
      id: 'l4',
      title: 'Lakeview Villa, Bishoftu',
      host: 'Meron Alemu',
      filesCount: 1,
      submitted: '3d ago',
      status: 'Approved',
    },
  ]);

  // 2. Payments Verification State
  const [payments, setPayments] = useState([
    {
      id: 'pay1',
      title: 'Modern 2BR Apartment, Bole',
      host: 'Selam Tesfaye',
      guest: 'Nahom Girma',
      amount: 4200.00,
      slaWarning: 'Past 1hr SLA — needs attention',
      refCode: '',
      status: 'Pending',
    },
    {
      id: 'pay2',
      title: 'Cozy Studio near Piazza',
      host: 'Dawit Bekele',
      guest: 'Rediet Solomon',
      amount: 1800.00,
      slaWarning: 'Past 1hr SLA — needs attention',
      refCode: '',
      status: 'Pending',
    },
    {
      id: 'pay3',
      title: 'Lakeview Villa, Bishoftu',
      host: 'Meron Alemu',
      guest: 'Fasika Yohannes',
      amount: 6100.00,
      slaWarning: '',
      refCode: '',
      status: 'Pending',
    },
  ]);

  // 3. Payouts Due State
  const [payouts, setPayouts] = useState([
    {
      id: 'payout1',
      host: 'Meron Alemu',
      amount: 2975.00,
      total: 3500.00,
      commissionPercent: 15,
      commissionAmount: 525.00,
      slaText: '15h 32m left',
      isWarning: false,
      refCode: '',
      status: 'Pending',
    },
    {
      id: 'payout2',
      host: 'Dawit Bekele',
      amount: 1870.00,
      total: 2200.00,
      commissionPercent: 15,
      commissionAmount: 330.00,
      slaText: 'Past 24hr SLA — pay host now',
      isWarning: true,
      refCode: '',
      status: 'Pending',
    },
    {
      id: 'payout3',
      host: 'Selam Tesfaye',
      amount: 4400.00,
      total: 5000.00,
      commissionPercent: 12,
      commissionAmount: 600.00,
      slaText: 'Past 24hr SLA — pay host now',
      isWarning: true,
      refCode: '',
      status: 'Pending',
    },
  ]);

  // 4. Transaction Log State
  const [transactions, setTransactions] = useState([
    {
      id: 'tx1',
      type: 'Payout',
      recipient: 'Meron Alemu',
      code: 'ETB-OUT-20260812-9002',
      amount: 2975.00,
      timestamp: '2026-08-18 18:09:46',
    },
    {
      id: 'tx2',
      type: 'Payment',
      sender: 'Betelhem Aklilu',
      code: 'ETB-PAY-20260810-9001',
      amount: 3500.00,
      timestamp: '2026-08-17 18:09:46',
    },
  ]);

  // Helper actions
  const handleApproveListing = (id) => {
    setListings(prev =>
      prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item)
    );
  };

  const handleRejectListing = (id) => {
    setListings(prev =>
      prev.map(item => item.id === id ? { ...item, status: 'Rejected' } : item)
    );
  };

  const handleConfirmPayment = (id) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;
    
    // Add to transaction log
    const code = payment.refCode.trim() || `ETB-PAY-${Date.now().toString().slice(-6)}`;
    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'Payment',
      sender: payment.guest,
      code: code,
      amount: payment.amount,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setTransactions(prev => [newTx, ...prev]);

    // Remove from pending payments
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const handleMarkPaid = (id) => {
    const payout = payouts.find(p => p.id === id);
    if (!payout) return;

    // Add to transaction log
    const code = payout.refCode.trim() || `ETB-OUT-${Date.now().toString().slice(-6)}`;
    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'Payout',
      recipient: payout.host,
      code: code,
      amount: payout.amount,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setTransactions(prev => [newTx, ...prev]);

    // Remove from pending payouts
    setPayouts(prev => prev.filter(p => p.id !== id));
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
  const bookingsByMonth = [
    { month: 'Jan', bookings: 8 },
    { month: 'Feb', bookings: 12 },
    { month: 'Mar', bookings: 9 },
    { month: 'Apr', bookings: 15 },
    { month: 'May', bookings: 20 },
    { month: 'Jun', bookings: 18 },
  ];
  const totalBookingsCount = bookingsByMonth.reduce((sum, m) => sum + m.bookings, 0);
  const lastMonthBookings = bookingsByMonth[bookingsByMonth.length - 1].bookings;
  const prevMonthBookings = bookingsByMonth[bookingsByMonth.length - 2].bookings;
  const bookingsChangePct = prevMonthBookings
    ? Math.round(((lastMonthBookings - prevMonthBookings) / prevMonthBookings) * 100)
    : null;

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
                  value={totalListingsCount}
                  helper="Listed on the platform"
                  icon={Building2}
                />
                <OverviewCard
                  label="Total Bookings"
                  value={totalBookingsCount}
                  helper="Jan – Jun 2026"
                  icon={CalendarCheck}
                  changeLabel={bookingsChangePct !== null ? `${bookingsChangePct >= 0 ? '+' : ''}${bookingsChangePct}%` : null}
                  changePositive={bookingsChangePct >= 0}
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
                {/* Booking Overview bar chart */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
                  <h3 className="text-[14px] font-bold text-gray-900 mb-1">Booking Overview</h3>
                  <p className="text-[11px] text-gray-400 mb-4">Bookings per month</p>
                  <div style={{ width: '100%', height: 240 }}>
                    <ResponsiveContainer>
                      <BarChart data={bookingsByMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: A_LITE }}
                          contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}
                          formatter={(value) => [`${value} bookings`, '']}
                        />
                        <Bar dataKey="bookings" fill={A} radius={[8, 8, 0, 0]} maxBarSize={44} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

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
              {payments.length === 0 ? (
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
                      <button
                        type="button"
                        onClick={() => handleConfirmPayment(p.id)}
                        disabled={!p.refCode.trim()}
                        className={`w-full py-2.5 rounded-xl font-bold text-[13px] text-white transition-colors ${
                          p.refCode.trim()
                            ? 'bg-primary hover:bg-[#c82333]'
                            : 'bg-primary/40 cursor-not-allowed'
                        }`}
                      >
                        Confirm payment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-4">
              {payouts.length === 0 ? (
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
                        <p className="text-[11px] text-gray-400 mt-1">
                          Booking total ETB {p.total.toFixed(2)} · Commission {p.commissionPercent}% (ETB {p.commissionAmount.toFixed(2)})
                        </p>
                      </div>
                      <span className="text-[15px] font-extrabold text-gray-900">
                        ETB {p.amount.toFixed(2)}
                      </span>
                    </div>

                    {/* SLA Indicator */}
                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                      p.isWarning ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {p.isWarning ? <AlertCircle size={14} /> : <Clock size={14} />}
                      {p.slaText}
                    </div>

                    {/* Verification Input & Action */}
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