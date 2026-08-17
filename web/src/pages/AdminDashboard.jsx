import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Users, Home as HomeIcon, ShieldCheck, Search, Trash2 } from 'lucide-react';
import Navbar1 from '../components/NavBar1';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar1
        adminName="Admin"
        adminAvatar={null}
        onProfileClick={() => navigate('/admin/profile')}
        onLogout={() => navigate('/')}
      />

      <section className="pt-24 pb-20 px-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <p className="text-[11px] font-semibold text-primary tracking-[0.15em] mb-2 uppercase">
          Admin
        </p>
        <h1 className="text-3xl md:text-[36px] font-bold font-serif text-foreground mb-8">
          Dashboard
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-border p-6 flex items-center gap-4"
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
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
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
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 bg-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Pending hosts list */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
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
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
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

      <Footer />
    </div>
  );
};

export default AdminDashboard;