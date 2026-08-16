import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

const STEPS = [
  { key: 'property-type', label: 'Property type' },
  { key: 'location', label: 'Location' },
  { key: 'photos', label: 'Photos' },
  { key: 'description', label: 'Description' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'rooms', label: 'Rooms and capacity' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'availability', label: 'Availability' },
  { key: 'house-rules', label: 'House rules' },
  { key: 'preview', label: 'Preview and publish' },
];

const PROPERTY_TYPES = [
  'Apartments',
  'Villas',
  'Hotels',
  'Guesthouses',
  'Private rooms',
  'Unique stays',
];

const REGIONS = [
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'Tigray',
  'Sidama',
  'SNNPR',
  'Somali',
  'Afar',
  'Benishangul-Gumuz',
  'Gambela',
  'Harari',
  'Dire Dawa',
];

const CITIES = [
  'Addis Ababa',
  'Hawassa',
  'Bahir Dar',
  'Lalibela',
  'Dire Dawa',
  'Mekelle',
  'Adama',
  'Gondar',
  'Jimma',
  'Arba Minch',
];

const SUB_CITIES = [
  'Bole',
  'Yeka',
  'Kirkos',
  'Lideta',
  'Arada',
  'Addis Ketema',
  'Akaky Kaliti',
  'Kolfe Keranio',
  'Gulele',
  'Nifas Silk-Lafto',
  'Lemi Kura',
];

const AMENITIES = ['Wi-Fi', 'Kitchen', 'Free parking', 'Washer'];

const HOUSE_RULES = [
  'No parties or events',
  'No smoking indoors',
  'Pets allowed on request',
  'Quiet hours after 10 PM',
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const List = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    propertyType: '',
    streetAddress: '',
    city: '',
    subCity: '',
    region: '',
    idDocument: null,
    houseDeed: null,
    propertyPhotos: Array(6).fill(null),
    listingTitle: '',
    description: '',
    amenities: [],
    guests: 2,
    bedrooms: 2,
    bathrooms: 2,
    nightlyPrice: 4500,
    availabilityViewDate: new Date(),
    blockedDates: [],
    houseRules: [],
    customRules: [],
    newRuleText: '',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (STEPS[currentStep].key) {
      case 'property-type':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField('propertyType', type)}
                className={`px-6 py-5 rounded-xl border text-center text-[15px] font-medium transition-colors ${
                  formData.propertyType === type
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-foreground hover:border-primary/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[14px] font-medium text-foreground mb-1.5">
                Street address
              </label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => updateField('streetAddress', e.target.value)}
                placeholder="Cameroon St, Bole"
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground bg-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="" disabled>
                    Select city
                  </option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground bg-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="" disabled>
                    Select region
                  </option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  Sub-city
                </label>
                <select
                  value={formData.subCity}
                  onChange={(e) => updateField('subCity', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground bg-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="" disabled>
                    Select sub-city
                  </option>
                  {SUB_CITIES.map((subCity) => (
                    <option key={subCity} value={subCity}>
                      {subCity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-10">
            {/* Identity Verification */}
            <div>
              <h3 className="text-[16px] font-semibold text-foreground mb-1">
                ID or passport
              </h3>
              <p className="text-[14px] text-muted-foreground mb-4">
                Upload a valid ID or passport to verify your identity as a host.
              </p>
              <label className="block w-full sm:w-[280px] aspect-[4/3] rounded-xl border border-dashed border-border bg-[oklch(0.98_0.005_96)] hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => updateField('idDocument', e.target.files?.[0] || null)}
                />
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImagePlus size={22} strokeWidth={1.5} className="mb-2" />
                  <span className="text-[14px]">
                    {formData.idDocument ? formData.idDocument.name : 'Add ID or passport'}
                  </span>
                </div>
              </label>
            </div>

            {/* House Deed */}
            <div>
              <h3 className="text-[16px] font-semibold text-foreground mb-1">
                House deed
              </h3>
              <p className="text-[14px] text-muted-foreground mb-4">
                Upload proof of ownership or the right to rent this property.
              </p>
              <label className="block w-full sm:w-[280px] aspect-[4/3] rounded-xl border border-dashed border-border bg-[oklch(0.98_0.005_96)] hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => updateField('houseDeed', e.target.files?.[0] || null)}
                />
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImagePlus size={22} strokeWidth={1.5} className="mb-2" />
                  <span className="text-[14px]">
                    {formData.houseDeed ? formData.houseDeed.name : 'Add house deed'}
                  </span>
                </div>
              </label>
            </div>

            {/* Property Photos */}
            <div>
              <h3 className="text-[16px] font-semibold text-foreground mb-1">
                Property photos
              </h3>
              <p className="text-[14px] text-muted-foreground mb-4">
                Add at least 6 photos so guests can see what your place looks like.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.propertyPhotos.map((photo, index) => (
                  <label
                    key={index}
                    className="aspect-square rounded-xl border border-dashed border-border bg-[oklch(0.98_0.005_96)] hover:border-primary transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData((prev) => {
                          const updated = [...prev.propertyPhotos];
                          updated[index] = file;
                          return { ...prev, propertyPhotos: updated };
                        });
                      }}
                    />
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImagePlus size={22} strokeWidth={1.5} className="mb-2" />
                      <span className="text-[14px]">
                        {photo ? photo.name : 'Add photo'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'description':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[16px] font-semibold text-foreground mb-2">
                Listing title
              </label>
              <input
                type="text"
                value={formData.listingTitle}
                onChange={(e) => updateField('listingTitle', e.target.value)}
                placeholder="Bright loft with skyline views"
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[16px] font-semibold text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the space, the neighbourhood and what makes it special."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-y"
              />
            </div>
          </div>
        );

      case 'amenities':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AMENITIES.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      amenities: isSelected
                        ? prev.amenities.filter((a) => a !== amenity)
                        : [...prev.amenities, amenity],
                    }));
                  }}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-left text-[15px] font-medium transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </span>
                  {amenity}
                </button>
              );
            })}
          </div>
        );

      case 'rooms':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-semibold text-foreground mb-2">
                Guests
              </label>
              <input
                type="number"
                min={1}
                value={formData.guests}
                onChange={(e) => updateField('guests', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[16px] font-semibold text-foreground mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                min={0}
                value={formData.bedrooms}
                onChange={(e) => updateField('bedrooms', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[16px] font-semibold text-foreground mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                min={0}
                value={formData.bathrooms}
                onChange={(e) => updateField('bathrooms', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div>
            <label className="block text-[16px] font-semibold text-foreground mb-2">
              Nightly price (ETB)
            </label>
            <input
              type="number"
              min={0}
              value={formData.nightlyPrice}
              onChange={(e) => updateField('nightlyPrice', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors mb-3"
            />
            <p className="text-[14px] text-muted-foreground">
              Guests will see ETB {Number(formData.nightlyPrice || 0).toLocaleString()} per night before fees. Similar villas nearby charge ETB {Math.round(Number(formData.nightlyPrice || 0) * 0.9).toLocaleString()}–ETB {Math.round(Number(formData.nightlyPrice || 0) * 1.25).toLocaleString()}.
            </p>
          </div>
        );

      case 'availability': {
        const today = new Date();
        const viewDate = formData.availabilityViewDate;
        const setViewDate = (d) => updateField('availabilityViewDate', d);
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

        const isBlocked = (date) =>
          formData.blockedDates.some((b) => new Date(b).toDateString() === date.toDateString());

        const isPast = (date) => date < new Date(today.toDateString());

        const toggleDate = (date) => {
          if (isPast(date)) return;
          const iso = date.toDateString();
          setFormData((prev) => {
            const exists = prev.blockedDates.some((b) => new Date(b).toDateString() === iso);
            return {
              ...prev,
              blockedDates: exists
                ? prev.blockedDates.filter((b) => new Date(b).toDateString() !== iso)
                : [...prev.blockedDates, date.toISOString()],
            };
          });
        };

        return (
          <div>
            <div className="w-full sm:w-[400px]">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-[16px] font-semibold text-foreground">
                  {MONTHS[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[12px] font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {cells.map((date, i) =>
                  date ? (
                    <button
                      key={i}
                      type="button"
                      disabled={isPast(date)}
                      onClick={() => toggleDate(date)}
                      className={`w-10 h-10 text-[14px] rounded-full flex items-center justify-center mx-auto transition-colors ${
                        isBlocked(date)
                          ? 'bg-primary/10 text-primary line-through'
                          : isPast(date)
                          ? 'text-muted-foreground/30 cursor-not-allowed'
                          : date.toDateString() === today.toDateString()
                          ? 'bg-primary/5 text-primary font-semibold'
                          : 'hover:bg-gray-100 text-foreground'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <div key={i} />
                  )
                )}
              </div>
            </div>

            <p className="text-[13px] text-muted-foreground mt-4">
              Click a date to block it. Blocked dates won't be available for booking.
            </p>
          </div>
        );
      }

      case 'house-rules':
        return (
          <div className="space-y-3">
            {HOUSE_RULES.map((rule) => {
              const isSelected = formData.houseRules.includes(rule);
              return (
                <button
                  key={rule}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      houseRules: isSelected
                        ? prev.houseRules.filter((r) => r !== rule)
                        : [...prev.houseRules, rule],
                    }));
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-border text-left text-[15px] text-foreground hover:border-primary/50 transition-colors"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                    }`}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </span>
                  {rule}
                </button>
              );
            })}

            {formData.customRules.map((rule, index) => (
              <div
                key={index}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-primary/30 bg-primary/5 text-left text-[15px] text-foreground"
              >
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="flex-1">{rule}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      customRules: prev.customRules.filter((_, i) => i !== index),
                    }));
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <input
                type="text"
                value={formData.newRuleText}
                onChange={(e) => updateField('newRuleText', e.target.value)}
                placeholder="Add your own house rule"
                className="flex-1 px-4 py-3 rounded-lg border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  if (!formData.newRuleText.trim()) return;
                  setFormData((prev) => ({
                    ...prev,
                    customRules: [...prev.customRules, prev.newRuleText.trim()],
                    newRuleText: '',
                  }));
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5 transition-colors flex-shrink-0"
              >
                <Plus size={18} />
                Add rule
              </button>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Check size={24} className="text-primary" strokeWidth={3} />
            </div>
            <h3 className="text-[22px] font-bold font-serif text-foreground mb-3">
              Ready to publish
            </h3>
            <p className="text-[15px] text-muted-foreground max-w-md mb-8">
              Your {formData.propertyType.toLowerCase() || 'property'} listing at ETB{' '}
              {Number(formData.nightlyPrice || 0).toLocaleString()} per night is complete.
              You can edit anything later from your host dashboard.
            </p>
            <button
              type="button"
              onClick={() => {
                // handle publish submission here
                console.log('Publishing listing', formData);
                navigate('/Host/Host_dashboard');
              }}
              className="bg-primary hover:opacity-90 text-primary-foreground px-8 py-3.5 rounded-lg text-[15px] font-semibold transition-opacity"
            >
              Publish listing
            </button>
          </div>
        );

      default:
        return (
          <div className="py-16 text-center text-muted-foreground text-[15px]">
            Let me know what needs to go in this step and I'll build it.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main hosting wizard */}
      <section className="w-full px-6 pt-14 pb-20">
        <div className="w-full max-w-[990px] mx-auto">

          {/* Step counter */}
          <p className="text-[11px] font-semibold text-primary tracking-[0.15em] mb-2 uppercase">
            Step {currentStep + 1} of {STEPS.length}
          </p>

          {/* Step title */}
          <h1 className="text-3xl md:text-[36px] font-bold font-serif text-foreground mb-6">
            {STEPS[currentStep].label}
          </h1>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-primary/20 rounded-full mb-5 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step navigation */}
          <div
            className="w-full flex items-center gap-2 mb-11 overflow-x-auto pb-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground border border-primary'
                      : 'bg-white border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {isCompleted && <Check size={14} />}
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* Step content card */}
          <div className="w-full bg-white rounded-2xl border border-border p-8 sm:px-10 sm:py-10 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation buttons */}
          {STEPS[currentStep].key !== 'preview' && (
            <div className="w-full flex justify-between items-center">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-white text-foreground text-[15px] font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-lg text-[15px] font-semibold transition-opacity"
              >
                Next
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Preview navigation */}
          {STEPS[currentStep].key === 'preview' && (
            <div className="w-full flex justify-start">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-white text-foreground text-[15px] font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default List;