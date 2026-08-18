import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const LINKS = {
  Company: [["About", "/about"]],
  Hosting: [["Become a host", "/become-a-host"]],
  Support: [["Help center", "/help"]],
  Legal: [["Terms & conditions", "/terms"]],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8473F" }}>
                <MapPin size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[19px] font-bold tracking-tight text-gray-900">
                Ethio<span style={{ color: "#E8473F" }}>Stays</span>
              </span>
            </Link>
            <p className="text-[12px] text-gray-400 leading-relaxed max-w-[170px]">
              Discover unique stays across Ethiopia.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {heading}
              </h3>
              <ul className="space-y-2">
                {items.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-gray-400">
            © {new Date().getFullYear()} EthioStays · All rights reserved.
          </p>
          <p className="text-[12px] text-gray-400">Made with ❤️ in Ethiopia 🇪🇹</p>
        </div>
      </div>
    </footer>
  );
}