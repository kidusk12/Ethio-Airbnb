import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LayoutDashboard, LayoutGrid, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="w-[34px] h-[34px] rounded-full bg-primary flex items-center justify-center shadow-sm">
      <HomeIcon size={17} className="text-white" strokeWidth={2.5} />
    </div>
    <span className="font-serif text-[22px] font-bold tracking-tight">
      <span className="text-foreground">Ethio</span>
      <span className="text-primary">Stays</span>
    </span>
  </Link>
);

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
    isActive
      ? 'bg-[oklch(0.88_0.03_96)] text-foreground font-bold'
      : 'text-[oklch(0.52_0.022_118)] hover:bg-[oklch(0.9_0.025_96)] hover:text-foreground'
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const hostFirstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : null);
  const initialLetter = hostFirstName ? hostFirstName.charAt(0).toUpperCase() : 'H';

  useEffect(() => {
    if (!showDropdown) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowDropdown(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showDropdown]);

  const handleDashboardClick = () => {
    setShowDropdown(false);
    if (user?.role === 'guest') {
      navigate('/guest_dashboard');
    } else {
      navigate('/host/Host_dashboard');
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/85 backdrop-blur-md border-b border-[oklch(0.52_0.022_118_/_0.12)] z-50">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/explore" className={navLinkClass}>
              Explore
            </NavLink>

            <NavLink to="/host" className={navLinkClass}>
              Become a Host
            </NavLink>

            <NavLink to="/about" className={navLinkClass}>
              About Us
            </NavLink>
            
            <NavLink to="/help" className={navLinkClass}>
              Help
            </NavLink>
          </nav>

          {/* Authentication */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                aria-label="Open menu"
                className="flex items-center gap-2.5 border border-[oklch(0.52_0.022_118_/_0.18)] rounded-full pl-3 pr-0.5 py-0.5 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-[4.5px]">
                  <span className="block w-[15px] h-[1.5px] rounded-full" style={{ background: '#222' }} />
                  <span className="block w-[15px] h-[1.5px] rounded-full" style={{ background: '#222' }} />
                  <span className="block w-[15px] h-[1.5px] rounded-full" style={{ background: '#222' }} />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-bold text-[13px] shadow-inner">
                  <span>{initialLetter}</span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="bg-primary hover:bg-[#c82333] text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm">
                    Login
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown panel */}
      {user && showDropdown && (
        <>
          {/* Transparent backdrop — click outside to close */}
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

          <div
            className="fixed z-50 bg-white rounded-2xl overflow-hidden border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{ top: 72, right: 20, width: 240 }}
            role="menu"
          >
            {/* User identity */}
            <div className="px-4 py-3.5 border-b border-border">
              <p className="text-[13px] font-semibold text-foreground truncate">
                {user?.name || hostFirstName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email || 'EthioStays account'}
              </p>
            </div>

            <div className="py-1 border-b border-border">
              <button
                type="button"
                onClick={handleDashboardClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-foreground hover:bg-gray-50 transition-colors text-left"
              >
                <LayoutGrid size={16} className="text-muted-foreground" />
                My Dashboard
              </button>
            </div>

            {/* Log out */}
            <div className="py-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;