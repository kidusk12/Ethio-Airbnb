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
  ShieldCheck,
  Sparkles,
  Minus,
  Loader2,
} from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import Footer from '../components/Footer';
import Calendar from '../components/Calendar';
import { useAuth } from '../context/AuthContext';
import { uploadFile, createListing } from '../lib/api';
// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'property-type', label: 'Property type' },
  { key: 'location',      label: 'Location' },
  { key: 'photos',        label: 'Photos' },
  { key: 'description',  label: 'Description' },
  { key: 'amenities',    label: 'Amenities' },
  { key: 'rooms',        label: 'Rooms and capacity' },
  { key: 'pricing',      label: 'Pricing' },
  { key: 'availability', label: 'Availability' },
  { key: 'house-rules',  label: 'House rules' },
  { key: 'bank-details', label: 'Bank details' },
  { key: 'preview',      label: 'Terms & Publish' },
];

// Frontend label → backend category slug
const PROPERTY_TYPE_MAP = {
  'Apartments':    'apartment',
  'Villas':        'villa',
  'Hotels':        'hotel',
  'Guesthouses':   'guesthouse',
  'Private rooms': 'private_room',
  'Unique stays':  'unique_stay',
};
const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_MAP);

// Standard amenities: frontend label → backend slug
const STANDARD_AMENITY_MAP = {
  'Wi-Fi':        'wifi',
  'Kitchen':      'kitchen',
  'Free parking': 'free_parking',
  'Washer':       'washer',
};
const STANDARD_AMENITIES = Object.keys(STANDARD_AMENITY_MAP);

const CITY_SUBCITIES = {
  'Addis Ababa': ['Bole','Yeka','Kirkos','Lideta','Arada','Addis Ketema','Akaky Kaliti','Kolfe Keranio','Gulele','Nifas Silk-Lafto','Lemi Kura'],
  'Hawassa':     ['Tabor','Menehariya','Mehal Ketema','Bahil Adarash','Hayk Dar','Misrak'],
  'Bahir Dar':   ['Belay Zeleke','Gish Abay','Tana Lakeside','Fasilo','Shimbit','Ginbot 20'],
  'Lalibela':    ['Old Town','Lasta Central','Rohas','Asheton Heights'],
  'Dire Dawa':   ['Kezira','Megala','Gende Kore','Sabian','Shinile'],
  'Bishoftu':    ['Bishoftu Central','Lake Babogaya','Kuriftu','Lake Hora'],
  'Adama':       ['Bole','Dembi','Daka','Posta','Geda'],
  'Gondar':      ['Fasil Ghebbi Area','Azezo','Maraki','Arada'],
  'Mekelle':     ['Hawelti','Hadnet','Ayder','Semien'],
  'Arba Minch':  ['Nechisar Area','Sikela','Shecha'],
};
const CITIES = Object.keys(CITY_SUBCITIES);

const PRESET_HOUSE_RULES = [
  'No parties or loud events',
  'No smoking indoors',
  'Pets not allowed',
];

// ── Component ─────────────────────────────────────────────────────────────────

const List = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityMode, setAvailabilityMode] = useState('available');

  const [formData, setFormData] = useState({
    propertyType:    '',
    streetAddress:   '',
    city:            '',
    subCity:         '',
    // File objects (before upload)
    idDocumentFile:  null,
    houseDeedFile:   null,
    propertyPhotos:  [],   // [{ file, preview, name }]
    // Uploaded URLs (after upload)
    idDocumentUrl:   '',
    houseDeedUrl:    '',
    photoUrls:       [],
    // Listing details
    listingTitle:    '',
    description:     '',
    // Amenities: standard checkboxes + custom text
    standardAmenities: [],   // subset of STANDARD_AMENITIES labels
    customAmenities:   [],   // free-form strings
    newCustomAmenity:  '',
    // Capacity
    guests:    2,
    bedrooms:  1,
    beds:      1,
    bathrooms: 1,
    // Pricing
    nightlyPrice: 4500,
    minNights:    1,
    instantBook:  true,
    // Availability
    blockedDates:         [],
    markedAvailableDates: [],
    // House rules
    houseRules:    [],
    customRules:   [],
    newRuleText:   '',
    // Bank (informational for host reference — not stored in backend)
    bankName:           '',
    accountHolderName:  '',
    accountNumber:      '',
    // Terms
    agreedToTerms: false,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStepError('');
  };

  // ── Step validation ────────────────────────────────────────────────────────

  const validateStep = (stepIndex) => {
    const key = STEPS[stepIndex].key;
    if (key === 'property-type') {
      if (!formData.propertyType) { setStepError('Please choose a property type.'); return false; }
    } else if (key === 'location') {
      if (!formData.streetAddress.trim()) { setStepError('Please provide a street address.'); return false; }
      if (!formData.city) { setStepError('Please select a city.'); return false; }
      if (!formData.subCity) { setStepError('Please select a sub-city.'); return false; }
    } else if (key === 'photos') {
      if (formData.propertyPhotos.length === 0) { setStepError('Please upload at least 1 property photo.'); return false; }
      if (!formData.idDocumentFile) { setStepError('Please upload your National ID or Passport.'); return false; }
      if (!formData.houseDeedFile)  { setStepError('Please upload your House Deed or Rental Agreement.'); return false; }
    } else if (key === 'description') {
      if (!formData.listingTitle.trim() || formData.listingTitle.length < 5) { setStepError('Please provide a listing title (at least 5 characters).'); return false; }
      if (!formData.description.trim() || formData.description.length < 15)  { setStepError('Please write a short description (at least 15 characters).'); return false; }
    } else if (key === 'amenities') {
      const total = formData.standardAmenities.length + formData.customAmenities.length;
      if (total === 0) { setStepError('Please select or add at least one amenity.'); return false; }
    } else if (key === 'rooms') {
      if (formData.guests < 1 || formData.beds < 1) { setStepError('Please specify guest and bed counts.'); return false; }
    } else if (key === 'pricing') {
      if (!formData.nightlyPrice || Number(formData.nightlyPrice) < 200) { setStepError('Please set a nightly rate of at least ETB 200.'); return false; }
    } else if (key === 'house-rules') {
      if (formData.houseRules.length === 0 && formData.customRules.length === 0) { setStepError('Please select or add at least one house rule.'); return false; }
    } else if (key === 'bank-details') {
      if (!formData.bankName.trim())         { setStepError('Please select your bank.'); return false; }
      if (!formData.accountHolderName.trim()) { setStepError('Please enter the account holder name.'); return false; }
      if (!formData.accountNumber.trim() || formData.accountNumber.trim().length < 6) {
        setStepError(formData.bankName === 'Telebirr' ? 'Please enter a valid phone number.' : 'Please enter a valid account number.'); return false;
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
      for (let i = currentStep; i < index; i++) {
        if (!validateStep(i)) { setCurrentStep(i); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      }
    }
    setStepError('');
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── File handling ──────────────────────────────────────────────────────────

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          propertyPhotos: [...prev.propertyPhotos, { file, preview: ev.target.result, name: file.name }],
        }));
      };
      reader.readAsDataURL(file);
    });
    setStepError('');
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({ ...prev, propertyPhotos: prev.propertyPhotos.filter((_, i) => i !== index) }));
  };

  // ── Publish: upload files then POST to API ─────────────────────────────────

  const handlePublishListing = async () => {
    if (!formData.agreedToTerms) {
      setStepError('You must agree to the Terms & Conditions to publish.');
      return;
    }
    if (!token) {
      setStepError('You must be logged in to publish a listing.');
      return;
    }

    setIsSubmitting(true);
    setStepError('');

    try {
      // 1. Upload ID document
      const idRes = await uploadFile(token, formData.idDocumentFile);
      if (idRes.status !== 201) throw new Error(idRes.body?.message || 'Failed to upload ID document.');
      const idDocumentUrl = idRes.body.data.url;

      // 2. Upload house deed
      const deedRes = await uploadFile(token, formData.houseDeedFile);
      if (deedRes.status !== 201) throw new Error(deedRes.body?.message || 'Failed to upload house deed.');
      const houseDeedPhotoUrl = deedRes.body.data.url;

      // 3. Upload all property photos
      const photoUrls = [];
      for (const photo of formData.propertyPhotos) {
        const photoRes = await uploadFile(token, photo.file);
        if (photoRes.status !== 201) throw new Error(photoRes.body?.message || 'Failed to upload a property photo.');
        photoUrls.push(photoRes.body.data.url);
      }

      // 4. Submit host identity verification (PUT /api/hosts/verification)
      //    This sets id_document_url on the user — required before listing creation.
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const verifyRes = await fetch(
        `${BASE_URL}/api/hosts/verification`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ idDocumentUrl }),
        }
      );
      if (!verifyRes.ok) {
        const verifyBody = await verifyRes.json().catch(() => ({}));
        throw new Error(verifyBody?.message || 'Failed to submit identity verification.');
      }

      // 5. Build amenities array: standard slugs + custom strings
      const amenities = [
        ...formData.standardAmenities.map((label) => STANDARD_AMENITY_MAP[label]),
        ...formData.customAmenities,
      ];

      // 6. Build house rules
      const houseRules = [...formData.houseRules, ...formData.customRules];

      // 7. POST /api/listings
      const listingRes = await createListing(token, {
        category:          PROPERTY_TYPE_MAP[formData.propertyType],
        city:              formData.city,
        subCity:           formData.subCity,
        streetAddress:     formData.streetAddress,
        houseDeedPhotoUrl,
        photos:            photoUrls,
        title:             formData.listingTitle,
        description:       formData.description,
        amenities,
        bedrooms:          formData.bedrooms,
        bathrooms:         formData.bathrooms,
        maxGuests:         formData.guests,
        pricePerNight:     Number(formData.nightlyPrice),
        houseRules,
        agreedToTerms:     true,
      });

      if (listingRes.status === 201) {
        navigate('/host/Host_dashboard');
      } else {
        const errors = listingRes.body?.errors ?? [];
        if (errors.length > 0) {
          setStepError(errors.map((e) => e.message).join(' '));
        } else {
          setStepError(listingRes.body?.message || 'Failed to create listing. Please try again.');
        }
      }
    } catch (err) {
      setStepError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Availability calendar ──────────────────────────────────────────────────

  const toggleBlockedDate = (date) => {
    const iso = date.toDateString();
    setFormData((prev) => {
      if (availabilityMode === 'blocked') {
        const alreadyBlocked = prev.blockedDates.some((b) => new Date(b).toDateString() === iso);
        return {
          ...prev,
          blockedDates: alreadyBlocked ? prev.blockedDates : [...prev.blockedDates, date.toISOString()],
          markedAvailableDates: prev.markedAvailableDates.filter((b) => new Date(b).toDateString() !== iso),
        };
      }
      const alreadyMarked = prev.markedAvailableDates.some((b) => new Date(b).toDateString() === iso);
      return {
        ...prev,
        blockedDates: prev.blockedDates.filter((b) => new Date(b).toDateString() !== iso),
        markedAvailableDates: alreadyMarked ? prev.markedAvailableDates : [...prev.markedAvailableDates, date.toISOString()],
      };
    });
  };

  // ── Step content renderer ──────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (STEPS[currentStep].key) {

      case 'property-type':
        return (
          <div>
            <p className="text-[14px] text-muted-foreground mb-6">Select the category that best describes your property.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROPERTY_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => updateField('propertyType', type)}
                  className={`px-6 py-6 rounded-2xl border text-center text-[16px] font-semibold transition-all ${formData.propertyType === type ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20' : 'border-border text-foreground hover:border-primary/50 hover:bg-gray-50'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">Guests receive your exact address only after booking is confirmed.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-semibold text-foreground mb-1.5">City</label>
                <select value={formData.city}
                  onChange={(e) => { updateField('city', e.target.value); updateField('subCity', ''); }}
                  className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground bg-white focus:outline-none focus:border-primary transition-colors cursor-pointer">
                  <option value="" disabled>Select a city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-semibold text-foreground mb-1.5">Sub-city {formData.city && `in ${formData.city}`}</label>
                <select value={formData.subCity} onChange={(e) => updateField('subCity', e.target.value)} disabled={!formData.city}
                  className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground bg-white focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="" disabled>{formData.city ? `Select sub-city in ${formData.city}` : 'Select a city first'}</option>
                  {(CITY_SUBCITIES[formData.city] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-foreground mb-1.5">Street address &amp; specific location</label>
              <input type="text" value={formData.streetAddress} onChange={(e) => updateField('streetAddress', e.target.value)}
                placeholder="e.g. Near Edna Mall, Cameroon Street, House 412"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[16px] font-bold text-foreground">Property photos</h3>
                <span className="text-[13px] font-medium text-primary">{formData.propertyPhotos.length} photo{formData.propertyPhotos.length !== 1 ? 's' : ''} added</span>
              </div>
              <p className="text-[14px] text-muted-foreground mb-4">Add photos showing the bedroom, living room, bathroom, and kitchen.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <label className="aspect-square rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer flex flex-col items-center justify-center text-primary group">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><ImagePlus size={20} className="text-primary" /></div>
                  <span className="text-[13px] font-bold">Add photos</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Click to browse</span>
                </label>
                {formData.propertyPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-sm">
                    <img src={photo.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md" title="Remove photo">
                      <X size={14} />
                    </button>
                    {index === 0 && <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-primary text-white text-[10px] font-bold uppercase tracking-wider">Cover</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* ID document */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[15px] font-bold text-foreground">Host ID / Passport</h4>
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">Required</span>
                </div>
                <p className="text-[13px] text-muted-foreground mb-3">Required for host identity verification.</p>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-gray-50/50">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) updateField('idDocumentFile', f); }} />
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><Upload size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">{formData.idDocumentFile ? formData.idDocumentFile.name : 'Upload National ID / Passport'}</p>
                    <p className="text-[11px] text-muted-foreground">JPG, PNG or PDF</p>
                  </div>
                </label>
              </div>
              {/* House deed */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[15px] font-bold text-foreground">House Deed or Rental Agreement</h4>
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">Required</span>
                </div>
                <p className="text-[13px] text-muted-foreground mb-3">Proof of property ownership or tenancy.</p>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-gray-50/50">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) updateField('houseDeedFile', f); }} />
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><FileText size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">{formData.houseDeedFile ? formData.houseDeedFile.name : 'Upload Document'}</p>
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
              <label className="block text-[15px] font-bold text-foreground mb-2">Listing title</label>
              <input type="text" value={formData.listingTitle} onChange={(e) => updateField('listingTitle', e.target.value)}
                placeholder="e.g. Modern Bole Skyline Apartment with Balcony"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-[15px] font-bold text-foreground mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the space, neighborhood, and unique features." rows={6}
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-y" />
            </div>
          </div>
        );

      case 'amenities':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-[15px] font-bold text-foreground mb-1">Standard amenities</h3>
              <p className="text-[14px] text-muted-foreground mb-4">Select all that apply to your property.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STANDARD_AMENITIES.map((label) => {
                  const isSelected = formData.standardAmenities.includes(label);
                  return (
                    <button key={label} type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        standardAmenities: isSelected ? prev.standardAmenities.filter((a) => a !== label) : [...prev.standardAmenities, label],
                      }))}
                      className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-left text-[15px] font-medium transition-all ${isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border text-foreground hover:border-primary/40'}`}>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-primary text-white' : 'border border-gray-300'}`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-[15px] font-bold text-foreground mb-1">Additional amenities</h3>
              <p className="text-[14px] text-muted-foreground mb-4">Add any other amenities your property offers (e.g. Backup generator, Security cameras, Hot water shower).</p>

              {formData.customAmenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.customAmenities.map((a, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[13px] font-medium">
                      {a}
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, customAmenities: prev.customAmenities.filter((_, i) => i !== idx) }))}
                        className="hover:text-red-600 transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input type="text" value={formData.newCustomAmenity}
                  onChange={(e) => updateField('newCustomAmenity', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = formData.newCustomAmenity.trim();
                      if (val && !formData.customAmenities.includes(val)) {
                        setFormData((prev) => ({ ...prev, customAmenities: [...prev.customAmenities, val], newCustomAmenity: '' }));
                      }
                    }
                  }}
                  placeholder="e.g. Backup generator, Solar power, Breakfast included"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-[14px] focus:outline-none focus:border-primary" />
                <button type="button"
                  onClick={() => {
                    const val = formData.newCustomAmenity.trim();
                    if (val && !formData.customAmenities.includes(val)) {
                      setFormData((prev) => ({ ...prev, customAmenities: [...prev.customAmenities, val], newCustomAmenity: '' }));
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-[#c82333]">Add</button>
              </div>
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">Define the capacity and sleeping arrangements.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { field: 'guests',    label: 'Guests capacity',    sub: 'Maximum guests allowed', min: 1 },
                { field: 'bedrooms',  label: 'Bedrooms',           sub: 'Private bedroom count',  min: 0 },
                { field: 'beds',      label: 'Beds',               sub: 'Total sleeping beds',    min: 1 },
                { field: 'bathrooms', label: 'Bathrooms',          sub: 'Private or shared',      min: 1 },
              ].map(({ field, label, sub, min }) => (
                <div key={field} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-gray-50/50">
                  <div>
                    <p className="text-[15px] font-bold text-foreground">{label}</p>
                    <p className="text-[12px] text-muted-foreground">{sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updateField(field, Math.max(min, formData[field] - 1))}
                      disabled={formData[field] <= min}
                      className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40">
                      <Minus size={14} />
                    </button>
                    <span className="text-[16px] font-bold w-6 text-center">{formData[field]}</span>
                    <button type="button" onClick={() => updateField(field, formData[field] + 1)}
                      className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[15px] font-bold text-foreground mb-2">Nightly rate (ETB)</label>
              <div className="relative max-w-sm">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary text-[16px]">ETB</span>
                <input type="number" min={100} step={100} value={formData.nightlyPrice}
                  onChange={(e) => updateField('nightlyPrice', e.target.value)}
                  className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-border text-[20px] font-bold text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">Choose what you're marking, then tap dates on the calendar.</p>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
              <div className="p-3 bg-gray-50/80 rounded-2xl border border-border flex flex-col items-center">
                <div className="w-[245px] flex items-center bg-gray-100 rounded-xl p-1 mb-3">
                  {['available', 'blocked'].map((mode) => (
                    <button key={mode} type="button" onClick={() => setAvailabilityMode(mode)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-bold transition-colors ${availabilityMode === mode ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                      <span className={`w-2 h-2 rounded-full ${mode === 'available' ? (availabilityMode === mode ? 'bg-green-500' : 'bg-gray-400') : (availabilityMode === mode ? 'bg-primary' : 'bg-gray-400')}`} />
                      {mode === 'available' ? 'Mark Available' : 'Mark Blocked'}
                    </button>
                  ))}
                </div>
                <Calendar blockedDates={formData.blockedDates} markedAvailable={formData.markedAvailableDates} onToggleDate={toggleBlockedDate} compact={true} />
                <button type="button" onClick={() => updateField('blockedDates', [])} className="mt-3 text-[12px] font-medium text-primary hover:underline">Clear all blocked dates</button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border">
                  <div>
                    <p className="text-[14px] font-bold text-foreground">Instant Booking</p>
                    <p className="text-[12px] text-muted-foreground">Guests can book without prior approval</p>
                  </div>
                  <input type="checkbox" checked={formData.instantBook} onChange={(e) => updateField('instantBook', e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-foreground mb-2">Minimum night stay</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 7].map((n) => (
                      <button key={n} type="button" onClick={() => updateField('minNights', n)}
                        className={`py-2 rounded-xl border text-[13px] font-semibold text-center transition-colors ${formData.minNights === n ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-primary/40'}`}>
                        {n} {n === 1 ? 'night' : 'nights'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'house-rules':
        return (
          <div className="space-y-6">
            <p className="text-[14px] text-muted-foreground">Select ground rules for guests during their stay.</p>
            <div className="space-y-2.5">
              {PRESET_HOUSE_RULES.map((rule) => {
                const isSelected = formData.houseRules.includes(rule);
                return (
                  <button key={rule} type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, houseRules: isSelected ? prev.houseRules.filter((r) => r !== rule) : [...prev.houseRules, rule] }))}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border text-left text-[14px] transition-all ${isSelected ? 'border-primary bg-primary/5 text-foreground font-semibold' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary text-white' : 'border border-gray-300'}`}>
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
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[14px]">
                    <span className="font-medium text-foreground">{rule}</span>
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, customRules: prev.customRules.filter((_, i) => i !== idx) }))} className="text-muted-foreground hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={formData.newRuleText} onChange={(e) => updateField('newRuleText', e.target.value)} placeholder="Add custom rule"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-[14px] focus:outline-none focus:border-primary" />
              <button type="button"
                onClick={() => { if (!formData.newRuleText.trim()) return; setFormData((prev) => ({ ...prev, customRules: [...prev.customRules, prev.newRuleText.trim()], newRuleText: '' })); }}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-[#c82333]">Add</button>
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
                <p className="text-amber-700">Your bank details are only visible to Ethio-Airbnb admins and are used exclusively to transfer your earnings after guests check out.</p>
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-foreground mb-1.5">Bank name</label>
              <select value={formData.bankName} onChange={(e) => updateField('bankName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground bg-white focus:outline-none focus:border-primary transition-colors cursor-pointer">
                <option value="" disabled>Select your bank</option>
                {['Commercial Bank of Ethiopia (CBE)','Awash Bank','Dashen Bank','Abyssinia Bank','Nib International Bank','Wegagen Bank','United Bank','Cooperative Bank of Oromia','Berhan Bank','Amhara Bank','Telebirr','M-Pesa Ethiopia'].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-foreground mb-1.5">Account holder full name</label>
              <input type="text" value={formData.accountHolderName} onChange={(e) => updateField('accountHolderName', e.target.value)} placeholder="e.g. Abebe Kebede"
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-foreground mb-1.5">{isTelebirr ? 'Phone number' : 'Account number'}</label>
              <input type="text" inputMode="numeric" value={formData.accountNumber}
                onChange={(e) => updateField('accountNumber', e.target.value.replace(/\D/g, ''))}
                placeholder={isTelebirr ? 'e.g. 0912345678' : 'e.g. 1000123456789'}
                className="w-full px-4 py-3 rounded-xl border border-border text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors tracking-wider" />
            </div>
          </div>
        );
      }

      case 'preview':
        return (
          <div className="py-2 space-y-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary"><Sparkles size={24} /></div>
              <h3 className="text-[24px] font-serif font-bold text-foreground">Terms &amp; Conditions Agreement</h3>
              <p className="text-[13px] text-muted-foreground max-w-lg">Please review the Ethio-Airbnb platform terms before publishing.</p>
            </div>

            {/* Listing summary */}
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

            {/* Terms scroll box */}
            <div className="border border-border rounded-2xl p-6 bg-white max-h-[380px] overflow-y-auto text-[13px] leading-relaxed text-gray-700 shadow-inner space-y-4">
              <div className="border-b border-border pb-3">
                <h4 className="text-[16px] font-bold text-gray-900 font-serif">Ethio-Airbnb — Terms &amp; Conditions</h4>
                <p className="text-[12px] text-muted-foreground mt-0.5">Last updated: August 2026 · Version 1.1</p>
              </div>
              {[
                ['1. Overview', 'Ethio-Airbnb connects Hosts who want to rent properties with Guests looking for short-term accommodation. By creating an account, listing a property, or making a booking, you agree to these terms.'],
                ['2. Host Responsibilities', 'As a Host: provide accurate property information, honor confirmed bookings, respond promptly to guests, and keep your listing up to date.'],
                ['3. Payments & Payouts', 'Guests pay by uploading proof of bank transfer. Once an admin confirms payment, the booking is confirmed. The platform transfers the host payout (booking total minus 15% platform commission) within 24 hours of check-in.'],
                ['4. Cancellations', 'Guests may cancel within 24 hours of payment confirmation for a full refund. After that window closes, the booking is non-refundable and the host becomes eligible for payout.'],
                ['5. Prohibited Conduct', 'No fake listings, fraudulent payment proof, harassment, or circumventing the platform payment process. Violations may result in account suspension.'],
                ['6. Agreement', 'By clicking "I Agree & Publish", you confirm you have read and accept these terms.'],
              ].map(([title, text]) => (
                <div key={title}>
                  <h5 className="font-bold text-gray-900 text-[14px] mb-1">{title}</h5>
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
              <input type="checkbox" checked={formData.agreedToTerms} onChange={(e) => updateField('agreedToTerms', e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer flex-shrink-0" />
              <span className="text-[14px] font-semibold text-foreground">I have read and agree to the Ethio-Airbnb Terms &amp; Conditions (Version 1.1).</span>
            </label>

            <div className="flex justify-center pt-2">
              <button type="button" onClick={handlePublishListing}
                disabled={!formData.agreedToTerms || isSubmitting}
                className="bg-primary hover:bg-[#c82333] text-white px-10 py-4 rounded-xl text-[16px] font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3">
                {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Publishing…</> : 'I Agree & Publish Listing'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <NavBar1 />

      <section className="w-full px-6 pt-28 pb-20">
        <div className="w-full max-w-[1000px] mx-auto">
          {/* Progress header */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-primary tracking-[0.2em] uppercase">
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <span className="text-[12px] font-semibold text-muted-foreground">{Math.round(progressPercent)}% completed</span>
          </div>
          <h1 className="text-3xl md:text-[38px] font-bold font-serif text-foreground mb-4">{STEPS[currentStep].label}</h1>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-primary/15 rounded-full mb-6 overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Step pills */}
          <div className="w-full flex items-center gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent   = index === currentStep;
              return (
                <button key={step.key} type="button" onClick={() => handleStepClick(index)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${isCurrent ? 'bg-primary text-white shadow-sm' : isCompleted ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                  {isCompleted && <Check size={14} strokeWidth={3} />}
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* Error toast */}
          {stepError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[14px] flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {/* Step card */}
          <div className="w-full bg-white rounded-3xl border border-border p-6 sm:p-10 mb-8 shadow-sm">
            {renderStepContent()}
          </div>

          {/* Nav buttons */}
          {STEPS[currentStep].key !== 'preview' && (
            <div className="w-full flex justify-between items-center">
              <button type="button" onClick={goBack} disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-foreground text-[14px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" onClick={goNext}
                className="flex items-center gap-2 bg-primary hover:bg-[#c82333] text-white px-7 py-3 rounded-xl text-[14px] font-bold shadow-md hover:shadow-lg transition-all">
                Next step <ArrowRight size={16} />
              </button>
            </div>
          )}
          {STEPS[currentStep].key === 'preview' && (
            <div className="w-full flex justify-start">
              <button type="button" onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-foreground text-[14px] font-semibold hover:bg-gray-50 transition-colors">
                <ArrowLeft size={16} /> Back to edit
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
