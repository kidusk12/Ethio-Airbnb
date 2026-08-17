import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';

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

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full text-[15px] transition-colors ${
    isActive
      ? 'bg-[oklch(0.88_0.03_96)] text-foreground font-semibold'
      : 'text-[oklch(0.52_0.022_118)] hover:bg-[oklch(0.9_0.025_96)] hover:text-foreground'
  }`;

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[oklch(0.925_0.032_96_/_0.6)] backdrop-blur-sm border-b border-[oklch(0.52_0.022_118_/_0.12)] z-50">
      <div className="max-w-[1200px] mx-auto px-6">
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

            <NavLink to="/help" className={navLinkClass}>
              Help
            </NavLink>
          </nav>

          {/* Authentication */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="bg-primary hover:opacity-90 text-white px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-opacity">
                Login
              </button>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;