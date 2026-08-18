import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const A = "#E8473F";

const NAV_LINKS = [
  { label: "Explore",        to: "/explore"        },
  { label: "About",          to: "/about"           },
  { label: "Become a host",  to: "/become-a-host"   },
  { label: "Help",           to: "/help"            },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
        style={{ background: A }}
      >
        <Home size={18} color="#fff" strokeWidth={2.25} />
      </div>
      <span className="text-[19px] font-bold tracking-tight text-gray-900 whitespace-nowrap leading-none">
        Ethio<span style={{ color: A }}>Stays</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-shadow"
      style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,0.08)" : "none",
        borderBottom: scrolled ? "none" : "1px solid #f3f4f6",
      }}
    >
      <div className="max-w-[1340px] mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, to }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="px-3.5 py-2 rounded-lg text-[14px] font-medium transition-colors"
                style={{ color: active ? A : "#374151" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 border border-gray-200 rounded-full pl-3 pr-0.5 py-0.5 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex flex-col gap-[4.5px]">
                <span className="block w-[15px] h-[1.5px] rounded-full bg-gray-700" />
                <span className="block w-[15px] h-[1.5px] rounded-full bg-gray-700" />
                <span className="block w-[15px] h-[1.5px] rounded-full bg-gray-700" />
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0"
                style={{ background: "#717171" }}
              >
                {user.name?.[0]?.toUpperCase() || "G"}
              </div>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-[14px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: A }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-1">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="block px-3 py-2.5 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="block px-3 py-2.5 rounded-xl text-[15px] font-semibold text-white text-center transition-opacity hover:opacity-90"
                style={{ background: A }}
              >
                My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2.5 rounded-xl text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2.5 rounded-xl text-[15px] font-semibold text-white text-center transition-opacity hover:opacity-90"
                  style={{ background: A }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
