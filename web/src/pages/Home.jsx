import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  ChevronRight,
  Star,
  Check,
  Building,
  Home as HouseIcon,
  Hotel,
  Key,
  Compass,
  Sparkles,
  Loader2,
} from 'lucide-react';
import heroImg from '../assets/hero.jpg';
import aaImg from '../assets/AA.jpg';
import hawaImg from '../assets/hawa.jpg';
import bahirImg from '../assets/bahir.jpg';
import lalibelaImg from '../assets/lalibela.jpg';
import direImg from '../assets/dire.jpg';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import Search from '../components/Search';
import { useAuth } from '../context/AuthContext';
import { getPublicListings } from '../lib/api';

const CATEGORY_LABELS = {
  apartment: 'Apartment', villa: 'Villa', hotel: 'Hotel',
  guesthouse: 'Guesthouse', private_room: 'Private room', unique_stay: 'Unique stay',
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Live listings for "Handpicked places" section
  const [featuredListings, setFeaturedListings] = useState([]);
  const [listingsLoading, setListingsLoading]   = useState(true);

  useEffect(() => {
    getPublicListings({ limit: 6 })
      .then(({ status, body }) => {
        if (status === 200) setFeaturedListings(body.data?.listings ?? []);
      })
      .catch(() => {})
      .finally(() => setListingsLoading(false));
  }, []);

  const destinations = [
    { name: 'Addis Ababa', stays: 312, image: aaImg },
    { name: 'Hawassa', stays: 128, image: hawaImg },
    { name: 'Bahir Dar', stays: 96, image: bahirImg },
    { name: 'Lalibela', stays: 74, image: lalibelaImg },
    { name: 'Dire Dawa', stays: 58, image: direImg },
  ];

  const propertyTypes = [
    { label: 'Apartments', icon: Building, desc: 'Modern city flats' },
    { label: 'Villas', icon: HouseIcon, desc: 'Spacious private estates' },
    { label: 'Hotels', icon: Hotel, desc: 'Full service stays' },
    { label: 'Guesthouses', icon: Key, desc: 'Local cozy hospitality' },
    { label: 'Private rooms', icon: HomeIcon, desc: 'Affordable comfort' },
    { label: 'Unique stays', icon: Sparkles, desc: 'Eco lodges & traditional' },
  ];

  const handleStartHosting = () => {
    if (user) {
      navigate('/host/list');
    } else {
      navigate('/login', { state: { from: '/host/list' } });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-10 px-6 max-w-[1340px] mx-auto">
        <div className="relative h-[620px] rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={heroImg}
            alt="Terrace of a highland guesthouse overlooking Ethiopian mountains at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end pb-28">
            <div className="text-white pl-8 md:pl-14 pr-6 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-[0.18em] mb-4 uppercase text-white">
                <Compass size={12} /> Stays across Ethiopia
              </span>
              <h1 className="text-4xl md:text-[52px] lg:text-[60px] leading-[1.08] font-bold mb-4 font-serif text-white">
                Find a place you'll love to stay.
              </h1>
              <p className="text-[16px] md:text-[17px] leading-relaxed text-white/90 max-w-lg font-normal">
                Discover comfortable homes, apartments, villas and unique stays hosted by people who know the place best — with honest prices in ETB.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <Search variant="hero" />
        </div>
      </section>

      {/* Property Categories Container - Styled with the exact footer background */}
      <section className="py-8 px-6 max-w-[1240px] mx-auto">
        <div className="bg-[oklch(0.925_0.032_96_/_0.6)] border border-[oklch(0.52_0.022_118_/_0.12)] rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-[11px] font-bold text-primary tracking-[0.18em] uppercase mb-1">
              Explore by category
            </p>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground">
              Find exactly the type of stay you need
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {propertyTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to="/explore"
                  className="group bg-white/80 hover:bg-white border border-[oklch(0.52_0.022_118_/_0.12)] hover:border-primary rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                    {item.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 px-6 max-w-[1240px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[11px] font-bold text-primary tracking-[0.18em] mb-2 uppercase">
              Popular destinations
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              Where travellers are going
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-primary hover:opacity-80 font-semibold text-[14px] flex items-center gap-1 transition-opacity"
          >
            See all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              to="/explore"
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={dest.image}
                alt={`Stays in ${dest.name}`}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-bold mb-0.5">{dest.name}</h3>
                <p className="text-xs text-white/80">{dest.stays} verified stays</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Handpicked Places */}
      <section className="py-12 px-6 max-w-[1240px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[11px] font-bold text-primary tracking-[0.18em] mb-2 uppercase">
              Explore stays
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              Handpicked places this month
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-primary hover:opacity-80 font-semibold text-[14px] flex items-center gap-1 transition-opacity"
          >
            View all stays
            <ChevronRight size={16} />
          </Link>
        </div>

        {listingsLoading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Loading stays…</span>
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No approved listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {featuredListings.map((listing) => {
              const coverPhoto = listing.coverPhoto || listing.photos?.[0] || null;
              const label = CATEGORY_LABELS[listing.category] ?? listing.category;
              const rating = listing.averageRating ?? 0;
              const reviewCount = listing.reviewCount ?? 0;
              return (
                <Link
                  key={listing.id}
                  to={`/property/${listing.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-sm bg-stone-100">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No photo
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-foreground">
                      {label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-[16px] font-bold text-foreground group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    {rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-primary text-primary" />
                        <span className="text-[14px] font-semibold">{rating.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[14px] text-muted-foreground mb-1.5">{listing.location}</p>
                  <p className="text-[15px] font-bold text-foreground">
                    ETB {listing.pricePerNight.toLocaleString()}
                    <span className="font-normal text-muted-foreground text-[13px]"> / night</span>
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Become a Host Banner */}
      <section className="py-14 px-6 max-w-[1240px] mx-auto">
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[320px] lg:min-h-[420px]">
              <img
                src={aaImg}
                alt="A host welcoming guests into her home"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-[11px] font-bold text-primary tracking-[0.18em] mb-3 uppercase">
                Become a host
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif leading-tight">
                Turn your space into income.
              </h2>
              <p className="text-[15px] text-muted-foreground mb-6 leading-relaxed">
                List an apartment, villa or a single room. Set your own price, control your calendar, and get paid after each stay.
              </p>
              <ul className="space-y-3 mb-8">
                {['Free to list in 10 minutes', 'Host protection and identity verification', 'Direct payouts in ETB'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check size={13} className="text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-[15px] font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div>
                <button
                  type="button"
                  onClick={handleStartHosting}
                  className="bg-primary hover:bg-[#c82333] text-white px-7 py-3.5 rounded-xl text-[15px] font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Start hosting 
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
