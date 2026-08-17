import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, User, Settings, LogOut, ChevronDown } from 'lucide-react';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="w-[34px] h-[34px] rounded-full bg-primary flex items-center justify-center">
      <HomeIcon
        size={17}
        className="text-white"
        strokeWidth={2.5}
      />
    </div>

    <span className="font-serif text-[22px] font-bold tracking-tight">
      <span className="text-foreground">Ethio</span>
      <span className="text-primary">Stays</span>
    </span>
  </Link>
);

const NavBar1 = ({ userName = 'Account', userAvatar = null, onProfileClick, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[oklch(0.925_0.032_96_/_0.6)] backdrop-blur-sm border-b border-[oklch(0.52_0.022_118_/_0.12)] z-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Logo />

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-[oklch(0.52_0.022_118_/_0.12)] bg-white/70 hover:bg-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-primary" />
                )}
              </div>
              <span className="text-[14px] font-medium text-foreground hidden sm:block">
                {userName}
              </span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>

            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-border py-2 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    onProfileClick?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-foreground hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings size={16} className="text-muted-foreground" />
                  Profile settings
                </button>
                <div className="h-px bg-border my-1.5" />
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default NavBar1;