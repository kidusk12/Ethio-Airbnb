import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Search as SearchIcon,
  Star,
} from 'lucide-react';

import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import Search from '../components/Search';
import { allProperties } from '../data/properties';

const Explore = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(2);
  const [sortBy, setSortBy] = useState('Recommended');

  const [selectedType, setSelectedType] = useState('');
  const [selectedBathroom, setSelectedBathroom] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRating, setSelectedRating] = useState('');

  // Price range up to 10,000 ETB
  const [priceRange, setPriceRange] = useState([500, 10000]);

  const handleSearch = (searchData) => {
    setLocation(searchData.location || '');
    if (searchData.guests) setGuests(searchData.guests);
  };

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
    'Free parking on premises',
    'Private pool',
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

  const filteredProperties = useMemo(() => {
    let result = allProperties.filter((property) => {
      const matchesLocation =
        !location.trim() ||
        `${property.name} ${property.location}`
          .toLowerCase()
          .includes(location.trim().toLowerCase());

      const matchesType =
        !selectedType || property.type.toLowerCase().includes(selectedType.toLowerCase());

      const matchesBathroom =
        !selectedBathroom ||
        (selectedBathroom === '4+'
          ? property.bathrooms >= 4
          : property.bathrooms === Number(selectedBathroom));

      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) =>
          property.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
        );

      const matchesRating =
        !selectedRating || property.rating >= Number(selectedRating);

      const matchesPrice =
        property.price >= priceRange[0] &&
        property.price <= priceRange[1];

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
    setPriceRange([500, 10000]);
    setLocation('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Search area */}
      <section className="border-b border-border bg-white px-6 pt-24 pb-6">
        <div className="max-w-[1540px] mx-auto">
          <Search variant="explore" onSearch={handleSearch} />
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
                  className="text-primary text-[13px] font-medium hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              {/* Price Range */}
              <div className="pb-7 border-b border-border">
                <h3 className="font-medium text-[16px] mb-4">
                  Price range (per night)
                </h3>

                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(event) =>
                    setPriceRange([priceRange[0], Number(event.target.value)])
                  }
                  className="w-full accent-primary cursor-pointer"
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
              <FilterSection title="Bathrooms" grid>
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
              <FilterSection title="Amenities" grid>
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
              <FilterSection title="Rating" grid last>
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
                    <SearchIcon size={23} className="text-primary" />
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
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium cursor-pointer"
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
                      className="group min-w-0 block"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-stone-100">
                        <img
                          src={property.image}
                          alt={`${property.name} in ${property.location}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/95 text-[12px] font-semibold uppercase shadow-sm">
                          {property.type}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[17px] font-semibold leading-tight group-hover:text-primary transition-colors">
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

const FilterSection = ({ title, children, last = false, grid = false }) => (
  <div className={last ? 'pt-7' : 'py-7 border-b border-border'}>
    <h3 className="font-medium text-[16px] mb-4">{title}</h3>
    <div className={grid ? 'grid grid-cols-2 gap-x-4 gap-y-3.5' : 'space-y-3'}>{children}</div>
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