import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ShieldCheck, Star, CheckCircle,
  Upload, Copy, Check, X, AlertCircle, Loader2,
} from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getPublicListing, createBooking, uploadFile, submitPaymentReceipt } from '../lib/api';

const PAYMENT_OPTIONS = [
  { id: 'telebirr',   label: 'Telebirr',           sub: 'Mobile wallet' },
  { id: 'cbe',        label: 'CBE',                sub: 'Commercial Bank of Ethiopia' },
  { id: 'abyssinia',  label: 'Bank of Abyssinia',  sub: 'BOA mobile banking' },
  { id: 'dashen',     label: 'Dashen Bank',         sub: 'Dashen mobile banking' },
  { id: 'awash',      label: 'Awash Bank',          sub: 'Awash mobile banking' },
];

const PAYMENT_DETAILS = {
  telebirr:  { title: 'Telebirr',                        accountName: 'EthioStays Official (Dawit Alemu)',   accountNumber: '0911234567',     numberLabel: 'Telebirr Phone Number' },
  cbe:       { title: 'Commercial Bank of Ethiopia',      accountName: 'EthioStays Hospitality PLC',        accountNumber: '1000234567891',  numberLabel: 'Account Number', branch: 'Addis Ababa Main Branch' },
  abyssinia: { title: 'Bank of Abyssinia',                accountName: 'EthioStays Hospitality PLC',        accountNumber: '01280934567001', numberLabel: 'Account Number', branch: 'Bole Branch, Addis Ababa' },
  dashen:    { title: 'Dashen Bank',                      accountName: 'EthioStays Hospitality PLC',        accountNumber: '0076109823450',  numberLabel: 'Account Number', branch: 'Kazanchis Branch, Addis Ababa' },
  awash:     { title: 'Awash Bank',                       accountName: 'EthioStays Hospitality PLC',        accountNumber: '01320894567100', numberLabel: 'Account Number', branch: 'Bole Branch, Addis Ababa' },
};

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  const d = Math.round(diff / 86_400_000);
  return d > 0 ? d : 0;
}

function fmtDate(str) {
  try { return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return str; }
}

// ── Bank logo SVGs ─────────────────────────────────────────────────────────────
const BankLogo = ({ id }) => {
  const configs = {
    telebirr:  { bg: '#E6007E', label: 'tele\nbirr' },
    cbe:       { bg: '#006633', label: 'CBE' },
    abyssinia: { bg: '#003087', label: 'BOA' },
    dashen:    { bg: '#C8102E', label: 'DSN' },
    awash:     { bg: '#FF6600', label: 'AWB' },
  };
  const c = configs[id] ?? { bg: '#888', label: '?' };
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill={c.bg} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial,sans-serif">{c.label}</text>
    </svg>
  );
};

const Book = () => {
  const { id: listingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => { window.scrollTo(0, 0); }, [listingId]);

  // ── Query params ────────────────────────────────────────────────────────
  const queryCheckIn  = searchParams.get('checkIn')  || '';
  const queryCheckOut = searchParams.get('checkOut') || '';
  const queryGuests   = Number(searchParams.get('guests')) || 1;

  // ── Listing state ───────────────────────────────────────────────────────
  const [listing, setListing]       = useState(null);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError]     = useState('');

  useEffect(() => {
    if (!listingId) return;
    setListingLoading(true);
    getPublicListing(listingId)
      .then(({ status, body }) => {
        if (status === 200) setListing(body.data);
        else setListingError('This listing could not be found.');
      })
      .catch(() => setListingError('Network error loading listing.'))
      .finally(() => setListingLoading(false));
  }, [listingId]);

  // ── Guest info ──────────────────────────────────────────────────────────
  const [fullName, setFullName]       = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail]             = useState('');

  useEffect(() => {
    if (user) {
      const name = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
      setFullName(name || '');
      setPhoneNumber(user.phoneNumber || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // ── Payment method ──────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [copiedField, setCopiedField]     = useState(null);

  // ── Booking flow state ──────────────────────────────────────────────────
  const [bookingId, setBookingId]           = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submitError, setSubmitError]       = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDeadline, setPaymentDeadline] = useState(null);

  // ── Computed ────────────────────────────────────────────────────────────
  const nights     = useMemo(() => nightsBetween(queryCheckIn, queryCheckOut), [queryCheckIn, queryCheckOut]);
  const totalPrice = listing ? listing.pricePerNight * nights : 0;

  const copyToClipboard = (text, field) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Step 1: Create booking ──────────────────────────────────────────────
  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!fullName.trim() || !phoneNumber.trim() || !email.trim()) {
      setSubmitError('Please fill in all guest information fields.');
      return;
    }
    if (!queryCheckIn || !queryCheckOut || nights < 1) {
      setSubmitError('Invalid dates. Please go back and select valid check-in and check-out dates.');
      return;
    }
    if (!token) {
      navigate('/login', { state: { from: `/book/${listingId}?checkIn=${queryCheckIn}&checkOut=${queryCheckOut}&guests=${queryGuests}` } });
      return;
    }

    setIsSubmitting(true);
    try {
      const { status, body } = await createBooking(token, {
        listingId,
        checkIn:    queryCheckIn,
        checkOut:   queryCheckOut,
        guestCount: queryGuests,
      });

      if (status === 201) {
        setBookingId(body.data.bookingId);
        setPaymentDeadline(body.data.paymentDeadline);
        setShowPaymentModal(true);
      } else {
        setSubmitError(body.message || 'Failed to create booking. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Upload receipt + submit payment ──────────────────────────────
  const handleFinalPaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!screenshotFile) {
      setSubmitError('Please attach your payment screenshot.');
      return;
    }
    if (!bookingId) {
      setSubmitError('Booking not found. Please start over.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload the receipt image first
      const uploadRes = await uploadFile(token, screenshotFile);
      if (uploadRes.status !== 201) {
        setSubmitError(uploadRes.body?.message || 'Failed to upload payment screenshot.');
        return;
      }
      const receiptImageUrl = uploadRes.body.data.url;

      // Submit the receipt URL to the backend
      const receiptRes = await submitPaymentReceipt(token, bookingId, receiptImageUrl);
      if (receiptRes.status === 201) {
        setShowPaymentModal(false);
        setPaymentSuccess(true);
      } else {
        setSubmitError(receiptRes.body?.message || 'Failed to submit payment receipt. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading / error ─────────────────────────────────────────────────────
  if (listingLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span>Loading booking details…</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-lg font-semibold">{listingError || 'Listing not found.'}</p>
          <Link to="/explore" className="text-primary hover:underline font-medium">Back to explore</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverPhoto = listing.photos?.[0] ?? null;
  const payDetails = PAYMENT_DETAILS[paymentMethod];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-[1180px] mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link to={`/property/${listing.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={16} /> Back to stay details
            </Link>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Confirm and pay</h1>

          {submitError && !showPaymentModal && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[14px] flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
            {/* Left column */}
            <form onSubmit={handleConfirmAndPay} className="space-y-10">
              {/* Trip summary */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-5">Your trip</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm">📅</div>
                      <div>
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Dates</span>
                        <span className="font-semibold text-[15px]">{fmtDate(queryCheckIn)} – {fmtDate(queryCheckOut)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-stone-100 px-2.5 py-1 rounded-full font-medium">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm">👥</div>
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Guests</span>
                      <span className="font-semibold text-[15px]">{queryGuests} {queryGuests === 1 ? 'adult' : 'adults'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest information */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-5">Guest information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Selam Tesfaye"
                        className="w-full bg-stone-50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:bg-white outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone number</label>
                      <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+251 91 234 5678"
                        className="w-full bg-stone-50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:bg-white outline-none transition-all" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                      className="w-full bg-stone-50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:bg-white outline-none transition-all" required />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-2">Payment method</h2>
                <p className="text-xs text-muted-foreground mb-5">Select your preferred payment channel to view receiver details.</p>

                <div className="mb-6 relative">
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full appearance-none bg-stone-50 border-2 border-primary/30 focus:border-primary rounded-2xl pl-14 pr-10 py-3.5 text-sm font-semibold outline-none cursor-pointer transition-all">
                    {PAYMENT_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label} — {opt.sub}</option>)}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center pointer-events-none">
                    <BankLogo id={paymentMethod} />
                  </div>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                <div className="bg-stone-50 border border-primary/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-stone-100 shadow-sm flex-shrink-0">
                      <BankLogo id={paymentMethod} />
                    </div>
                    <h3 className="font-bold text-sm">{payDetails.title} — Payment Details</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white border border-border gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Account Name / Receiver:</span>
                        <span className="font-bold">{payDetails.accountName}</span>
                      </div>
                      <button type="button" onClick={() => copyToClipboard(payDetails.accountName, 'name')} className="self-start sm:self-center w-8 h-8 rounded-lg border border-border hover:bg-stone-100 flex items-center justify-center transition-colors">
                        {copiedField === 'name' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white border border-border gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">{payDetails.numberLabel}:</span>
                        <span className="font-bold font-mono text-base text-primary">{payDetails.accountNumber}</span>
                      </div>
                      <button type="button" onClick={() => copyToClipboard(payDetails.accountNumber, 'account')} className="self-start sm:self-center w-8 h-8 rounded-lg bg-primary text-white hover:bg-[#c82333] flex items-center justify-center shadow-sm transition-colors">
                        {copiedField === 'account' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    {payDetails.branch && (
                      <div className="p-3 rounded-xl bg-white border border-border text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Branch:</span> {payDetails.branch}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancellation policy */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-3">Cancellation policy</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Free cancellation within 24 hours of payment confirmation. After that window closes the booking is non-refundable.
                </p>
              </div>
            </form>

            {/* Right: pricing summary */}
            <aside className="bg-white border border-border rounded-3xl p-6 shadow-xl sticky top-24">
              <div className="flex gap-4 pb-6 border-b border-border">
                <div className="w-24 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100">
                  {coverPhoto
                    ? <img src={coverPhoto} alt={listing.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No photo</div>}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-base leading-snug">{listing.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{listing.subCity}, {listing.city}</p>
                </div>
              </div>

              {/* Price breakdown — no fees */}
              <div className="py-5 space-y-3.5 text-sm text-muted-foreground border-b border-border">
                <div className="flex justify-between">
                  <span>ETB {listing.pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span className="text-foreground font-medium">ETB {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="py-5 flex justify-between items-center text-base font-bold text-foreground">
                <span>Total (ETB)</span>
                <span className="text-xl text-primary font-serif">ETB {totalPrice.toLocaleString()}</span>
              </div>

              <button type="button" onClick={handleConfirmAndPay} disabled={isSubmitting || nights < 1}
                className="w-full bg-primary hover:bg-[#c82333] text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing…</> : 'Confirm and pay'}
              </button>
            </aside>
          </div>
        </div>
      </main>

      {/* ── Payment modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-border shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div>
                <h3 className="font-serif text-2xl font-bold">Complete Payment</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Upload your transaction screenshot to confirm</p>
              </div>
              <button type="button" onClick={() => { setShowPaymentModal(false); setSubmitError(''); }} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Payment reminder */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-border mb-5 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Payment Channel:</span><span className="font-bold">{payDetails.title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Receiver:</span><span className="font-bold">{payDetails.accountName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground font-semibold">{payDetails.numberLabel}:</span><span className="font-mono font-bold text-primary text-sm">{payDetails.accountNumber}</span></div>
              <div className="flex justify-between pt-1 border-t border-border/80"><span className="text-muted-foreground font-bold">Total to transfer:</span><span className="font-bold text-primary text-base">ETB {totalPrice.toLocaleString()}</span></div>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />{submitError}
              </div>
            )}

            <form onSubmit={handleFinalPaymentSubmit} className="space-y-4">
              {/* Screenshot upload */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Attach Payment Screenshot *</label>
                <div className="border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 rounded-2xl p-5 text-center cursor-pointer transition-colors relative">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setScreenshotFile(file); setScreenshotPreview(URL.createObjectURL(file)); }
                  }} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {screenshotPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-border shadow-sm mb-2">
                        <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle size={14} /> Screenshot attached</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">{screenshotFile?.name} · Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2"><Upload size={22} /></div>
                      <span className="text-xs font-bold">Click or drag screenshot here</span>
                      <span className="text-[11px] text-muted-foreground mt-1">PNG, JPG (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowPaymentModal(false); setSubmitError(''); }} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-stone-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-[#c82333] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><ShieldCheck size={16} /> Confirm Payment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center border border-border shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle size={36} />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 inline-block">Receipt Submitted</span>
            <h3 className="font-serif text-2xl font-bold mb-2">Booking Request Sent!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Your payment receipt for <span className="font-semibold text-foreground">{listing.title}</span> has been submitted. An admin will verify it shortly and confirm your booking.
            </p>
            <div className="bg-stone-50 rounded-2xl p-4 text-left text-xs space-y-2 mb-6 border border-border">
              <div className="flex justify-between"><span className="text-muted-foreground">Listing:</span><span className="font-semibold">{listing.title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dates:</span><span className="font-semibold">{fmtDate(queryCheckIn)} – {fmtDate(queryCheckOut)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total:</span><span className="font-bold text-primary">ETB {totalPrice.toLocaleString()}</span></div>
              {paymentDeadline && <div className="flex justify-between"><span className="text-muted-foreground">Payment deadline:</span><span className="font-semibold">{new Date(paymentDeadline).toLocaleString('en-ET')}</span></div>}
            </div>
            <div className="flex flex-col gap-2.5">
              <Link to="/guest_dashboard" className="w-full bg-primary hover:bg-[#c82333] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all text-center">View My Bookings</Link>
              <Link to="/explore" className="w-full border border-border hover:bg-stone-50 text-foreground py-2.5 rounded-xl font-semibold text-xs transition-colors text-center">Explore More Stays</Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Book;
