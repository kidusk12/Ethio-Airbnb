import React from "react";
import { Link } from "react-router-dom";
import { Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const A = "#E8473F";

const heroImg = "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1400&q=80";
const aaImg   = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Local first",
    desc: "Every host we feature knows their city, town or village — we build tools that let that knowledge shine through.",
  },
  {
    icon: ShieldCheck,
    title: "Verified, always",
    desc: "Every booking runs through a manual payment verification process, so hosts and guests can trust each transaction.",
  },
  {
    icon: Sparkles,
    title: "Honest pricing",
    desc: "Prices are shown in ETB with no hidden markups, so travellers know exactly what they're paying for.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 px-6 max-w-[1340px] mx-auto">
        <div className="relative h-[380px] rounded-3xl overflow-hidden shadow-2xl">
          <img src={heroImg} alt="Highland guesthouse in Ethiopia" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end pb-12 pl-8 md:pl-14 pr-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-[0.18em] mb-4 uppercase text-white w-fit">
              <Compass size={12} /> Our story
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white max-w-xl leading-tight">
              Built for the way Ethiopia travels.
            </h1>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-12 px-6 max-w-[900px] mx-auto">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: A }}>Company overview</p>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-5">
          EthioStays connects travellers with real Ethiopian hosts.
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-4">
          We started EthioStays because booking a place to stay across Ethiopia — from Addis Ababa apartments to Lalibela guesthouses — meant relying on word of mouth or unreliable listings. We built a platform where hosts can list a property in minutes and guests can book with confidence, backed by a verified payment process on every transaction.
        </p>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          Today, EthioStays lists apartments, villas, hotels, guesthouses and unique stays in cities and towns across the country, each one priced honestly in ETB.
        </p>
      </section>

      {/* Mission */}
      <section className="py-4 px-6 max-w-[900px] mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: A }}>Our mission</p>
          <h3 className="text-xl md:text-2xl font-bold font-display text-gray-900 mb-4">
            Make it simple to discover and host a great stay anywhere in Ethiopia.
          </h3>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            We measure success by how easily a host can turn a spare room into income, and how confidently a guest can book a stay.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 px-6 max-w-[1100px] mx-auto">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2 text-center" style={{ color: A }}>What we stand for</p>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-8 text-center">Core values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#fdf2f2", color: A }}>
                <v.icon size={20} />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-[13.5px] text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 px-6 max-w-[1100px] mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[240px] lg:min-h-[320px]">
            <img src={aaImg} alt="Host welcoming guests" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-bold font-display text-gray-900 mb-3">Want to be part of it?</h3>
            <p className="text-[14px] text-gray-500 mb-6">
              Whether you're looking for your next stay or thinking about hosting, EthioStays is built around you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/explore" className="px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90" style={{ background: A }}>
                Explore stays
              </Link>
              <Link to="/host" className="px-6 py-3 rounded-xl text-[14px] font-bold border border-gray-200 hover:border-gray-300 text-gray-700 transition-colors">
                Become a host
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}