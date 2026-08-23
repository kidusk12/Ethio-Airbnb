import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  Star,
  CheckCircle,
  Upload,
  Copy,
  Check,
  X,
} from 'lucide-react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import { getListingDetail, createBooking, uploadFile, submitPaymentReceipt, resolveFileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Book = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    getListingDetail(id).then(({ status, body }) => {
      if (status === 200) {
        setProperty(body.data);
      } else {
        setLoadError(body?.message || 'Could not load this listing.');
      }
      setLoading(false);
    });
  }, [id]);

const queryGuests = Number(searchParams.get('guests')) || 2;
const queryCheckIn = searchParams.get('checkIn');
const queryCheckOut = searchParams.get('checkOut');

if (!queryCheckIn || !queryCheckOut) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <p className="text-muted-foreground">Missing booking dates. Please go back and select your check-in and check-out dates.</p>
      <Link to={`/property/${id}`} className="text-primary font-semibold hover:underline">
        Back to listing
      </Link>
    </div>
  );
}
  const [fullName, setFullName] = useState(
    user?.name || (user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : '')
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [copiedField, setCopiedField] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Set once POST /api/bookings succeeds — the real, server-calculated
  // values, not the client-side estimate shown before that point.
  const [activeBooking, setActiveBooking] = useState(null); // { bookingId, totalPrice, paymentDeadline }

  const nights = useMemo(() => {
    try {
      const diffTime = new Date(queryCheckOut) - new Date(queryCheckIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 4;
    } catch {
      return 4;
    }
  }, [queryCheckIn, queryCheckOut]);

  const estimatedBasePrice = property ? property.pricePerNight * nights : 0;
  const estimatedCleaningFee = 600;
  const estimatedServiceFee = Math.round(estimatedBasePrice * 0.08);
  const estimatedTotal = estimatedBasePrice + estimatedCleaningFee + estimatedServiceFee;

  // Once a real booking exists, show the server's real total instead of the estimate.
  const displayTotal = activeBooking ? activeBooking.totalPrice : estimatedTotal;

  const formatDateString = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  // Fires the moment the guest confirms — this is the real POST /api/bookings
  // call. Per the contract, dates lock and the 1h payment clock starts here,
  // before the receipt modal even opens.
  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!fullName.trim() || !phoneNumber.trim() || !email.trim()) {
      setBookingError('Please fill in all guest information fields.');
      return;
    }

    try {
      const { status, body } = await createBooking(
        {
          listingId: id,
          checkIn: queryCheckIn,
          checkOut: queryCheckOut,
          guestCount: queryGuests,
        },
        token
      );

      if (status !== 201) {
        setBookingError(body?.message || 'Could not create this booking.');
        return;
      }

      setActiveBooking({
        bookingId: body.data.bookingId,
        totalPrice: body.data.totalPrice,
        paymentDeadline: body.data.paymentDeadline,
      });
      setShowPaymentModal(true);
    } catch (err) {
      setBookingError('Could not reach the server. Please try again.');
    }
  };

  // Uploads the real screenshot, then submits the real payment receipt —
  // together these are the second half of "Confirm and Pay".
  const handleFinalPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;

    setIsSubmitting(true);
    setBookingError('');

    try {
      const uploadRes = await uploadFile(screenshotFile, token);
      if (uploadRes.status !== 201) {
        setBookingError(uploadRes.body?.message || 'Screenshot upload failed.');
        setIsSubmitting(false);
        return;
      }

      const receiptRes = await submitPaymentReceipt(
        activeBooking.bookingId,
        uploadRes.body.data.url,
        token
      );

      if (receiptRes.status !== 201) {
        setBookingError(receiptRes.body?.message || 'Could not submit payment receipt.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setShowPaymentModal(false);
      setPaymentSuccess(true);
    } catch (err) {
      setBookingError('Could not reach the server. Please try again.');
      setIsSubmitting(false);
    }
  };

  const paymentOptions = [
    { id: 'telebirr', label: 'Telebirr', sub: 'Mobile wallet' },
    { id: 'cbe', label: 'CBE', sub: 'Commercial Bank of Ethiopia' },
    { id: 'abyssinia', label: 'Bank of Abyssinia', sub: 'BOA mobile banking' },
    { id: 'dashen', label: 'Dashen Bank', sub: 'Dashen mobile banking' },
    { id: 'awash', label: 'Awash Bank', sub: 'Awash mobile banking' },
  ];

  const paymentDetails = {
    telebirr: { title: 'Telebirr', accountName: 'EthioStays Official (Dawit Alemu)', accountNumber: '0911234567', numberLabel: 'Telebirr Phone Number' },
    cbe: { title: 'Commercial Bank of Ethiopia (CBE)', accountName: 'EthioStays Hospitality PLC', accountNumber: '1000234567891', branch: 'Addis Ababa Main Branch', numberLabel: 'Account Number' },
    abyssinia: { title: 'Bank of Abyssinia', accountName: 'EthioStays Hospitality PLC', accountNumber: '01280934567001', branch: 'Bole Branch, Addis Ababa', numberLabel: 'Account Number' },
    dashen: { title: 'Dashen Bank', accountName: 'EthioStays Hospitality PLC', accountNumber: '0076109823450', branch: 'Kazanchis Branch, Addis Ababa', numberLabel: 'Account Number' },
    awash: { title: 'Awash Bank', accountName: 'EthioStays Hospitality PLC', accountNumber: '01320894567100', branch: 'Bole Branch, Addis Ababa', numberLabel: 'Account Number' },
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (loadError || !property) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{loadError || 'Listing not found.'}</div>;
  }

  const coverPhoto = property.photos?.[0] ? resolveFileUrl(property.photos[0]) : '';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-[1180px] mx-auto">
          <div className="mb-6">
            <Link
              to={`/property/${id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} /> Back to stay details
            </Link>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Confirm and pay</h1>

          {bookingError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {bookingError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
            <form onSubmit={handleConfirmAndPay} className="space-y-10">
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-5">Your trip</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="text-sm font-bold">📅</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Dates</span>
                        <span className="font-semibold text-[15px] text-foreground">
                          {formatDateString(queryCheckIn)} – {formatDateString(queryCheckOut)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-stone-100 px-2.5 py-1 rounded-full font-medium">
                      {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="text-sm font-bold">👥</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Guests</span>
                        <span className="font-semibold text-[15px] text-foreground">
                          {queryGuests} {queryGuests === 1 ? 'adult' : 'adults'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-5">Guest information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Selam Tesfaye"
                        className="w-full bg-stone-50 border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:bg-white outline-none transition-all"
                        required
                        disabled={!!activeBooking}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+251 91 234 5678"
                        className="w-full bg-stone-50 border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:bg-white outline-none transition-all"
                        required
                        disabled={!!activeBooking}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-stone-50 border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:bg-white outline-none transition-all"
                      required
                      disabled={!!activeBooking}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-2">Payment method</h2>
                <p className="text-xs text-muted-foreground mb-5">Select your preferred payment channel to view receiver details.</p>

                <div className="mb-6">
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full appearance-none bg-stone-50 border-2 border-primary/30 focus:border-primary rounded-2xl pl-14 pr-10 py-3.5 text-sm font-semibold text-foreground outline-none cursor-pointer transition-all"
                      disabled={!!activeBooking}
                    >
                      {paymentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label} — {opt.sub}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center pointer-events-none">
                      <BankLogo id={paymentMethod} />
                    </div>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                <div className="bg-stone-50 border border-primary/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-stone-100 shadow-sm flex-shrink-0">
                      <BankLogo id={paymentMethod} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{paymentDetails[paymentMethod].title} — Payment Details</h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white border border-border gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Account Name / Receiver:</span>
                        <span className="font-bold text-foreground">{paymentDetails[paymentMethod].accountName}</span>
                      </div>
                      <button type="button" onClick={() => copyToClipboard(paymentDetails[paymentMethod].accountName, 'name')} className="self-start sm:self-center w-8 h-8 rounded-lg border border-border hover:bg-stone-100 flex items-center justify-center transition-colors">
                        {copiedField === 'name' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white border border-border gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">{paymentDetails[paymentMethod].numberLabel}:</span>
                        <span className="font-bold font-mono text-base text-primary">{paymentDetails[paymentMethod].accountNumber}</span>
                      </div>
                      <button type="button" onClick={() => copyToClipboard(paymentDetails[paymentMethod].accountNumber, 'account')} className="self-start sm:self-center w-8 h-8 rounded-lg bg-primary text-white hover:bg-[#c82333] flex items-center justify-center shadow-sm transition-colors">
                        {copiedField === 'account' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>

                    {paymentDetails[paymentMethod].branch && (
                      <div className="p-3 rounded-xl bg-white border border-border text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Branch:</span> {paymentDetails[paymentMethod].branch}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-3">Cancellation policy</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Free cancellation while your booking is awaiting payment. Once payment is confirmed, you can still cancel for a full refund within 24 hours — after that, the booking is no longer cancellable.
                </p>
              </div>
            </form>

            <aside className="bg-white border border-border rounded-3xl p-6 shadow-xl sticky top-24">
              <div className="flex gap-4 pb-6 border-b border-border">
                <div className="w-24 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100">
                  {coverPhoto && <img src={coverPhoto} alt={property.title} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-base text-foreground leading-snug">{property.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{property.subCity}, {property.city}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                    <Star size={13} className="fill-primary text-primary" />
                    <span>{property.averageRating ?? 'New'}</span>
                    <span className="text-muted-foreground">({property.reviewCount ?? 0})</span>
                  </div>
                </div>
              </div>

              <div className="py-5 space-y-3.5 text-sm text-muted-foreground border-b border-border">
                <div className="flex justify-between">
                  <span>ETB {Number(property.pricePerNight).toLocaleString()} × {nights} nights</span>
                  <span className="text-foreground font-medium">ETB {estimatedBasePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span className="text-foreground font-medium">ETB {estimatedCleaningFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span className="text-foreground font-medium">ETB {estimatedServiceFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="py-5 flex justify-between items-center text-base font-bold text-foreground">
                <span>Total (ETB)</span>
                <span className="text-xl text-primary font-serif">ETB {displayTotal.toLocaleString()}</span>
              </div>
              {activeBooking && (
                <p className="text-[11px] text-muted-foreground -mt-3 mb-4">
                  Server-confirmed total. Booking created — complete payment before {new Date(activeBooking.paymentDeadline).toLocaleTimeString()}.
                </p>
              )}

              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={!!activeBooking}
                className="w-full bg-primary hover:bg-[#c82333] text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeBooking ? 'Booking created — complete payment' : 'Confirm and pay'}
              </button>
            </aside>
          </div>
        </div>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-border shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Complete Payment</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Upload your transaction screenshot to confirm</p>
              </div>
              <button type="button" onClick={() => setShowPaymentModal(false)} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-border mb-5 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Payment Channel:</span>
                <span className="font-bold text-foreground">{paymentDetails[paymentMethod].title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Receiver Name:</span>
                <span className="font-bold text-foreground">{paymentDetails[paymentMethod].accountName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">
                  {paymentMethod === 'telebirr' ? 'Telebirr Phone:' : 'Account Number:'}
                </span>
                <span className="font-mono font-bold text-primary text-sm">{paymentDetails[paymentMethod].accountNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border/80">
                <span className="text-muted-foreground font-bold">Total to transfer:</span>
                <span className="font-bold text-primary text-base">ETB {displayTotal.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleFinalPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Transaction Reference *</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. TXN-98421074"
                  required
                  className="w-full bg-stone-50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Attach Payment Screenshot *</label>
                <div className="border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 rounded-2xl p-5 text-center cursor-pointer transition-colors relative">
                  <input type="file" accept="image/*" onChange={handleImageChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {screenshotPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-border shadow-sm mb-2">
                        <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle size={14} /> Screenshot attached
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">{screenshotFile?.name} · Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <Upload size={22} />
                      </div>
                      <span className="text-xs font-bold text-foreground">Click or drag screenshot here</span>
                      <span className="text-[11px] text-muted-foreground mt-1">Supports PNG, JPG, JPEG (Max 10MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !screenshotFile}
                  className="flex-1 bg-primary hover:bg-[#c82333] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : (<><ShieldCheck size={16} /> Confirm Payment</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center border border-border shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle size={36} />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
              Receipt Submitted
            </span>
            <h3 className="font-serif text-2xl font-bold mb-2 text-foreground">Awaiting Confirmation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Your payment receipt for <span className="font-semibold text-foreground">{property.title}</span> has been sent to an admin for verification. You'll be notified once it's confirmed.
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 text-left text-xs space-y-2 mb-6 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Ref:</span>
                <span className="font-mono font-bold text-foreground">{activeBooking?.bookingId?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guest:</span>
                <span className="font-semibold text-foreground">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stay Dates:</span>
                <span className="font-semibold text-foreground">{queryCheckIn} to {queryCheckOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-semibold text-foreground">{paymentDetails[paymentMethod].title}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link to="/explore" className="w-full bg-primary hover:bg-[#c82333] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all text-center">
                Explore More Stays
              </Link>
              <Link to="/" className="w-full border border-border hover:bg-stone-50 text-foreground py-2.5 rounded-xl font-semibold text-xs transition-colors text-center">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Book;

const BankLogo = ({ id }) => {
  if (id === 'telebirr') return (<svg viewBox="0 0 40 40" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#E6007E"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial,sans-serif">tele</text><text x="50%" y="75%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="7" fontFamily="Arial,sans-serif">birr</text></svg>);
  if (id === 'cbe') return (<svg viewBox="0 0 40 40" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#006633"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial,sans-serif">CBE</text><text x="50%" y="76%" dominantBaseline="middle" textAnchor="middle" fill="#90EE90" fontSize="6" fontFamily="Arial,sans-serif">Birr</text></svg>);
  if (id === 'abyssinia') return (<svg viewBox="0 0 40 40" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#003087"/><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial,sans-serif">BOA</text><text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle" fill="#ADD8E6" fontSize="6" fontFamily="Arial,sans-serif">Abyssinia</text></svg>);
  if (id === 'dashen') return (<svg viewBox="0 0 40 40" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#C8102E"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial,sans-serif">DSN</text><text x="50%" y="75%" dominantBaseline="middle" textAnchor="middle" fill="#FFB6C1" fontSize="6" fontFamily="Arial,sans-serif">Dashen</text></svg>);
  if (id === 'awash') return (<svg viewBox="0 0 40 40" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#FF6600"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial,sans-serif">AWB</text><text x="50%" y="75%" dominantBaseline="middle" textAnchor="middle" fill="#FFE0CC" fontSize="6" fontFamily="Arial,sans-serif">Awash</text></svg>);
  return null;
};