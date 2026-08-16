import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Compass, Heart, Briefcase, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Explore",   icon: Compass,      to: "/explore"                },
  { label: "Favorites", icon: Heart,         to: "/dashboard?tab=saved"   },
  { label: "Trips",     icon: Briefcase,     to: "/dashboard?tab=bookings" },
  { label: "Messages",  icon: MessageCircle, to: "/dashboard?tab=messages" },
  { label: "Profile",   icon: User,          to: "/dashboard?tab=settings" },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab");

  function isActive({ to }) {
    const [path, qs] = to.split("?");
    const tab = qs ? new URLSearchParams(qs).get("tab") : null;
    if (path !== pathname) return false;
    return tab ? activeTab === tab : !activeTab;
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
              style={{ color: active ? "#E8473F" : "#9ca3af" }}
            >
              <item.icon size={21} strokeWidth={active ? 2.25 : 1.75} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
