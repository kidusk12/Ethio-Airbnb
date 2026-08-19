import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LayoutDashboard, User } from 'lucide-react';
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
  const { user } = useAuth();

  const hostFirstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : null);
  const initialLetter = hostFirstName ? hostFirstName.charAt(0).toUpperCase() : 'H';

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
              <Link
                to="/host/Host_dashboard"
                className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-border bg-white hover:border-primary transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[12px]">
                  {initialLetter}
                </div>
                <span className="text-[13px] font-semibold text-foreground">
                  {hostFirstName || 'Dashboard'}
                </span>
              </Link>
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
    </header>
  );
};

export default Navbar;