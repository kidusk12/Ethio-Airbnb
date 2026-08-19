import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LayoutDashboard, Settings, LogOut, ChevronDown, PlusCircle } from 'lucide-react';
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

const NavBar1 = ({ userName, userAvatar = null, onProfileClick, onLogout, showAddListing = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Compute host first name dynamically
  const resolvedFirstName = (() => {
    if (userName && userName !== 'Host' && userName !== 'Account') {
      return userName.trim().split(' ')[0];
    }
    if (user?.firstName) return user.firstName.trim().split(' ')[0];
    if (user?.name) return user.name.trim().split(' ')[0];
    
    // Check localStorage fallbacks
    try {
      const stored = localStorage.getItem('ethio_user') || localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.firstName) return parsed.firstName.trim().split(' ')[0];
        if (parsed?.name) return parsed.name.trim().split(' ')[0];
      }
    } catch {
      // ignore
    }
    return 'Host';
  })();

  const initialLetter = resolvedFirstName.charAt(0).toUpperCase() || 'H';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-[oklch(0.52_0.022_118_/_0.12)] z-50 transition-all">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Right Profile */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-[oklch(0.52_0.022_118_/_0.18)] bg-white hover:border-primary/50 shadow-sm transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-bold text-[13px] shadow-inner">
                  {userAvatar ? (
                    <img src={userAvatar} alt={resolvedFirstName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initialLetter}</span>
                  )}
                </div>
                <span className="text-[14px] font-semibold text-foreground">
                  {resolvedFirstName}
                </span>
                <ChevronDown size={15} className="text-muted-foreground" />
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-[13px] font-semibold text-foreground">{user?.name || resolvedFirstName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'Host account'}</p>
                  </div>

                  <Link
                    to="/host/Host_dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-foreground hover:bg-gray-50 transition-colors text-left"
                  >
                    <LayoutDashboard size={16} className="text-muted-foreground" />
                    Host Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      if (onProfileClick) onProfileClick();
                      else navigate('/admin/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-foreground hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings size={16} className="text-muted-foreground" />
                    Profile settings
                  </button>

                  <div className="h-px bg-border my-1.5" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar1;