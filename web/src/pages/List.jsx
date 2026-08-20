import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Plus,
  X,
  AlertCircle,
  Upload,
  FileText,
  Trash2,
  Calendar as CalendarIcon,
  ShieldCheck,
  Sparkles,
  Minus,
} from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import Footer from '../components/Footer';
import Calendar from '../components/Calendar';
import { useAuth } from '../context/AuthContext';

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
  { key: 'bank-details', label: 'Bank details' },
  { key: 'preview', label: 'Terms & Publish' },
];

const PROPERTY_TYPES = [
  'Apartments',
  'Villas',
  'Hotels',
  'Guesthouses',
  'Private rooms',
  'Unique stays',
];

const CITY_SUBCITIES = {
  'Addis Ababa': [
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
  ],
  'Hawassa': [
    'Tabor',
    'Menehariya',
    'Mehal Ketema',
    'Bahil Adarash',
    'Hayk Dar',
    'Misrak',
  ],
  'Bahir Dar': [
    'Belay Zeleke',
    'Gish Abay',
    'Tana Lakeside',
    'Fasilo',
    'Shimbit',
    'Ginbot 20',
  ],
  'Lalibela': [
    'Old Town',
    'Lasta Central',
    'Rohas',
    'Asheton Heights',
  ],
  'Dire Dawa': [
    'Kezira',
    'Megala',
    'Gende Kore',
    'Sabian',
    'Shinile',
  ],
  'Bishoftu': [
    'Bishoftu Central',
    'Lake Babogaya',
    'Kuriftu',
    'Lake Hora',
  ],
  'Adama': [
    'Bole',
    'Dembi',
    'Daka',
    'Posta',
    'Geda',
  ],
  'Gondar': [
    'Fasil Ghebbi Area',
    'Azezo',
    'Maraki',
    'Arada',
  ],
  'Mekelle': [
    'Hawelti',
    'Hadnet',
    'Ayder',
    'Semien',
  ],
  'Arba Minch': [
    'Nechisar Area',
    'Sikela',
    'Shecha',
  ],
};

const CITIES = Object.keys(CITY_SUBCITIES);

// Removed 'Air conditioning' and 'Dedicated workspace' as requested
const AMENITIES = [
  'Wi-Fi',
  'Kitchen',
  'Free parking',
  'Washer',
  'Backup generator / Solar',
  'Security cameras',
  'Hot water shower',
  'Balcony with view',
];

const HOUSE_RULES = [
  'No parties or loud events',
  'No smoking indoors',
  'Pets not allowed',
];

const List = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState('');

  // Which action a calendar tap performs on the Availability step:
  // 'available' marks a date as confirmed-available, 'blocked' blocks it.
  const [availabilityMode, setAvailabilityMode] = useState('available');

  const [formData, setFormData] = useState({
    propertyType: '',
    streetAddress: '',
    city: '',
    subCity: '',
    idDocument: null,
    houseDeed: null,
    propertyPhotos: [],
    listingTitle: '',
    description: '',
    amenities: [],
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    kitchenType: 'Full private kitchen',
    nightlyPrice: 4500,
    minNights: 1,
    instantBook: true,
    blockedDates: [],
    markedAvailableDates: [],
    houseRules: [],
    customRules: [],
    newRuleText: '',
    regulationsFile: null,
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    agreedToTerms: false,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStepError('');
  };

  // Validate step before advancing
  const validateStep = (stepIndex) => {
    const key = STEPS[stepIndex].key;
    if (key === 'property-type') {
      if (!formData.propertyType) {
        setStepError('Please choose a property type to proceed.');
        return false;
      }
    } else if (key === 'location') {
      if (!formData.streetAddress.trim()) {
        setStepError('Please provide a street address or neighborhood.');
        return false;
      }
      if (!formData.city) {
        setStepError('Please select a city.');
        return false;
      }
      if (!formData.subCity || formData.subCity.trim() === '') {
        setStepError('Please select a sub-city.');
        return false;
      }
    } else if (key === 'photos') {
      if (formData.propertyPhotos.length === 0) {
        setStepError('Please upload at least 1 property photo so guests can preview your place.');
        return false;
      }
      if (!formData.idDocument) {
        setStepError('Please upload your National ID or Passport (Required).');
        return false;
      }
      if (!formData.houseDeed) {
        setStepError('Please upload your House Deed or Rental Agreement (Required).');
        return false;
      }
    } else if (key === 'description') {
      if (!formData.listingTitle.trim() || formData.listingTitle.length < 5) {
        setStepError('Please provide a listing title (at least 5 characters).');
        return false;
      }
      if (!formData.description.trim() || formData.description.length < 15) {
        setStepError('Please write a short description of your place (at least 15 characters).');
        return false;
      }
    } else if (key === 'amenities') {
      if (formData.amenities.length === 0) {
        setStepError('Please select at least one amenity.');
        return false;
      }
    } else if (key === 'rooms') {
      if (formData.guests < 1 || formData.beds < 1) {
        setStepError('Please specify guest and bed counts.');
        return false;
      }
    } else if (key === 'pricing') {
      if (!formData.nightlyPrice || Number(formData.nightlyPrice) < 200) {
        setStepError('Please set a nightly rate of at least ETB 200.');
        return false;
      }
    } else if (key === 'house-rules') {
      if (formData.houseRules.length === 0 && formData.customRules.length === 0) {
        setStepError('Please select or add at least one house rule.');
        return false;
      }
    } else if (key === 'bank-details') {
      if (!formData.bankName.trim()) {
        setStepError('Please select your bank name.');
        return false;
      }
      if (!formData.accountHolderName.trim()) {
        setStepError('Please enter the account holder name.');
        return false;
      }
      if (!formData.accountNumber.trim() || formData.accountNumber.trim().length < 6) {
        setStepError(
          formData.bankName === 'Telebirr'
            ? 'Please enter a valid phone number (at least 6 digits).'
            : 'Please enter a valid account number (at least 6 digits).'
        );
        return false;
      }
    }

    setStepError('');
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    setStepError('');
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (index) => {
    if (index > currentStep) {
      // Jumping ahead via the pill nav must not skip validation on the
      // steps in between — check each one, and stop at the first that
      // isn't complete instead of jumping straight to the target.
      for (let i = currentStep; i < index; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }
    setStepError('');
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          propertyPhotos: [
            ...prev.propertyPhotos,
            { file, preview: event.target.result, name: file.name },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
    setStepError('');
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      propertyPhotos: prev.propertyPhotos.filter((_, i) => i !== index),
    }));
  };

  // Handle Publish Listing
  const handlePublishListing = () => {
    if (!formData.agreedToTerms) {
      setStepError('You must read and agree to the Ethio-Airbnb Terms & Conditions to publish.');
      return;
    }

    const newListing = {
      id: 'prop_' + Date.now(),
      title: formData.listingTitle || `${formData.propertyType} in ${formData.subCity}`,
      name: formData.listingTitle || `${formData.propertyType} in ${formData.subCity}`,
      type: formData.propertyType,
      city: formData.city,
      subCity: formData.subCity,
      location: `${formData.subCity}, ${formData.city}`,
      address: formData.streetAddress,
      price: Number(formData.nightlyPrice),
      pricePerNight: Number(formData.nightlyPrice),
      nightlyPrice: Number(formData.nightlyPrice),
      guests: formData.guests,
      bedrooms: formData.bedrooms,
      beds: formData.beds,
      bathrooms: formData.bathrooms,
      amenities: formData.amenities,
      houseRules: [...formData.houseRules, ...formData.customRules],
      blockedDates: formData.blockedDates,
      rating: 5.0,
      reviews: 0,
      createdAt: new Date().toISOString(),
      image: formData.propertyPhotos[0]?.preview || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      bankDetails: {
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
      },
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hostListings') || '[]');
      existing.unshift(newListing);
      localStorage.setItem('hostListings', JSON.stringify(existing));
      localStorage.setItem('properties', JSON.stringify(existing));
    } catch {
      // ignore
    }

    navigate('/host/Host_dashboard');
  };

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;
  const currentSubcities = formData.city ? (CITY_SUBCITIES[formData.city] || []) : [];

  const renderStepContent = () => {
    switch (STEPS[currentStep].key) {
      case 'property-type':
        return (
          <div>
            <p className="text-[14px] text-muted-foreground mb-6">
              Select which category best describes the accommodation you're providing to guests.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField('propertyType', type)}
                  className={`px-6 py-6 rounded-2xl border text-center text-[16px] font-semibold transition-all ${
                    formData.propertyType === type
                      ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20'
                      : 'border-border text-foreground hover:border-primary/50 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">
              Guests will only receive your exact address once their booking is confirmed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* City */}
              <div>
                <label className="block text-[14px] font-semibold text-foreground mb-1.5">
                  City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    updateField('city', newCity);
                    updateField('subCity', '');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground bg-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select a city
                  </option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-city */}
              <div>
                <label className="block text-[14px] font-semibold text-foreground mb-1.5">
                  Sub-city {formData.city && `in ${formData.city}`}
                </label>
                <select
                  value={formData.subCity}
                  onChange={(e) => updateField('subCity', e.target.value)}
                  disabled={!formData.city}
                  className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground bg-white focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {formData.city ? `Select sub-city in ${formData.city}` : 'Select a city first'}
                  </option>
                  {currentSubcities.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-[14px] font-semibold text-foreground mb-1.5">
                Street address & specific location details
              </label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => updateField('streetAddress', e.target.value)}
                placeholder="e.g. Near Edna Mall, Cameroon Street, House 412"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[16px] font-bold text-foreground">
                  Property photos
                </h3>
                <span className="text-[13px] font-medium text-primary">
                  {formData.propertyPhotos.length} photo{formData.propertyPhotos.length === 1 ? '' : 's'} added
                </span>
              </div>
              <p className="text-[14px] text-muted-foreground mb-4">
                Add photos showing the bedroom, living room, bathroom, and kitchen.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <label className="aspect-square rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer flex flex-col items-center justify-center text-primary group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ImagePlus size={20} className="text-primary" />
                  </div>
                  <span className="text-[13px] font-bold">Add photos</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Click to browse</span>
                </label>

                {formData.propertyPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-sm">
                    <img
                      src={photo.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                        Cover Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[15px] font-bold text-foreground">
                    Host ID / Passport
                  </h4>
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                    Required
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground mb-3">
                  Required for host identity verification.
                </p>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateField('idDocument', file);
                    }}
                  />
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Upload size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">
                      {formData.idDocument ? formData.idDocument.name : 'Upload National ID / Passport'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">JPG, PNG or PDF</p>
                  </div>
                </label>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[15px] font-bold text-foreground">
                    House Deed or Rental Agreement
                  </h4>
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                    Required
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground mb-3">
                  Required proof of property ownership or tenancy.
                </p>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateField('houseDeed', file);
                    }}
                  />
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">
                      {formData.houseDeed ? formData.houseDeed.name : 'Upload Document'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">JPG, PNG or PDF</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'description':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[15px] font-bold text-foreground mb-2">
                Listing title
              </label>
              <input
                type="text"
                value={formData.listingTitle}
                onChange={(e) => updateField('listingTitle', e.target.value)}
                placeholder="e.g. Modern Bole Skyline Apartment with Balcony"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[15px] font-bold text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the space, neighborhood, and unique features."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-y"
              />
            </div>
          </div>
        );

      case 'amenities':
        return (
          <div>
            <p className="text-[14px] text-muted-foreground mb-6">
              Select all conveniences available for guests during their stay.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-left text-[15px] font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border text-foreground hover:border-primary/40'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-primary text-white' : 'border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">
              Define the capacity and sleeping arrangements for your guests.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Guests */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-gray-50/50">
                <div>
                  <p className="text-[15px] font-bold text-foreground">Guests capacity</p>
                  <p className="text-[12px] text-muted-foreground">Maximum guests allowed</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('guests', Math.max(1, formData.guests - 1))}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                    disabled={formData.guests <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[16px] font-bold w-6 text-center">{formData.guests}</span>
                  <button
                    type="button"
                    onClick={() => updateField('guests', formData.guests + 1)}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-gray-50/50">
                <div>
                  <p className="text-[15px] font-bold text-foreground">Bedrooms</p>
                  <p className="text-[12px] text-muted-foreground">Private bedroom count</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('bedrooms', Math.max(0, formData.bedrooms - 1))}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[16px] font-bold w-6 text-center">{formData.bedrooms}</span>
                  <button
                    type="button"
                    onClick={() => updateField('bedrooms', formData.bedrooms + 1)}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Beds */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-gray-50/50">
                <div>
                  <p className="text-[15px] font-bold text-foreground">Beds</p>
                  <p className="text-[12px] text-muted-foreground">Total sleeping beds</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('beds', Math.max(1, formData.beds - 1))}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                    disabled={formData.beds <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[16px] font-bold w-6 text-center">{formData.beds}</span>
                  <button
                    type="button"
                    onClick={() => updateField('beds', formData.beds + 1)}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-gray-50/50">
                <div>
                  <p className="text-[15px] font-bold text-foreground">Bathrooms</p>
                  <p className="text-[12px] text-muted-foreground">Private or shared</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('bathrooms', Math.max(1, formData.bathrooms - 1))}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                    disabled={formData.bathrooms <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[16px] font-bold w-6 text-center">{formData.bathrooms}</span>
                  <button
                    type="button"
                    onClick={() => updateField('bathrooms', formData.bathrooms + 1)}
                    className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

           
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[15px] font-bold text-foreground mb-2">
                Nightly rate (ETB)
              </label>
              <div className="relative max-w-sm">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary text-[16px]">
                  ETB
                </span>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={formData.nightlyPrice}
                  onChange={(e) => updateField('nightlyPrice', e.target.value)}
                  className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-border text-[20px] font-bold text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 'availability': {
        // A calendar tap always calls this. What it actually does — mark
        // the date available or block it — depends on availabilityMode,
        // so the host always knows the effect before they click.
        const toggleBlockedDate = (date) => {
          const iso = date.toDateString();
          setFormData((prev) => {
            if (availabilityMode === 'blocked') {
              const alreadyBlocked = prev.blockedDates.some((b) => new Date(b).toDateString() === iso);
              return {
                ...prev,
                blockedDates: alreadyBlocked ? prev.blockedDates : [...prev.blockedDates, date.toISOString()],
                markedAvailableDates: prev.markedAvailableDates.filter(
                  (b) => new Date(b).toDateString() !== iso
                ),
              };
            }

            // availabilityMode === 'available'
            const alreadyMarked = prev.markedAvailableDates.some((b) => new Date(b).toDateString() === iso);
            return {
              ...prev,
              blockedDates: prev.blockedDates.filter((b) => new Date(b).toDateString() !== iso),
              markedAvailableDates: alreadyMarked
                ? prev.markedAvailableDates
                : [...prev.markedAvailableDates, date.toISOString()],
            };
          });
        };

        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">
              Choose what you're marking, then tap dates on the calendar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
              <div className="p-3 bg-gray-50/80 rounded-2xl border border-border flex flex-col items-center">
                {/* Mode switcher — makes it explicit what a tap will do */}
                <div className="w-[245px] flex items-center bg-gray-100 rounded-xl p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setAvailabilityMode('available')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                      availabilityMode === 'available'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        availabilityMode === 'available' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    Mark Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityMode('blocked')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                      availabilityMode === 'blocked'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        availabilityMode === 'blocked' ? 'bg-primary' : 'bg-gray-400'
                      }`}
                    />
                    Mark Blocked
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground text-center mb-3 max-w-[220px]">
                  Tapping a date will mark it{' '}
                  {availabilityMode === 'available' ? (
                    <span className="font-semibold text-green-600">Available</span>
                  ) : (
                    <span className="font-semibold text-primary">Blocked</span>
                  )}{' '}
                  {availabilityMode === 'available'
                    ? 'for guests to book.'
                    : "— guests can't book it."}
                </p>

                <Calendar
                  blockedDates={formData.blockedDates}
                  markedAvailable={formData.markedAvailableDates}
                  onToggleDate={toggleBlockedDate}
                  compact={true}
                />
                <button
                  type="button"
                  onClick={() => updateField('blockedDates', [])}
                  className="mt-3 text-[12px] font-medium text-primary hover:underline"
                >
                  Clear all blocked dates
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
                  <div>
                    <p className="text-[14px] font-bold text-foreground">Instant Booking</p>
                    <p className="text-[12px] text-muted-foreground">Guests can book without prior manual approval</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.instantBook}
                    onChange={(e) => updateField('instantBook', e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-foreground mb-2">
                    Minimum night stay
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateField('minNights', n)}
                        className={`py-2 rounded-xl border text-[13px] font-semibold text-center transition-colors ${
                          formData.minNights === n
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-foreground hover:border-primary/40'
                        }`}
                      >
                        {n} {n === 1 ? 'night' : 'nights'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'house-rules':
        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">
              Select ground rules for guests during their stay.
            </p>

            <div className="space-y-2.5">
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
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border text-left text-[14px] transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground font-semibold'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'border border-gray-300'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                    {rule}
                  </button>
                );
              })}
            </div>

            {formData.customRules.length > 0 && (
              <div className="space-y-2 pt-2">
                {formData.customRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[14px]"
                  >
                    <span className="font-medium text-foreground">{rule}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          customRules: prev.customRules.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={formData.newRuleText}
                onChange={(e) => updateField('newRuleText', e.target.value)}
                placeholder="Add custom rule"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-[14px] focus:outline-none focus:border-primary"
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
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-[#c82333]"
              >
                Add
              </button>
            </div>
          </div>
        );

      case 'bank-details': {
        const isTelebirr = formData.bankName === 'Telebirr';
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[13px]">
              <ShieldCheck size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold mb-0.5">Payout information — kept private</p>
                <p className="text-amber-700">
                  Your bank details are only visible to Ethio-Airbnb admins and are used exclusively to transfer your earnings after guests check out. They will never be shared with guests.
                </p>
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-[14px] font-bold text-foreground mb-1.5">
                Bank name
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => updateField('bankName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground bg-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="" disabled>Select your bank</option>
                {[
                  'Commercial Bank of Ethiopia (CBE)',
                  'Awash Bank',
                  'Dashen Bank',
                  'Abyssinia Bank',
                  'Nib International Bank',
                  'Wegagen Bank',
                  'United Bank',
                  'Cooperative Bank of Oromia',
                  'Berhan Bank',
                  'Amhara Bank',
                  'Telebirr',
                  'M-Pesa Ethiopia',
                ].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-[14px] font-bold text-foreground mb-1.5">
                Account holder full name
              </label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => updateField('accountHolderName', e.target.value)}
                placeholder="e.g. Abebe Kebede"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Account Number / Phone Number */}
            <div>
              <label className="block text-[14px] font-bold text-foreground mb-1.5">
                {isTelebirr ? 'Phone number' : 'Account number'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.accountNumber}
                onChange={(e) => updateField('accountNumber', e.target.value.replace(/\D/g, ''))}
                placeholder={isTelebirr ? 'e.g. 0912345678' : 'e.g. 1000123456789'}
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors tracking-wider"
              />
            </div>
          </div>
        );
      }

      case 'preview':
        return (
          <div className="py-2 space-y-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
                <Sparkles size={24} />
              </div>
              <h3 className="text-[24px] font-serif font-bold text-foreground">
                Terms & Conditions Agreement
              </h3>
              <p className="text-[13px] text-muted-foreground max-w-lg">
                Please review the Ethio-Airbnb platform terms & regulations below before publishing your listing.
              </p>
            </div>

            {/* Listing Summary Box */}
            <div className="bg-gray-50/80 border border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Property</span>
                <p className="text-[15px] font-bold text-foreground">{formData.listingTitle || 'Untitled Property'}</p>
                <p className="text-[13px] text-muted-foreground">{formData.propertyType} in {formData.subCity}, {formData.city}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Nightly Rate</span>
                <p className="text-[16px] font-bold text-primary">ETB {Number(formData.nightlyPrice).toLocaleString()} / night</p>
                <p className="text-[13px] text-muted-foreground">{formData.guests} guests · {formData.bedrooms} bedrooms · {formData.bathrooms} baths</p>
              </div>
            </div>

            {/* Complete Ethio-Airbnb Terms & Conditions Document Box */}
            <div className="border border-border rounded-2xl p-6 bg-white max-h-[380px] overflow-y-auto space-y-4 text-[13px] leading-relaxed text-gray-700 shadow-inner">
              <div className="border-b border-border pb-3">
                <h4 className="text-[16px] font-bold text-gray-900 font-serif">
                  Ethio-Airbnb — Terms & Conditions
                </h4>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  <strong>Last updated:</strong> August 2026 · <strong>Version:</strong> 1.1
                </p>
                <p className="text-[12px] text-gray-600 mt-2 italic">
                  This document applies to everyone using Ethio-Airbnb — whether you're listing a property as a <strong>Host</strong> or booking a stay as a <strong>Guest</strong>. Both parties read and agree to the same terms, so each side knows exactly what the other has committed to.
                </p>
              </div>

              {/* 1. Overview */}
              <div>
                <h5 className="font-bold text-gray-900 text-[14px] mb-1">1. Overview</h5>
                <p>
                  Ethio-Airbnb is a platform that connects Hosts who want to rent out properties with Guests looking for short-term accommodation. Ethio-Airbnb does not own, manage, or inspect any listed property — we provide the platform that connects both parties and facilitates payment verification between them.
                </p>
                <p className="mt-1">
                  By creating an account, listing a property, or making a booking, you agree to the terms below.
                </p>
              </div>

              {/* 2. Host Responsibilities & Rights */}
              <div>
                <h5 className="font-bold text-gray-900 text-[14px] mb-1">2. Host Responsibilities & Rights</h5>
                <p className="font-semibold text-gray-800">As a Host, you agree to:</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Provide accurate, honest information about your property (location, price, description, photos)</li>
                  <li>Honor confirmed bookings — cancelling a confirmed booking without a valid reason may result in account restrictions</li>
                  <li>Respond to booking requests and guest communication in a timely manner</li>
                  <li>Keep your listing up to date, including marking it inactive if it's no longer available</li>
                </ul>

                <p className="font-semibold text-gray-800 mt-2">As a Host, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Set your own price per night</li>
                  <li>Edit or remove your listing at any time</li>
                  <li>Receive payout for completed, verified bookings (see Section 4)</li>
                  <li>Report a Guest for violating these terms</li>
                </ul>
              </div>

              {/* 3. Guest Responsibilities & Rights */}
              <div>
                <h5 className="font-bold text-gray-900 text-[14px] mb-1">3. Guest Responsibilities & Rights</h5>
                <p className="font-semibold text-gray-800">As a Guest, you agree to:</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Provide accurate payment proof for any booking you make</li>
                  <li>Respect the property and any rules set by the Host during your stay</li>
                  <li>Complete payment within the required timeframe for a booking to remain valid</li>
                  <li>Not attempt to submit fraudulent or falsified payment proof</li>
                </ul>

                <p className="font-semibold text-gray-800 mt-2">As a Guest, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Cancel a booking within the 24-hour hold window for a full refund (see Section 4)</li>
                  <li>Expect the property to reasonably match its listing description</li>
                  <li>Leave a review after a completed stay</li>
                  <li>Report a Host for violating these terms</li>
                </ul>
              </div>

              {/* 4. Payments & Cancellations */}
              <div>
                <h5 className="font-bold text-gray-900 text-[14px] mb-1">4. Payments & Cancellations</h5>
                <p>Ethio-Airbnb uses a manual, verified payment process:</p>
                <ol className="list-decimal pl-5 space-y-1 mt-1">
                  <li>When you confirm a booking, you'll be shown the platform's payment account details, the exact amount due, and a unique reference code for that booking.</li>
                  <li>After transferring payment externally, you upload proof (a screenshot or transaction reference).</li>
                  <li>Your booking status becomes <strong>Awaiting Confirmation</strong> while an admin reviews your payment proof — this review typically happens within about an hour.</li>
                  <li>Once approved, your booking becomes <strong>Confirmed</strong>, and a <strong>24-hour cancellation window</strong> begins. This is the only point at which cancellation is possible:
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      <li><strong>If you cancel within this 24-hour window</strong>, this is a normal, legal option — the platform is still holding your payment and has not yet paid the Host, so you receive a full refund.</li>
                      <li><strong>Once the 24-hour window closes, the booking can no longer be cancelled.</strong> At that point the booking becomes eligible for Host payout, and the platform transfers the Host's share (rental price minus platform commission) directly, logging proof of that transfer the same way your payment was logged.</li>
                    </ul>
                  </li>
                </ol>
                <p className="mt-2">
                  Every payment and payout is logged with a reference number, timestamp, amount, and the admin who verified it — creating a full record for both parties in case of a dispute.
                </p>
              </div>

              {/* 5. Prohibited Conduct */}
              <div>
                <h5 className="font-bold text-gray-900 text-[14px] mb-1">5. Prohibited Conduct</h5>
                <p>The following are not allowed on Ethio-Airbnb, by either Hosts or Guests:</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>Creating fake listings or fake bookings</li>
                  <li>Submitting falsified or altered payment proof</li>
                  <li>Harassment, discrimination, or abusive communication toward another user</li>
                  <li>Attempting to bypass the platform's payment and verification process</li>
                  <li>Misrepresenting your identity or the property being listed</li>
                </ul>
                <p className="mt-1">
                  Violations may result in booking cancellation, listing removal, or account suspension.
                </p>
              </div>

              {/* 6. Platform's Role & Liability */}
              <div>
                <h5 className="font-bold text-gray-900 text-[14px] mb-1">6. Platform's Role & Liability</h5>
                <p>Ethio-Airbnb facilitates connections and payment verification between Hosts and Guests but is not responsible for:</p>
                <ul className="list-disc pl-5 space-y-0.5 mt-1">
                  <li>The condition, safety, or legality of any listed property</li>
                  <li>Disputes about a Guest's conduct during a stay, beyond what is covered by this agreement</li>
                  <li>Delays caused by incorrect payment details or unclear payment proof submitted by a user</li>
                </ul>
                <p className="mt-1">
                  Ethio-Airbnb will act in good faith to review disputes and payment issues fairly, using the transaction records described in Section 4.
                </p>
              </div>

              {/* 7. Agreement Acknowledgment */}
              <div className="pt-2 border-t border-border">
                <h5 className="font-bold text-gray-900 text-[14px] mb-1">7. Agreement Acknowledgment</h5>
                <p>
                  By clicking <strong>"I Agree"</strong>, you confirm that you have read and understood this document, and agree to the responsibilities and rights described above for your role (Host or Guest) on Ethio-Airbnb.
                </p>
              </div>
            </div>

            {/* Mandatory Checkbox */}
            <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer flex-shrink-0"
              />
              <span className="text-[14px] font-semibold text-foreground">
                I have read and agree to the Ethio-Airbnb Terms & Conditions (Version 1.1).
              </span>
            </label>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handlePublishListing}
                disabled={!formData.agreedToTerms}
                className="bg-primary hover:bg-[#c82333] text-white px-10 py-4 rounded-xl text-[16px] font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                I Agree & Publish Listing
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavBar1 />

      <section className="w-full px-6 pt-28 pb-20">
        <div className="w-full max-w-[1000px] mx-auto">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-primary tracking-[0.2em] uppercase">
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <span className="text-[12px] font-semibold text-muted-foreground">
              {Math.round(progressPercent)}% completed
            </span>
          </div>

          {/* Step title */}
          <h1 className="text-3xl md:text-[38px] font-bold font-serif text-foreground mb-4">
            {STEPS[currentStep].label}
          </h1>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-primary/15 rounded-full mb-6 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step pills navigation */}
          <div
            className="w-full flex items-center gap-2 mb-8 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-sm'
                      : isCompleted
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {isCompleted && <Check size={14} strokeWidth={3} />}
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* Inline Error Toast */}
          {stepError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[14px] flex items-center gap-3 animate-in fade-in">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {/* Step content card */}
          <div className="w-full bg-white rounded-3xl border border-border p-6 sm:p-10 mb-8 shadow-sm">
            {renderStepContent()}
          </div>

          {/* Navigation buttons */}
          {STEPS[currentStep].key !== 'preview' && (
            <div className="w-full flex justify-between items-center">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-foreground text-[14px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 bg-primary hover:bg-[#c82333] text-white px-7 py-3 rounded-xl text-[14px] font-bold shadow-md hover:shadow-lg transition-all"
              >
                Next step
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Preview Back */}
          {STEPS[currentStep].key === 'preview' && (
            <div className="w-full flex justify-start">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-foreground text-[14px] font-semibold hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to edit
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