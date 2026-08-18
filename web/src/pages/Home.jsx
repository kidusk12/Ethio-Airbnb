import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  ChevronRight,
  Heart,
  Star,
  Check,
  Building,
  Landmark,
  Hotel,
  Key,
  Compass,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import Search from '../components/Search';
import { useAuth } from '../context/AuthContext';

// ── Images (Unsplash) ─────────────────────────────────────────────────────────
const heroImg  = "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1400&q=80";
const aaImg    = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";
const hawaImg  = "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80";
const bahirImg = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80";
const lalibelaImg = "https://images.unsplash.com/photo-1615887023544-9ea1c9b1c8e5?w=800&q=80";
const direImg  = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

const destinations = [
  { name: 'Addis Ababa', stays: 312, image: aaImg    },
  { name: 'Hawassa',     stays: 128, image: hawaImg  },
  { name: 'Bahir Dar',   stays: 96,  image: bahirImg },
  { name: 'Lalibela',    stays: 74,  image: lalibelaImg },
  { name: 'Dire Dawa',   stays: 58,  image: direImg  },
];

const properties = [
  { slug: 'bole-skyline-suite',         name: 'Bole Skyline Suite',         type: 'Apartment',    rating: 4.92, reviews: 168, location: 'Bole, Addis Ababa',         price: 4800,  image: aaImg       },
  { slug: 'hawassa-lake-villa',          name: 'Hawassa Lake Villa',          type: 'Villa',        rating: 4.87, reviews: 94,  location: 'Lake Hawassa, Hawassa',       price: 9200,  image: hawaImg     },
  { slug: 'lalibela-stone-guesthouse',   name: 'Lalibela Stone Guesthouse',   type: 'Guesthouse',   rating: 4.95, reviews: 212, location: 'Old Town, Lalibela',          price: 3400,  image: lalibelaImg },
  { slug: 'bahir-dar-garden-house',      name: 'Bahir Dar Garden House',      type: 'Hotel',        rating: 4.78, reviews: 141, location: 'Tana Lakeside, Bahir Dar',    price: 5600,  image: bahirImg    },
  { slug: 'kazanchis-loft',              name: 'Kazanchis Design Loft',       type: 'Private room', rating: 4.71, reviews: 63,  location: 'Kazanchis, Addis Ababa',      price: 2200,  image: aaImg       },
  { slug: 'dire-dawa-courtyard',         name: 'Dire Dawa Courtyard Stay',    type: 'Unique stay',  rating: 4.83, reviews: 77,  location: 'Kezira, Dire Dawa',           price: 3900,  image: direImg     },
];

const propertyTypes = [
  { label: 'Apartments',    icon: Building,  desc: 'Modern city flats'        },
  { label: 'Villas',        icon: Landmark,  desc: 'Spacious private estates'  },
  { label: 'Hotels',        icon: Hotel,     desc: 'Full service stays'        },
  { label: 'Guesthouses',   icon: Key,       desc: 'Local cozy hospitality'    },
  { label: 'Private rooms', icon: HomeIcon,  desc: 'Affordable comfort'        },
  { label: 'Unique stays',  icon: Sparkles,  desc: 'Eco lodges & traditional'  },
];

const A = "#E8473F";

export default function Home() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [favorites, setFavorites] = useState({});

  function toggleFavorite(slug, e) {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((p) => ({ ...p, [slug]: !p[slug] }));
  }

  function handleStartHosting() {
    navigate(user ? '/host/list' : '/login', { state: { from: '/host/list' } });
  }

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-gray-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-24 pb-10 px-6 max-w-[1340px] mx-auto">
        <div className="relative h-[620px] rounded-3xl overflow-hidden shadow-2xl">
          <img src={heroImg} alt="Highland guesthouse at sunset" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end pb-28">
            <div className="text-white pl-8 md:pl-14 pr-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-[0.18em] mb-4 uppercase">
                <Compass size={12} /> Stays across Ethiopia
              </span>
              <h1 className="text-4xl md:text-[52px] lg:text-[60px] leading-[1.08] font-bold mb-4 font-display">
                Find a place you'll love to stay.
              </h1>
              <p className="text-[16px] md:text-[17px] leading-relaxed text-white/90 max-w-lg">
                Discover comfortable homes, apartments, villas and unique stays — with honest prices in ETB.
              </p>
            </div>
          </div>
          <Search variant="hero" />
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-8 px-6 max-w-[1240px] mx-auto">
        <div className="bg-stone-100/70 border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: A }}>Explore by category</p>
            <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900">Find exactly the type of stay you need</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {propertyTypes.map(({ label, icon: Icon, desc }) => (
              <Link
                key={label}
                to="/explore"
                className="group bg-white/80 hover:bg-white border border-stone-200/50 hover:border-[#E8473F] rounded-2xl p-4 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-[#fdf2f2] group-hover:bg-[#E8473F] text-[#E8473F] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                  <Icon size={20} />
                </div>
                <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#E8473F] transition-colors">{label}</span>
                <span className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular destinations ── */}
      <section className="py-12 px-6 max-w-[1240px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: A }}>Popular destinations</p>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900">Where travellers are going</h2>
          </div>
          <Link to="/explore" className="font-semibold text-[14px] flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: A }}>
            See all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {destinations.map((d) => (
            <Link key={d.name} to="/explore" className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-bold mb-0.5">{d.name}</h3>
                <p className="text-xs text-white/80">{d.stays} verified stays</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Handpicked stays ── */}
      <section className="py-12 px-6 max-w-[1240px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: A }}>Explore stays</p>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900">Handpicked places this month</h2>
          </div>
          <Link to="/explore" className="font-semibold text-[14px] flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: A }}>
            View all stays <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {properties.map((p) => {
            const fav = !!favorites[p.slug];
            return (
              <Link key={p.slug} to={`/property/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-sm bg-stone-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-gray-900">
                    {p.type}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(p.slug, e)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                  >
                    <Heart size={15} style={{ fill: fav ? A : "transparent", color: fav ? A : "#1a1a1a" }} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#E8473F] transition-colors">{p.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star size={14} style={{ fill: A, color: A }} />
                    <span className="text-[14px] font-semibold">{p.rating}</span>
                  </div>
                </div>
                <p className="text-[14px] text-gray-500 mb-1.5">{p.location}</p>
                <p className="text-[15px] font-bold text-gray-900">
                  ETB {p.price.toLocaleString()}
                  <span className="font-normal text-gray-400 text-[13px]"> / night</span>
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Become a host banner ── */}
      <section className="py-14 px-6 max-w-[1240px] mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[320px] lg:min-h-[420px]">
              <img src={aaImg} alt="Host welcoming guests" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-[11px] font-bold tracking-[0.18em] mb-3 uppercase" style={{ color: A }}>Become a host</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display leading-tight">Turn your space into income.</h2>
              <p className="text-[15px] text-gray-500 mb-6 leading-relaxed">
                List an apartment, villa or a single room. Set your own price, control your calendar, and get paid after each stay.
              </p>
              <ul className="space-y-3 mb-8">
                {['Free to list in 10 minutes', 'Host protection and identity verification', 'Direct payouts in ETB'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#fdf2f2" }}>
                      <Check size={13} style={{ color: A }} strokeWidth={3} />
                    </div>
                    <span className="text-[15px] font-medium text-gray-900">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleStartHosting}
                className="w-fit px-7 py-3.5 rounded-xl text-[15px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
                style={{ background: A }}
              >
                Start hosting today
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
