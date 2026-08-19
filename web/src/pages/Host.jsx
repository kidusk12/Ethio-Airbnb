import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CircleDollarSign,
  CalendarCheck,
  ShieldAlert,
  LogIn,
  UserPlus,
  X,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import HeroImg from '../assets/hero.jpg';
import { useAuth } from '../context/AuthContext';

const Host = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const steps = [
    {
      icon: ShieldCheck,
      title: 'Tell us about your place',
      description: 'Type, location, rooms and photos in ten guided steps.',
    },
    {
      icon: CircleDollarSign,
      title: 'Set your own price',
      description: 'Full control over nightly rates, discounts and fees.',
    },
    {
      icon: CalendarCheck,
      title: 'Open your calendar',
      description: 'Choose which dates you accept and how far ahead.',
    },
    {
      icon: ShieldAlert,
      title: 'Welcome guests safely',
      description: 'Verified profiles, reviews and secure messaging.',
    },
  ];

  const handleListYourPlace = () => {
    if (user) {
      navigate('/host/list');
    } else {
      setShowAuthPrompt(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 max-w-[1450px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <p className="text-[11px] font-bold text-primary tracking-[0.2em] mb-4 uppercase">
              Host on EthioStays
            </p>
            <h1 className="text-3xl md:text-[44px] lg:text-[50px] leading-[1.1] font-bold mb-6 font-serif text-foreground">
              Your space could earn <span className="text-primary">ETB 42,000</span> a month.
            </h1>
            <p className="text-[16px] text-muted-foreground leading-relaxed mb-8 max-w-md">
              Thousands of travellers search EthioStays every week. Listing is free, simple, and takes about ten minutes.
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleListYourPlace}
                className="bg-primary hover:bg-[#c82333] text-white px-8 py-3.5 rounded-xl text-[15px] font-bold shadow-md hover:shadow-lg transition-all"
              >
                List your place
              </button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative h-[360px] lg:h-[460px] rounded-3xl overflow-hidden shadow-xl">
            <img
              src={HeroImg}
              alt="A host welcoming a group of guests at her front door"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[12px] font-medium mb-2">
                <Sparkles size={13} /> Verified Host Community
              </span>
              <p className="text-[15px] font-medium text-white/95">
                "Hosting on EthioStays gave me financial independence."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps / Features */}
      <section className="py-16 px-6 bg-[oklch(0.925_0.032_96_/_0.6)] border-y border-[oklch(0.52_0.022_118_/_0.12)]">
        <div className="max-w-[1450px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <step.icon size={22} className="text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-[17px] font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 border border-border shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted-foreground transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-[22px] font-serif font-bold text-foreground mb-6 pr-6">
              Sign in to start hosting
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: '/host/list' } })}
                className="w-full bg-primary hover:bg-[#c82333] text-white py-3 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <LogIn size={16} />
                Log in to my account
              </button>

              <button
                type="button"
                onClick={() => navigate('/register', { state: { from: '/host/list' } })}
                className="w-full bg-white hover:bg-gray-50 text-foreground border border-border py-3 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus size={16} />
                Create a host account
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Host;