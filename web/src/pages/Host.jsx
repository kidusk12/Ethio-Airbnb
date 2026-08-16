import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CircleDollarSign, CalendarCheck, ShieldAlert } from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import HeroImg from '../assets/hero.jpg';

const Host = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 max-w-[1450px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <p className="text-[11px] font-semibold text-primary tracking-[0.15em] mb-4 uppercase">
              Hosting
            </p>
            <h1 className="text-3xl md:text-[36px] lg:text-[42px] leading-[1.05] font-bold mb-6 font-serif text-foreground">
              Your space could earn ETB 42,000 a month.
            </h1>
            <p className="text-[16px] text-muted-foreground leading-relaxed mb-8 max-w-md">
              Thousands of travellers search Sheba Stays every week. Listing is free and takes about fifteen minutes.
            </p>

            <Link to="/host/list">
              <button className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-lg text-[15px] font-semibold transition-opacity">
                List your place
              </button>
            </Link>
          </div>

          {/* Right: Image */}
          <div className="relative h-[360px] lg:h-[460px] rounded-3xl overflow-hidden">
            <img
              src={HeroImg}
              alt="A host welcoming a group of guests at her front door"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Steps / Features */}
      <section className="py-16 px-6 bg-[oklch(0.925_0.032_96_/_0.6)] border-y border-[oklch(0.52_0.022_118_/_0.12)]">
        <div className="max-w-[1450px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <step.icon size={20} className="text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-[17px] font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Host;