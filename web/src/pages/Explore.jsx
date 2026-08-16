import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Heart,
  MapPin,
  Minus,
  Plus,
  Search,
  Star,
  Users,
} from 'lucide-react';

import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

import aaImg from '../assets/AA.jpg';
import hawaImg from '../assets/hawa.jpg';
import bahirImg from '../assets/bahir.jpg';
import lalibelaImg from '../assets/lalibela.jpg';
import direImg from '../assets/dire.jpg';

const Explore = () => {
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(2);
  const [favorites, setFavorites] = useState({});
  const [sortBy, setSortBy] = useState('Recommended');

  const [selectedType, setSelectedType] = useState('');
  const [selectedBathroom, setSelectedBathroom] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRating, setSelectedRating] = useState('');

  const [priceRange, setPriceRange] = useState([500, 2600]);

  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const guestsRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target)) {
        setShowGuestsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      bathrooms: 2,
      amenities: ['Wi-Fi', 'Kitchen', 'Free parking'],
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
      bathrooms: 3,
      amenities: ['Wi-Fi', 'Kitchen', 'Pool'],
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
      bathrooms: 1,
      amenities: ['Wi-Fi', 'Kitchen', 'Free parking'],
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
      bathrooms: 2,
      amenities: ['Wi-Fi', 'Pool', 'Free parking'],
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
      bathrooms: 1,
      amenities: ['Wi-Fi', 'Kitchen'],
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
      bathrooms: 2,
      amenities: ['Wi-Fi', 'Free parking'],
    },
  ];

  const propertyTypes = [
    'Apartment',
    'Villa',
    'Hotel',
    'Guesthouse',
    'Private room',
    'Unique stay',
  ];

  const bathroomOptions = ['1', '2', '3', '4+'];

  const amenityOptions = [
    'Wi-Fi',
    'Kitchen',
    'Free parking',
    'Pool',
  ];

  const ratingOptions = [
    { label: '4.5+', value: 4.5 },
    { label: '4+', value: 4 },
    { label: '3.5+', value: 3.5 },
  ];

  const toggleArrayValue = (value, setter) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const toggleFavorite = (slug, event) => {
    event.preventDefault();
    event.stopPropagation();

    setFavorites((current) => ({
      ...current,
      [slug]: !current[slug],
    }));
  };

  const filteredProperties = useMemo(() => {
    let result = properties.filter((property) => {
      const matchesLocation =
        !location.trim() ||
        `${property.name} ${property.location}`
          .toLowerCase()
          .includes(location.trim().toLowerCase());

      const matchesType =
        !selectedType || property.type === selectedType;

      const matchesBathroom =
        !selectedBathroom ||
        (selectedBathroom === '4+'
          ? property.bathrooms >= 4
          : property.bathrooms === Number(selectedBathroom));

      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) =>
          property.amenities.includes(amenity)
        );

      const matchesRating =
        !selectedRating || property.rating >= Number(selectedRating);

      // The reference shows ETB 500–2,600 as the filter scale.
      // We compare against the displayed nightly price after normalizing
      // the property prices to the same visual scale.
      const normalizedPrice = Math.min(
        2600,
        Math.max(500, Math.round(property.price / 2))
      );

      const matchesPrice =
        normalizedPrice >= priceRange[0] &&
        normalizedPrice <= priceRange[1];

      return (
        matchesLocation &&
        matchesType &&
        matchesBathroom &&
        matchesAmenities &&
        matchesRating &&
        matchesPrice
      );
    });

    if (sortBy === 'Price: low to high') {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sortBy === 'Price: high to low') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sortBy === 'Top rated') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    location,
    selectedType,
    selectedBathroom,
    selectedAmenities,
    selectedRating,
    priceRange,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedType('');
    setSelectedBathroom('');
    setSelectedAmenities([]);
    setSelectedRating('');
    setPriceRange([500, 2600]);
    setLocation('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Search area */}
      <section className="border-b border-border bg-white px-6 pt-24 pb-6">
        <div className="max-w-[1540px] mx-auto">
          <div className="bg-white border border-border rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-1.5 flex flex-col lg:flex-row items-stretch lg:items-center">
            <div className="grid grid-cols-1 md:grid-cols-4 flex-1 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="px-5 py-1.5 flex flex-col justify-center">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                  Location
                </label>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary flex-shrink-0" />
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Addis Ababa, Hawassa..."
                    className="w-full bg-transparent border-0 outline-none p-0 text-[15px] text-foreground placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <button
                type="button"
                className="px-5 py-1.5 flex flex-col justify-center text-left hover:bg-muted/30 transition-colors"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                  Check-in
                </span>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary flex-shrink-0" />
                  <span className="text-[15px] text-muted-foreground">Add date</span>
                </div>
              </button>

              <button
                type="button"
                className="px-5 py-1.5 flex flex-col justify-center text-left hover:bg-muted/30 transition-colors"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                  Check-out
                </span>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary flex-shrink-0" />
                  <span className="text-[15px] text-muted-foreground">Add date</span>
                </div>
              </button>

              <div className="relative" ref={guestsRef}>
                <button
                  type="button"
                  onClick={() => setShowGuestsDropdown((prev) => !prev)}
                  className="w-full px-5 py-1.5 flex flex-col justify-center text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                    Guests
                  </span>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-primary flex-shrink-0" />
                    <span className="text-[15px] text-foreground">
                      {guests} {guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                </button>

                {showGuestsDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border p-5 z-50 w-[280px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[15px] font-semibold text-foreground">Guests</p>
                        <p className="text-[13px] text-muted-foreground">Adults and children</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setGuests((current) => Math.max(1, current - 1))}
                          disabled={guests <= 1}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="text-[16px] font-medium text-foreground w-4 text-center">
                          {guests}
                        </span>

                        <button
                          type="button"
                          onClick={() => setGuests((current) => Math.min(16, current + 1))}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLocation(location.trim())}
              className="mt-2 lg:mt-0 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-opacity lg:min-w-[110px]"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Main Explore content */}
      <main className="px-6 py-10">
        <div className="max-w-[1540px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div>
              <h1 className="font-serif text-2xl md:text-[28px] font-bold leading-tight">
                Stays in Ethiopia
              </h1>
              <p className="mt-2 text-muted-foreground text-[15px]">
                {filteredProperties.length} places · 12–16 Sep · {guests} {guests === 1 ? 'guest' : 'guests'}
              </p>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="appearance-none min-w-[220px] bg-white border border-border rounded-xl px-4 py-3 pr-10 text-[15px] outline-none cursor-pointer shadow-sm"
              >
                <option>Recommended</option>
                <option>Top rated</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-8">
            {/* Filters */}
            <aside className="bg-white border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-semibold text-[18px]">Filters</h2>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-primary text-[13px] font-medium hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Price */}
              <div className="pb-7 border-b border-border">
                <h3 className="font-medium text-[16px] mb-5">
                  Price range (per night)
                </h3>

                <input
                  type="range"
                  min="500"
                  max="2600"
                  value={priceRange[1]}
                  onChange={(event) =>
                    setPriceRange([priceRange[0], Number(event.target.value)])
                  }
                  className="w-full accent-primary"
                />

                <div className="flex justify-between mt-3 text-[14px] text-muted-foreground">
                  <span>ETB {priceRange[0].toLocaleString()}</span>
                  <span>ETB {priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Property type */}
              <FilterSection title="Property type">
                {propertyTypes.map((type) => (
                  <CheckboxRow
                    key={type}
                    label={type}
                    checked={selectedType === type}
                    onChange={() =>
                      setSelectedType(selectedType === type ? '' : type)
                    }
                    radioStyle
                  />
                ))}
              </FilterSection>

              {/* Bathrooms - immediately after property type */}
              <FilterSection title="Bathrooms">
                {bathroomOptions.map((bathroom) => (
                  <CheckboxRow
                    key={bathroom}
                    label={bathroom === '4+' ? '4+' : bathroom}
                    checked={selectedBathroom === bathroom}
                    onChange={() =>
                      setSelectedBathroom(
                        selectedBathroom === bathroom ? '' : bathroom
                      )
                    }
                    radioStyle
                  />
                ))}
              </FilterSection>

              {/* Amenities - directly after bathrooms */}
              <FilterSection title="Amenities">
                {amenityOptions.map((amenity) => (
                  <CheckboxRow
                    key={amenity}
                    label={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() =>
                      toggleArrayValue(amenity, setSelectedAmenities)
                    }
                  />
                ))}
              </FilterSection>

              {/* Rating - same filter column */}
              <FilterSection title="Rating" last>
                {ratingOptions.map((rating) => (
                  <CheckboxRow
                    key={rating.value}
                    label={rating.label}
                    checked={selectedRating === rating.value}
                    onChange={() =>
                      setSelectedRating(
                        selectedRating === rating.value ? '' : rating.value
                      )
                    }
                    radioStyle
                  />
                ))}
              </FilterSection>
            </aside>

            {/* Property cards */}
            <section>
              {filteredProperties.length === 0 ? (
                <div className="min-h-[420px] bg-white border border-border rounded-2xl flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Search size={23} className="text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">
                    No stays found
                  </h2>
                  <p className="text-muted-foreground max-w-md mb-5">
                    Try changing your filters or searching for another location.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                  {filteredProperties.map((property) => (
                    <Link
                      key={property.slug}
                      to={`/property/${property.slug}`}
                      className="group min-w-0"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
                        <img
                          src={property.image}
                          alt={`${property.name} in ${property.location}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/95 text-[12px] font-semibold uppercase">
                          {property.type}
                        </div>

                        <button
                          type="button"
                          aria-label="Save to favorites"
                          onClick={(event) =>
                            toggleFavorite(property.slug, event)
                          }
                          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                        >
                          <Heart
                            size={19}
                            className={
                              favorites[property.slug]
                                ? 'fill-primary text-primary'
                                : 'text-foreground'
                            }
                          />
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[17px] font-semibold leading-tight group-hover:underline">
                          {property.name}
                        </h3>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star
                            size={15}
                            className="fill-primary text-primary"
                          />
                          <span className="text-[14px] font-medium">
                            {property.rating}
                          </span>
                          <span className="text-[14px] text-muted-foreground">
                            ({property.reviews})
                          </span>
                        </div>
                      </div>

                      <p className="text-[14px] text-muted-foreground mt-1">
                        {property.location}
                      </p>

                      <p className="text-[15px] font-semibold mt-2">
                        ETB {property.price.toLocaleString()}
                        <span className="font-normal text-muted-foreground">
                          {' '}
                          / night
                        </span>
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const FilterSection = ({ title, children, last = false }) => (
  <div className={last ? 'pt-7' : 'py-7 border-b border-border'}>
    <h3 className="font-medium text-[16px] mb-4">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const CheckboxRow = ({
  label,
  checked,
  onChange,
  radioStyle = false,
}) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input
      type={radioStyle ? 'radio' : 'checkbox'}
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 accent-primary cursor-pointer"
    />
    <span className="text-[14px] text-foreground group-hover:text-primary transition-colors">
      {label}
    </span>
  </label>
);

export default Explore;