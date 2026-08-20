import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Search as SearchIcon,
  Star,
  Loader2,
} from 'lucide-react';

import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import Search from '../components/Search';
import { getPublicListings } from '../lib/api';

// Map backend category slugs → display labels
const CATEGORY_LABELS = {
  apartment:    'Apartment',
  villa:        'Villa',
  hotel:        'Hotel',
  guesthouse:   'Guesthouse',
  private_room: 'Private room',
  unique_stay:  'Unique stay',
};

const Explore = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── filter / sort state ──────────────────────────────────────────────────
  const [location, setLocation]               = useState(searchParams.get('location') || '');
  const [guests, setGuests]                   = useState(Number(searchParams.get('guests')) || 2);
  const [sortBy, setSortBy]                   = useState('Recommended');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBathroom, setSelectedBathroom] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRating, setSelectedRating]   = useState('');
  const [priceRange, setPriceRange]           = useState([500, 50000]);

  // ── API state ────────────────────────────────────────────────────────────
  const [listings, setListings]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError]   = useState('');
  const [totalResults, setTotalResults] = useState(0);

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const query = { limit: 50 };
      if (location.trim()) query.location = location.trim();
      if (selectedCategory) query.category = selectedCategory;
      if (priceRange[0] > 500) query.minPrice = priceRange[0];
      if (priceRange[1] < 50000) query.maxPrice = priceRange[1];

      const { status, body } = await getPublicListings(query);

      if (status === 200) {
        setListings(body.data?.listings ?? []);
        setTotalResults(body.data?.totalResults ?? 0);
      } else {
        setApiError('Failed to load listings. Please try again.');
      }
    } catch {
      setApiError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [location, selectedCategory, priceRange]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // ── client-side filters (bathroom, amenities, rating, sort) ──────────────
  const filteredListings = useMemo(() => {
    let result = listings.filter((listing) => {
      const matchesBathroom =
        !selectedBathroom ||
        (selectedBathroom === '4+'
          ? listing.bathrooms >= 4
          : listing.bathrooms === Number(selectedBathroom));

      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) =>
          (listing.amenities ?? []).some((a) =>
            a.toLowerCase().replace(/_/g, ' ').includes(amenity.toLowerCase())
          )
        );

      const matchesRating =
        !selectedRating ||
        (listing.averageRating ?? 0) >= Number(selectedRating);

      const matchesPrice =
        listing.pricePerNight >= priceRange[0] &&
        listing.pricePerNight <= priceRange[1];

      return matchesBathroom && matchesAmenities && matchesRating && matchesPrice;
    });

    if (sortBy === 'Price: low to high') result = [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === 'Price: high to low') result = [...result].sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (sortBy === 'Top rated')          result = [...result].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));

    return result;
  }, [listings, selectedBathroom, selectedAmenities, selectedRating, priceRange, sortBy]);

  const handleSearch = (searchData) => {
    setLocation(searchData.location || '');
    if (searchData.guests) setGuests(searchData.guests);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBathroom('');
    setSelectedAmenities([]);
    setSelectedRating('');
    setPriceRange([500, 50000]);
    setLocation('');
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((cur) =>
      cur.includes(amenity) ? cur.filter((a) => a !== amenity) : [...cur, amenity]
    );
  };

  const propertyTypes    = Object.keys(CATEGORY_LABELS);
  const bathroomOptions  = ['1', '2', '3', '4+'];
  const amenityOptions   = ['Wi-Fi', 'Kitchen', 'Free parking', 'Private pool'];
  const ratingOptions    = [{ label: '4.5+', value: 4.5 }, { label: '4+', value: 4 }, { label: '3.5+', value: 3.5 }];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Search area */}
      <section className="border-b border-border bg-white px-6 pt-24 pb-6">
        <div className="max-w-[1540px] mx-auto">
          <Search variant="explore" onSearch={handleSearch} />
        </div>
      </section>

      {/* Main content */}
      <main className="px-6 py-10">
        <div className="max-w-[1540px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div>
              <h1 className="font-serif text-2xl md:text-[28px] font-bold leading-tight">
                Stays in Ethiopia
              </h1>
              <p className="mt-2 text-muted-foreground text-[15px]">
                {isLoading
                  ? 'Loading…'
                  : `${filteredListings.length} place${filteredListings.length !== 1 ? 's' : ''} · ${guests} ${guests === 1 ? 'guest' : 'guests'}`}
              </p>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none min-w-[220px] bg-white border border-border rounded-xl px-4 py-3 pr-10 text-[15px] outline-none cursor-pointer shadow-sm"
              >
                <option>Recommended</option>
                <option>Top rated</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-8">
            {/* Filters sidebar */}
            <aside className="bg-white border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-semibold text-[18px]">Filters</h2>
                <button type="button" onClick={resetFilters} className="text-primary text-[13px] font-medium hover:underline cursor-pointer">
                  Clear all
                </button>
              </div>

              {/* Price range */}
              <div className="pb-7 border-b border-border">
                <h3 className="font-medium text-[16px] mb-4">Price range (per night)</h3>
                <input
                  type="range" min="500" max="50000" step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between mt-3 text-[14px] text-muted-foreground">
                  <span>ETB {priceRange[0].toLocaleString()}</span>
                  <span>ETB {priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Property type */}
              <FilterSection title="Property type">
                {propertyTypes.map((cat) => (
                  <CheckboxRow
                    key={cat}
                    label={CATEGORY_LABELS[cat]}
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    radioStyle
                  />
                ))}
              </FilterSection>

              {/* Bathrooms */}
              <FilterSection title="Bathrooms" grid>
                {bathroomOptions.map((b) => (
                  <CheckboxRow
                    key={b} label={b}
                    checked={selectedBathroom === b}
                    onChange={() => setSelectedBathroom(selectedBathroom === b ? '' : b)}
                    radioStyle
                  />
                ))}
              </FilterSection>

              {/* Amenities */}
              <FilterSection title="Amenities" grid>
                {amenityOptions.map((a) => (
                  <CheckboxRow
                    key={a} label={a}
                    checked={selectedAmenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                  />
                ))}
              </FilterSection>

              {/* Rating */}
              <FilterSection title="Rating" grid last>
                {ratingOptions.map((r) => (
                  <CheckboxRow
                    key={r.value} label={r.label}
                    checked={selectedRating === r.value}
                    onChange={() => setSelectedRating(selectedRating === r.value ? '' : r.value)}
                    radioStyle
                  />
                ))}
              </FilterSection>
            </aside>

            {/* Listing cards */}
            <section>
              {isLoading ? (
                <div className="min-h-[420px] bg-white border border-border rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Loader2 size={32} className="text-primary animate-spin" />
                  <p className="text-muted-foreground text-[15px]">Loading stays…</p>
                </div>
              ) : apiError ? (
                <div className="min-h-[420px] bg-white border border-border rounded-2xl flex flex-col items-center justify-center text-center px-6">
                  <p className="text-red-600 font-semibold mb-3">{apiError}</p>
                  <button type="button" onClick={fetchListings} className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium">
                    Retry
                  </button>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="min-h-[420px] bg-white border border-border rounded-2xl flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <SearchIcon size={23} className="text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">No stays found</h2>
                  <p className="text-muted-foreground max-w-md mb-5">
                    Try changing your filters or searching for another location.
                  </p>
                  <button type="button" onClick={resetFilters} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium cursor-pointer">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
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

// ── Listing card ─────────────────────────────────────────────────────────────
function ListingCard({ listing }) {
  const coverPhoto = listing.coverPhoto || listing.photos?.[0] || null;
  const label = CATEGORY_LABELS[listing.category] ?? listing.category;
  const rating = listing.averageRating ?? 0;
  const reviewCount = listing.reviewCount ?? 0;

  return (
    <Link to={`/property/${listing.id}`} className="group min-w-0 block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-stone-100">
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
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/95 text-[12px] font-semibold uppercase shadow-sm">
          {label}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[17px] font-semibold leading-tight group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        {rating > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={15} className="fill-primary text-primary" />
            <span className="text-[14px] font-medium">{rating.toFixed(2)}</span>
            {reviewCount > 0 && (
              <span className="text-[14px] text-muted-foreground">({reviewCount})</span>
            )}
          </div>
        )}
      </div>

      <p className="text-[14px] text-muted-foreground mt-1">{listing.location}</p>

      <p className="text-[15px] font-semibold mt-2">
        ETB {listing.pricePerNight.toLocaleString()}
        <span className="font-normal text-muted-foreground"> / night</span>
      </p>
    </Link>
  );
}

// ── Filter helpers ────────────────────────────────────────────────────────────
const FilterSection = ({ title, children, last = false, grid = false }) => (
  <div className={last ? 'pt-7' : 'py-7 border-b border-border'}>
    <h3 className="font-medium text-[16px] mb-4">{title}</h3>
    <div className={grid ? 'grid grid-cols-2 gap-x-4 gap-y-3.5' : 'space-y-3'}>{children}</div>
  </div>
);

const CheckboxRow = ({ label, checked, onChange, radioStyle = false }) => (
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
