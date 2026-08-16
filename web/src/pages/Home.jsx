import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon,
  MapPin,
  Calendar,
  Users,
  Search,
  ChevronRight,
  Heart,
  Star,
  Check,
} from 'lucide-react';
import Button from '../components/ui/Button';
import heroImg from '../assets/hero.jpg';
import aaImg from '../assets/AA.jpg';
import hawaImg from '../assets/hawa.jpg';
import bahirImg from '../assets/bahir.jpg';
import lalibelaImg from '../assets/lalibela.jpg';
import direImg from '../assets/dire.jpg';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="w-[34px] h-[34px] rounded-full bg-primary flex items-center justify-center">
      <HomeIcon size={17} className="text-primary-foreground" strokeWidth={2.5} />
    </div>
    <span className="font-serif text-[22px] font-bold tracking-tight">
      <span className="text-foreground">Ethio</span>
      <span className="text-primary">Stays</span>
    </span>
  </Link>
);

const Home = () => {
  const [guests] = useState(2);
  const [favorites, setFavorites] = useState({});

  const destinations = [
    { name: 'Addis Ababa', stays: 312, image: aaImg },
    { name: 'Hawassa', stays: 128, image: hawaImg },
    { name: 'Bahir Dar', stays: 96, image: bahirImg },
    { name: 'Lalibela', stays: 74, image: lalibelaImg },
    { name: 'Dire Dawa', stays: 58, image: direImg },
  ];

  const properties = [
    {
      slug: 'bole-skyline-suite',
      name: 'Bole Skyline Suite',
      type: 'Apartment',
      rating: 4.92,
      reviews: 168,
      location: 'Bole, Addis Ababa',
      price: 4800,
      image: aaImg,
    },
    {
      slug: 'hawassa-lake-villa',
      name: 'Hawassa Lake Villa',
      type: 'Villa',
      rating: 4.87,
      reviews: 94,
      location: 'Lake Hawassa, Hawassa',
      price: 9200,
      image: hawaImg,
    },
    {
      slug: 'lalibela-stone-guesthouse',
      name: 'Lalibela Stone Guesthouse',
      type: 'Guesthouse',
      rating: 4.95,
      reviews: 212,
      location: 'Old Town, Lalibela',
      price: 3400,
      image: lalibelaImg,
    },
    {
      slug: 'bahir-dar-garden-house',
      name: 'Bahir Dar Garden House',
      type: 'Hotel',
      rating: 4.78,
      reviews: 141,
      location: 'Tana Lakeside, Bahir Dar',
      price: 5600,
      image: bahirImg,
    },
    {
      slug: 'kazanchis-loft',
      name: 'Kazanchis Design Loft',
      type: 'Private room',
      rating: 4.71,
      reviews: 63,
      location: 'Kazanchis, Addis Ababa',
      price: 2200,
      image: aaImg,
    },
    {
      slug: 'dire-dawa-courtyard',
      name: 'Dire Dawa Courtyard Stay',
      type: 'Unique stay',
      rating: 4.83,
      reviews: 77,
      location: 'Kezira, Dire Dawa',
      price: 3900,
      image: direImg,
    },
  ];

  const propertyTypes = [
    'Apartments',
    'Villas',
    'Hotels',
    'Guesthouses',
    'Private rooms',
    'Unique stays',
  ];

  const toggleFavorite = (slug, event) => {
    event.preventDefault();
    event.stopPropagation();
    setFavorites((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
<section className="pt-24 pb-12 px-6 max-w-[1300px] mx-auto">
  <div className="relative h-[600px] rounded-2xl overflow-hidden">
    <img
      src={heroImg}
      alt="Terrace of a highland guesthouse overlooking Ethiopian mountains at sunset"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

    <div className="absolute inset-0 flex flex-col justify-end pb-20">
  <div className="text-white pl-10 md:pl-12 pr-6 max-w-3xl">
    <p className="text-[11px] font-semibold tracking-[0.2em] mb-3 uppercase text-white/85">
      Stays across Ethiopia
    </p>
    <h1 className="text-4xl md:text-[50px] lg:text-[58px] leading-[1.05] font-bold mb-4 font-serif text-white">
      Find a place you'll love to stay.
    </h1>
    <p className="text-[17px] leading-relaxed text-white/90 max-w-lg">
      Discover comfortable homes, apartments, villas and unique stays hosted by people who know the place best — with honest prices in ETB.
    </p>
  </div>
</div>

    {/* Search Bar */}
    <div className="absolute bottom-0 left-0 right-0 ">
      <div className="bg-white rounded-t-xl shadow-2xl p-2.5 flex items-center gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 flex-1 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="px-4 py-1.5 flex items-center gap-3">
            <MapPin size={16} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">
                Location
              </label>
              <input
                type="text"
                placeholder="Addis Ababa, Hawassa…"
                className="w-full text-[13px] text-foreground placeholder:text-muted-foreground/60 bg-transparent border-0 focus:outline-none p-0"
              />
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-1.5 flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Calendar size={16} className="text-primary flex-shrink-0" />
            <div>
              <span className="block text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">
                Check-in
              </span>
              <span className="text-[13px] text-muted-foreground/70">Add date</span>
            </div>
          </button>

          <button
            type="button"
            className="px-4 py-1.5 flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Calendar size={16} className="text-primary flex-shrink-0" />
            <div>
              <span className="block text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">
                Check-out
              </span>
              <span className="text-[13px] text-muted-foreground/70">Add date</span>
            </div>
          </button>

          <button
            type="button"
            className="px-4 py-1.5 flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Users size={16} className="text-primary flex-shrink-0" />
            <div>
              <span className="block text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">
                Guests
              </span>
              <span className="text-[13px] text-foreground">{guests} guests</span>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="hidden md:flex bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg items-center gap-2 font-medium transition-opacity flex-shrink-0"
        >
          <Search size={16} />
          <span className="text-[14px]">Search</span>
        </button>
      </div>
    </div>
  </div>
  
</section>

      {/* Popular Destinations */}
      <section className="py-14 px-6 max-w-[1200px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[11px] font-semibold text-primary tracking-[0.15em] mb-2 uppercase">
              Popular destinations
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              Where travellers are going
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-primary hover:opacity-80 font-medium text-[14px] flex items-center gap-1 transition-opacity"
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
              className="group relative aspect-[3/4] rounded-xl overflow-hidden"
            >
              <img
                src={dest.image}
                alt={`Stays in ${dest.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-bold mb-0.5">{dest.name}</h3>
                <p className="text-sm text-white/85">{dest.stays} stays</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5 mt-8 justify-center">
          {propertyTypes.map((type) => (
            <Link
              key={type}
              to="/explore"
              className="px-5 py-2.5 border border-border rounded-full text-[14px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors bg-white"
            >
              {type}
            </Link>
          ))}
        </div>
      </section>

      {/* Handpicked Places */}
      <section className="py-14 px-6 max-w-[1200px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[11px] font-semibold text-primary tracking-[0.15em] mb-2 uppercase">
              Explore stays
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              Handpicked places this month
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-primary hover:opacity-80 font-medium text-[14px] flex items-center gap-1 transition-opacity"
          >
            View all stays
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {properties.map((property) => (
            <Link
              key={property.slug}
              to={`/property/${property.slug}`}
              className="group"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                <img
                  src={property.image}
                  alt={`${property.name} in ${property.location}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  type="button"
                  aria-label="Save to favorites"
                  onClick={(e) => toggleFavorite(property.slug, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                >
                  <Heart
                    size={16}
                    className={
                      favorites[property.slug]
                        ? 'fill-primary text-primary'
                        : 'text-foreground/70'
                    }
                  />
                </button>
              </div>

              <p className="text-[13px] text-muted-foreground mb-1">{property.type}</p>
              <h3 className="text-[16px] font-semibold text-foreground mb-1 group-hover:underline">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 mb-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-[14px] font-medium">{property.rating}</span>
                <span className="text-[14px] text-muted-foreground">({property.reviews})</span>
              </div>
              <p className="text-[14px] text-muted-foreground mb-1">{property.location}</p>
              <p className="text-[15px] font-semibold text-foreground">
                ETB {property.price.toLocaleString()}
                <span className="font-normal text-muted-foreground"> / night</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Become a Host */}
      <section className="py-14 px-6 max-w-[1200px] mx-auto">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[320px] lg:min-h-[420px]">
              <img
                src={aaImg}
                alt="A host welcoming guests into her home"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-[11px] font-semibold text-primary tracking-[0.15em] mb-3 uppercase">
                Become a host
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif leading-tight">
                Turn your space into income.
              </h2>
              <p className="text-[15px] text-muted-foreground mb-6 leading-relaxed">
                List an apartment, villa or a single room. Set your own price, control your calendar, and get paid after each stay.
              </p>
              <ul className="space-y-3 mb-8">
                {['Free to list', 'Host protection tools', 'Payouts in ETB'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-[15px] text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/host">
                <button className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-lg text-[15px] font-semibold transition-opacity">
                  Start hosting
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
