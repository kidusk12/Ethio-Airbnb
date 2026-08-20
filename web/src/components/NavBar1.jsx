import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
    <div className="w-[34px] h-[34px] rounded-full bg-primary flex items-center justify-center shadow-sm">
      <HomeIcon size={17} className="text-white" strokeWidth={2.5} />
    </div>
    <span className="font-serif text-[22px] font-bold tracking-tight">
      <span className="text-foreground">Ethio</span>
      <span className="text-primary">Stays</span>
    </span>
  </Link>
);

/**
 * NavBar1 — shared site header.
 *
 * Two modes:
 *  1. Link mode (default) — dropdown shows "Dashboard" / "Profile settings" / "Log out"
 *     as real navigation links. Used on ordinary pages (Home, Profile, Host dashboard, etc).
 *  2. Tab mode — pass `tabs` + `activeTab` + `onSelectTab` and the dropdown instead shows
 *     a list of in-page tabs (used by the guest Dashboard, which switches sections without
 *     changing route).
 */
const NavBar1 = ({
  userName,
  userAvatar = null,
  onProfileClick,
  onLogout,
  dashboardLink = '/host/Host_dashboard',
  dashboardLabel = 'My Dashboard',
  showDashboardLink = true,
  profileLink = '/profile',
  showProfileLink = true,
  tabs = null,
  activeTab = null,
  onSelectTab = null,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Compute display first name dynamically
  const resolvedFirstName = (() => {
    if (userName && userName !== 'Host' && userName !== 'Account') {
      return userName.trim().split(' ')[0];
    }
    if (user?.firstName) return user.firstName.trim().split(' ')[0];
    if (user?.name) return user.name.trim().split(' ')[0];

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
    if (!showDropdown) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowDropdown(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showDropdown]);

  const handleLogout = () => {
    setShowDropdown(false);
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    if (onProfileClick) onProfileClick();
    else navigate(profileLink);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-[oklch(0.52_0.022_118_/_0.12)] z-50 transition-all">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Logo />

          {/* Hamburger + avatar trigger */}
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
              {userAvatar ? (
                <img src={userAvatar} alt={resolvedFirstName} className="w-full h-full object-cover" />
              ) : (
                <span>{initialLetter}</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Dropdown panel */}
      {showDropdown && (
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
                {user?.name || resolvedFirstName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email || 'EthioStays account'}
              </p>
            </div>

            {tabs ? (
              /* Tab mode — in-page section switcher */
              <div className="py-1 border-b border-border">
                {tabs.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSelectTab?.(id);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors hover:bg-gray-50 ${
                      activeTab === id ? 'text-primary font-semibold' : 'text-foreground font-normal'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              /* Link mode — real navigation */
              <div className="py-1 border-b border-border">
                {showDashboardLink && (
                  <Link
                    to={dashboardLink}
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-foreground hover:bg-gray-50 transition-colors text-left"
                  >
                    <LayoutDashboard size={16} className="text-muted-foreground" />
                    {dashboardLabel}
                  </Link>
                )}

                {showProfileLink && (
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-foreground hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings size={16} className="text-muted-foreground" />
                    Profile settings
                  </button>
                )}
              </div>
            )}

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

export default NavBar1;