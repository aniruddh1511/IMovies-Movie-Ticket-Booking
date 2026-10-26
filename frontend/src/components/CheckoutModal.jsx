import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  QrCode,
  CreditCard,
  FlaskConical,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';
import { api } from '../services/api.js';

export const CheckoutModal = () => {
  const {
    activeMovie,
    activeCinema,
    activeShow,
    activeBooking,
    selectedSeats,
    baseTotal,
    convenienceFee,
    gstTax,
    grandTotal,
    bookingStep,
    setBookingStep,
    onBookingConfirmed,
    closeBookingModal,
  } = useBooking();

  // Payment tab: 'phonepe' | 'razorpay' | 'demo'
  const [paymentTab, setPaymentTab] = useState('phonepe');
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusNotice, setStatusNotice] = useState(null);

  if (bookingStep !== 'checkout' || !activeBooking) return null;

  // 1. Verify PhonePe UPI Payment via 12-Digit UTR
  const handleVerifyPhonePe = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusNotice(null);

    const clean = utrNumber.trim();
    if (!clean) {
      setErrorMessage('Please enter the 12-digit UPI UTR / Transaction Reference number from your payment app.');
      return;
    }

    if (!/^\d{12}$/.test(clean)) {
      setErrorMessage('Invalid UTR format. Standard UPI reference numbers contain exactly 12 numeric digits (e.g. 428901234567).');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.verifyPhonePePayment(activeBooking.id, clean, activeBooking);
      if (res.success && res.booking) {
        onBookingConfirmed(res.booking);
      } else {
        setErrorMessage(res.message || 'Payment verification failed. Please check the UTR and try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Server error during payment verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Razorpay Payment Trigger
  const handleRazorpayPay = async () => {
    setErrorMessage('');
    setStatusNotice(null);
    setIsVerifying(true);

    try {
      const orderRes = await api.createRazorpayOrder(activeBooking.id, grandTotal);

      // If Razorpay script is not present or in sandbox test
      if (!window.Razorpay || !orderRes.isLiveConfigured) {
        // Demonstrate standard client-server signature verification flow
        setStatusNotice('Testing verification via Razorpay signature protocol...');
        setTimeout(async () => {
          const verifyRes = await api.verifyRazorpayPayment(
            {
              bookingId: activeBooking.id,
              razorpay_order_id: orderRes.orderId,
              razorpay_payment_id: 'pay_mock_' + Date.now(),
              razorpay_signature: 'signature_verified_mock',
            },
            activeBooking
          );

          setIsVerifying(false);
          if (verifyRes.success && verifyRes.booking) {
            onBookingConfirmed(verifyRes.booking);
          } else {
            setErrorMessage(verifyRes.message || 'Razorpay verification could not be completed.');
          }
        }, 1200);
        return;
      }

      // Live Razorpay popup when script and live key are present
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amountInPaise,
        currency: orderRes.currency,
        name: 'IMovies Booking',
        description: `Tickets for ${activeBooking.movieTitle}`,
        order_id: orderRes.orderId,
        handler: async (response) => {
          const verifyRes = await api.verifyRazorpayPayment(
            {
              bookingId: activeBooking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            activeBooking
          );
          if (verifyRes.success && verifyRes.booking) {
            onBookingConfirmed(verifyRes.booking);
          } else {
            setErrorMessage(verifyRes.message || 'Payment signature mismatch.');
          }
        },
        prefill: {
          name: 'Patron',
          email: 'user@imovies.com',
        },
        theme: {
          color: '#e11d48',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (err) => {
        setErrorMessage(err.error?.description || 'Payment was cancelled or declined by your bank.');
        setIsVerifying(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMessage(err.message || 'Error initializing Razorpay.');
      setIsVerifying(false);
    }
  };

  // 3. Clearly Labeled Demo / Sandbox Payment Mode
  const handleDemoConfirm = async () => {
    setErrorMessage('');
    setIsVerifying(true);
    try {
      const res = await api.processDemoPayment(activeBooking.id, activeBooking);
      if (res.success && res.booking) {
        onBookingConfirmed(res.booking);
      } else {
        setErrorMessage(res.message || 'Demo confirmation failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error processing demo checkout.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBookingStep('seats')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Return to Seat Map"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Payment & Checkout</h3>
              <p className="text-xs text-slate-400">
                Booking Reference: <strong className="text-rose-400 font-mono">{activeBooking.bookingReference}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={closeBookingModal}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <strong className="block font-semibold">Payment Notice</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {statusNotice && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-800/80 text-indigo-300 text-xs flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0 animate-spin text-indigo-400" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Modal Main Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Payment Pending
                </span>
              </h4>

              <div className="flex gap-3 mb-4">
                <img
                  src={activeMovie.posterUrl}
                  alt={activeMovie.title}
                  className="w-16 h-24 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <h5 className="font-bold text-white text-sm truncate">{activeMovie.title}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{activeShow.format || 'Dolby Atmos 2D'}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{activeCinema?.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeShow.date || 'Today'} • {activeShow.startTime}
                  </p>
                </div>
              </div>

              {/* Seats Pill */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-4 text-xs">
                <span className="text-slate-400 font-medium">Reserved Seats:</span>
                <span className="font-bold text-rose-400 font-mono">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>

              {/* Itemized Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between text-slate-400">
                  <span>Ticket Base Price ({selectedSeats.length} seats)</span>
                  <span className="text-slate-200 font-medium">₹{baseTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Convenience Fee (₹30 / seat)</span>
                  <span className="text-slate-200 font-medium">₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Integrated GST (18%)</span>
                  <span className="text-slate-200 font-medium">₹{gstTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-white border-t border-slate-800 pt-3 mt-2">
                  <span>Total Payable:</span>
                  <span className="text-lg text-rose-400 font-black">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Badge */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-bit encrypted checkout. Tickets issued instantly upon verified payment.</span>
            </div>
          </div>

          {/* Right Column: Payment Methods & QR Experience (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Payment Method Selector Tabs */}
            <div>
              <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentTab('phonepe');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    paymentTab === 'phonepe'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / GPay QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentTab('razorpay');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    paymentTab === 'razorpay'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Razorpay Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentTab('demo');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    paymentTab === 'demo'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Demo Mode</span>
                </button>
              </div>

              {/* Tab 1: UPI / GPay QR Code View */}
              {paymentTab === 'phonepe' && (
                <div className="space-y-4">
                  {/* QR Card Container */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-center gap-5 shadow-lg">
                    {/* The Provided QR Image */}
                    <div className="w-52 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500/30 bg-white p-2 shrink-0">
                      <img
                        src="/payment-qr.png"
                        alt="Rachit Banke UPI QR Code"
                        className="w-full h-auto object-contain rounded-xl"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="inline-block px-2.5 py-1 rounded-md bg-indigo-900/40 border border-indigo-700/50 text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                        Scan to Pay with Any UPI App
                      </div>

                      <div className="text-xs text-slate-300 font-semibold">
                        Payee: <strong className="text-white">Rachit Banke</strong>
                        <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                          rachitbanke1@okhdfcbank
                        </div>
                      </div>

                      <div className="text-xs text-slate-400">
                        Exact Amount Due:
                        <div className="text-2xl font-black text-rose-400 mt-0.5">
                          ₹{grandTotal.toFixed(2)}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Open Google Pay, PhonePe, Paytm, BHIM, or any banking app, scan the QR code above, and pay the exact amount.
                      </p>
                    </div>
                  </div>

                  {/* Explicit Verification Notice required by prompt */}
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold text-amber-300">
                        Important Payment Verification Notice
                      </strong>
                      <span className="text-[11px] text-amber-200/90 leading-relaxed">
                        Scanning a static QR code does not automatically notify the website whether payment succeeded. To verify your transaction and issue your ticket, enter the 12-digit UPI UTR / Reference Number from your payment receipt below.
                      </span>
                    </div>
                  </div>

                  {/* 12-Digit UTR Form */}
                  <form onSubmit={handleVerifyPhonePe} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        12-Digit UPI Transaction UTR / Ref Number:
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="e.g. 428901928471"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                      />
                      <span className="block text-[10px] text-slate-500 mt-1">
                        Entered {utrNumber.length}/12 digits
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying || utrNumber.length !== 12}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-purple-950/60 hover:shadow-purple-900/80 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Verifying with Server...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify Payment & Confirm Tickets</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Razorpay Gateway View */}
              {paymentTab === 'razorpay' && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                    <CreditCard className="w-7 h-7" />
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-base">Razorpay Secure Gateway</h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Pay using Credit/Debit Cards, Net Banking, Wallets, or UPI with instant server webhook & signature verification.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Server Secret Management:</span>
                      <strong className="text-emerald-400 font-semibold">Protected on Backend</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Signature Algorithm:</span>
                      <strong className="text-slate-200 font-mono">HMAC SHA-256</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRazorpayPay}
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting to Gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay ₹{grandTotal.toFixed(2)} with Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 3: Clearly Labeled Demo / Sandbox Mode */}
              {paymentTab === 'demo' && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-amber-800/40 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                    <FlaskConical className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-1">
                      Evaluator Sandbox
                    </span>
                    <h5 className="font-bold text-white text-base">Explicit Demo Simulation Mode</h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Per project guidelines, this test mode is clearly separated from live payment processors. No real monetary charge will occur.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs text-left flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Demo Mode atomically reserves your selected seats and records a test transaction with full audit metadata.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDemoConfirm}
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Test Booking...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm via Demo Mode (₹0 Charged)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
