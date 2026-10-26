import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const SeatMapModal = () => {
  const {
    activeMovie,
    activeCinema,
    activeShow,
    bookingStep,
    setBookingStep,
    selectedSeats,
    toggleSeat,
    proceedToCheckout,
    baseTotal,
    convenienceFee,
    gstTax,
    grandTotal,
    closeBookingModal,
  } = useBooking();

  const { isAuthenticated, openAuthModal } = useAuth();

  const [seatLayout, setSeatLayout] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(true);

  useEffect(() => {
    if (activeShow) {
      setLoadingSeats(true);
      api.getShowSeats(activeShow.id).then((res) => {
        if (res.success && res.seatLayout) {
          setSeatLayout(res.seatLayout);
        }
        setLoadingSeats(false);
      });
    }
  }, [activeShow]);

  if (bookingStep !== 'seats' || !activeMovie || !activeShow) return null;

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to continue.');
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }

    proceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBookingStep('details')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Back to Details"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{activeMovie.title}</span>
                <span className="text-xs font-normal text-slate-400">({activeShow.format || 'Dolby Atmos'})</span>
              </h3>
              <p className="text-xs text-slate-400">
                {activeCinema?.name} • {activeShow.startTime}
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

        {/* Seat Legend */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-rose-600 shadow-sm shadow-rose-900/50"></div>
            <span className="text-rose-400 font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-slate-950 border border-slate-800/80 text-slate-600 line-through"></div>
            <span className="text-slate-500">Booked</span>
          </div>
        </div>

        {/* Scrollable Auditorium Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          {/* Curved Cinema Screen */}
          <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
            <div className="w-full h-2.5 rounded-t-[50%] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_6px_25px_rgba(34,211,238,0.4)]"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400/80 mt-2">
              All eyes this way • Screen
            </span>
          </div>

          {loadingSeats ? (
            <div className="py-16 text-center text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              Loading auditorium seating layout...
            </div>
          ) : !seatLayout ? (
            <div className="text-slate-400">Seating layout currently unavailable.</div>
          ) : (
            <div className="w-full max-w-3xl space-y-8">
              {seatLayout.tiers.map((tier) => {
                const tierSeats = seatLayout.seats.filter((s) => s.tier === tier.tierName);
                const uniqueRows = Array.from(new Set(tierSeats.map((s) => s.row)));

                return (
                  <div key={tier.tierName} className="space-y-3">
                    {/* Tier Name & Price Badge */}
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 text-xs">
                      <span className="font-bold text-slate-300 tracking-wide uppercase">
                        {tier.tierName} Tier
                      </span>
                      <span className="font-bold text-rose-400">₹{tier.price}</span>
                    </div>

                    {/* Rows in this tier */}
                    <div className="space-y-2">
                      {uniqueRows.map((rowLetter) => {
                        const rowSeats = tierSeats.filter((s) => s.row === rowLetter);

                        return (
                          <div key={rowLetter} className="flex items-center justify-center gap-1.5 sm:gap-2">
                            {/* Row Label */}
                            <span className="w-5 text-center text-xs font-bold text-slate-400">
                              {rowLetter}
                            </span>

                            {/* Seats in Row with Aisle Separators */}
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              {rowSeats.map((seat, seatIdx) => {
                                const isSelected = selectedSeats.some(
                                  (s) => s.seatNumber === seat.seatNumber
                                );
                                const isBooked = seat.isBooked;

                                // Insert aisle space after seat 4 and seat 8
                                const hasAisleAfter = seat.column === 4 || seat.column === 8;

                                return (
                                  <React.Fragment key={seat.seatNumber}>
                                    <button
                                      type="button"
                                      disabled={isBooked}
                                      onClick={() => toggleSeat(seat)}
                                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all ${
                                        isSelected
                                          ? 'bg-rose-600 text-white shadow-md shadow-rose-900/60 scale-105 font-bold ring-2 ring-rose-400'
                                          : isBooked
                                          ? 'bg-slate-950/70 border border-slate-800 text-slate-600 cursor-not-allowed line-through'
                                          : 'bg-slate-800 border border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white'
                                      }`}
                                      title={`Seat ${seat.seatNumber} • ₹${seat.price} (${tier.tierName})`}
                                    >
                                      {seat.column}
                                    </button>

                                    {hasAisleAfter && (
                                      <div className="w-3 sm:w-5"></div>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            <span className="w-5 text-center text-xs font-bold text-slate-400">
                              {rowLetter}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Booking Summary & Action Bar */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Selected Seats:</span>
              <span className="text-sm font-bold text-white">
                {selectedSeats.length > 0
                  ? selectedSeats.map((s) => s.seatNumber).join(', ')
                  : 'None selected'}
              </span>
              {selectedSeats.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Base: ₹{baseTotal} + Convenience fee & GST: ₹{(convenienceFee + gstTax).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Total Price</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400">₹{grandTotal}</span>
            </div>

            <button
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 active:scale-95 transition-all"
            >
              <span>{isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
