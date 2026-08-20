import React from "react";
import stayImage from "../assets/hero.jpg";

export function AuthLayout({ children }) {
  return (
    <div className="flex w-full min-h-screen bg-white font-sans">
      {/* LEFT SIDE - 46.5% Width, Sticky and Fixed to Viewport Height */}
      <div className="hidden lg:block lg:w-[48.5%] lg:h-screen lg:sticky lg:top-0 relative overflow-hidden">
        <img
          src={stayImage}
          alt="Ethiopian mountain stay"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Soft Dark Overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
        
        {/* Text Content */}
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h2 className="font-serif text-[28px] leading-[1.2] font-bold mb-4">
            Stays hosted by people who<br />live there.
          </h2>
          <p className="text-[14px] leading-[1.5] text-white/80">
            Addis Ababa · Hawassa · Bahir Dar · Lalibela · Dire<br />Dawa
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - 53.5% Width, Normal flow, scrolls if height is restricted */}
      <div className="w-full lg:w-[51.5%] flex justify-center items-center min-h-screen">
        <div className="w-full max-w-[440px] px-6 py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
