import React from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, CalendarCheck, ShieldCheck, UserPlus, Home as HouseIcon, Rocket } from "lucide-react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const A = "#E8473F";
const aaImg = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80";

const BENEFITS = [
  { icon: Wallet,        title: "Set your own price",  desc: "You control the nightly rate and can adjust it any time."                     },
  { icon: CalendarCheck, title: "Own your calendar",   desc: "Mark a listing inactive whenever it isn't available."                          },
  { icon: ShieldCheck,   title: "Verified payouts",    desc: "Every payout is logged with a reference number and timestamp."                 },
];

const STEPS = [
  { icon: UserPlus,   title: "Sign up",           desc: "Create a host account in a couple of minutes."                      },
  { icon: HouseIcon,  title: "List your property",desc: "Add photos, a description, house rules and a nightly price."         },
  { icon: Rocket,     title: "Start earning",     desc: "Accept bookings and get paid out after each verified stay."           },
];

export default function BecomeHost() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  function handleStart() {
    navigate(user ? "/host/list" : "/login", { state: { from: "/host/list" } });
  }

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 px-6 max-w-[1340px] mx-auto">
        <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
          <img src={aaImg} alt="Host property in Addis Ababa" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center pl-8 md:pl-14 pr-6 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-[0.18em] mb-4 uppercase text-white w-fit">
              Become a host
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white leading-tight mb-4">
              Turn your space into income.
            </h1>
            <p className="text-[15px] text-white/90 max-w-md leading-relaxed mb-6">
              List an apartment, villa or a single room and start earning from guests across Ethiopia.
            </p>
            <button onClick={handleStart} className="px-7 py-3.5 rounded-xl text-[15px] font-bold text-white shadow-md transition-opacity hover:opacity-90 w-fit" style={{ background: A }}>
              Start hosting today
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-6 max-w-[1100px] mx-auto">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2 text-center" style={{ color: A }}>Why host with us</p>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-8 text-center">Hosting advantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#fdf2f2", color: A }}>
                <b.icon size={20} />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-[13.5px] text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3-step guide */}
      <section className="py-12 px-6 max-w-[1100px] mx-auto">
        <div className="bg-stone-100/70 border border-stone-200/50 rounded-3xl p-6 md:p-10">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2 text-center" style={{ color: A }}>Getting started</p>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-8 text-center">Three steps to your first booking</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.title} className="bg-white/80 rounded-2xl p-6 shadow-sm text-center">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4 text-white" style={{ background: A }}>
                  <step.icon size={20} />
                </div>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: A }}>Step {i + 1}</p>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 px-6 max-w-[1100px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-4">Ready to list your first property?</h2>
        <p className="text-[14px] text-gray-500 mb-6 max-w-md mx-auto">It takes about 10 minutes, and your listing goes live as soon as it's approved.</p>
        <button onClick={handleStart} className="px-7 py-3.5 rounded-xl text-[15px] font-bold text-white shadow-md transition-opacity hover:opacity-90" style={{ background: A }}>
          Start hosting today
        </button>
      </section>

      <Footer />
    </div>
  );
}
