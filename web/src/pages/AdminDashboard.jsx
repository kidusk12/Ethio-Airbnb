import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Users,
  Home as HomeIcon,
  ShieldCheck,
  Search,
  Trash2,
  PanelLeft,
  Settings,
  LogOut,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [pendingHosts, setPendingHosts] = useState([
    {
      id: 'h1',
      name: 'Selamawit Tesfaye',
      email: 'selam.tesfaye@example.com',
      property: 'Bole Skyline Suite',
      location: 'Bole, Addis Ababa',
      submitted: 'Aug 14, 2026',
    },
    {
      id: 'h2',
      name: 'Dawit Mekonnen',
      email: 'dawit.m@example.com',
      property: 'Hawassa Lake Villa',
      location: 'Lake Hawassa, Hawassa',
      submitted: 'Aug 13, 2026',
    },
    {
      id: 'h3',
      name: 'Bethlehem Alemu',
      email: 'beth.alemu@example.com',
      property: 'Lalibela Stone Guesthouse',
      location: 'Old Town, Lalibela',
      submitted: 'Aug 12, 2026',
    },
  ]);

  const [approvedHosts, setApprovedHosts] = useState([
    {
      id: 'h4',
      name: 'Yonas Girma',
      email: 'yonas.girma@example.com',
      property: 'Bahir Dar Garden House',
      location: 'Tana Lakeside, Bahir Dar',
      approved: 'Jul 28, 2026',
    },
    {
      id: 'h5',
      name: 'Hana Solomon',
      email: 'hana.solomon@example.com',
      property: 'Kazanchis Design Loft',
      location: 'Kazanchis, Addis Ababa',
      approved: 'Jul 20, 2026',
    },
    {
      id: 'h6',
      name: 'Abel Fikru',
      email: 'abel.fikru@example.com',
      property: 'Dire Dawa Courtyard Stay',
      location: 'Kezira, Dire Dawa',
      approved: 'Jul 10, 2026',
    },
  ]);

  const stats = [
    {
      label: 'Total hosts',
      value: approvedHosts.length,
      icon: HomeIcon,
    },
    {
      label: 'Total guests',
      value: 1284,
      icon: Users,
    },
    {
      label: 'Pending approval',
      value: pendingHosts.length,
      icon: ShieldCheck,
    },
  ];

  const approveHost = (id) => {
    const host = pendingHosts.find((h) => h.id === id);
    if (!host) return;

    setPendingHosts((prev) => prev.filter((h) => h.id !== id));
    setApprovedHosts((prev) => [
      {
        id: host.id,
        name: host.name,
        email: host.email,
        property: host.property,
        location: host.location,
        approved: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
      ...prev,
    ]);
  };

  const rejectHost = (id) => {
    setPendingHosts((prev) => prev.filter((h) => h.id !== id));
  };

  const removeHost = (id) => {
    setApprovedHosts((prev) => prev.filter((h) => h.id !== id));
  };

  const filteredPending = pendingHosts.filter((host) =>
    `${host.name} ${host.property} ${host.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredApproved = approvedHosts.filter((host) =>
    `${host.name} ${host.property} ${host.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const adminSidebarLinks = [
    { label: 'Pending Approvals', icon: ShieldCheck, tab: 'pending', count: pendingHosts.length },
    { label: 'Active Hosts', icon: Building2, tab: 'approved', count: approvedHosts.length },
    { label: 'Admin Profile Settings', icon: Settings, action: () => navigate('/admin/profile') },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavBar1 userName="Admin" />

      {/* Top Controls with Sidebar Icon Toggle */}
      <div className="pt-20 pb-2 px-6 max-w-[1200px] mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          title="Open Admin menu"
          className="w-10 h-10 rounded-2xl bg-white border border-border hover:border-primary text-foreground flex items-center justify-center shadow-sm hover:shadow transition-all group"
        >
          <PanelLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Sliding Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-border mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary text-white font-bold text-[15px] flex items-center justify-center shadow-sm">
                    A
                  </div>
                  <div>
                    <h3 className="font-bold text-[14px] text-foreground leading-tight">
                      Admin Portal
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full mt-0.5">
                      <CheckCircle2 size={10} /> Verified Admin
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

              <nav className="space-y-1">
                {adminSidebarLinks.map((item) => {
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
        </div>
      )}

      <section className="pt-6 pb-20 px-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-[36px] font-bold font-serif text-foreground mb-8">
          Admin Dashboard
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-border p-6 flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <stat.icon size={22} className="text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[26px] font-bold text-foreground leading-tight">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-[14px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending approval ({pendingHosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
              activeTab === 'approved'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Active hosts ({approvedHosts.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hosts by name, property, or location"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 bg-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Pending hosts list */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {filteredPending.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-[15px]">
                No pending host applications.
              </div>
            ) : (
              filteredPending.map((host, index) => (
                <div
                  key={host.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 ${
                    index !== filteredPending.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div>
                    <p className="text-[16px] font-semibold text-foreground">{host.name}</p>
                    <p className="text-[14px] text-muted-foreground">{host.email}</p>
                    <p className="text-[14px] text-foreground mt-1.5">
                      {host.property} · {host.location}
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Submitted {host.submitted}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => rejectHost(host.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-foreground text-[14px] font-medium hover:bg-gray-50 transition-colors"
                    >
                      <X size={16} />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => approveHost(host.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-primary-foreground text-[14px] font-semibold transition-opacity"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approved hosts list */}
        {activeTab === 'approved' && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {filteredApproved.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-[15px]">
                No active hosts found.
              </div>
            ) : (
              filteredApproved.map((host, index) => (
                <div
                  key={host.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 ${
                    index !== filteredApproved.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div>
                    <p className="text-[16px] font-semibold text-foreground">{host.name}</p>
                    <p className="text-[14px] text-muted-foreground">{host.email}</p>
                    <p className="text-[14px] text-foreground mt-1.5">
                      {host.property} · {host.location}
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Approved {host.approved}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeHost(host.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-[14px] font-medium hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;