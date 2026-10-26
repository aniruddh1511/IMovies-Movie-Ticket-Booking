import React from 'react';
import {
  CheckCircle2,
  Ticket,
  Printer,
  Sparkles,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Film,
  ArrowRight,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export const BookingSuccessModal = () => {
  const {
    bookingStep,
    confirmedTicket,
    closeBookingModal,
    setCurrentView,
  } = useBooking();

  if (bookingStep !== 'success' || !confirmedTicket) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleViewTickets = () => {
    closeBookingModal();
    setCurrentView('tickets');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 my-auto overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/50 animate-bounce-subtle">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Booking Confirmed!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Your payment was verified and seats are secured. We’ve saved your e-ticket.
          </p>
        </div>

        {/* Digital Boarding Pass / Ticket Card */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl mb-6">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-rose-900/60 to-purple-900/60 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">IMovies E-Ticket</span>
            </div>
            <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-950/80 text-rose-400 border border-rose-500/40">
              {confirmedTicket.bookingReference || 'IMV-XXXX'}
            </span>
          </div>

          {/* Ticket Body */}
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-lg font-black text-white leading-tight">
                  {confirmedTicket.movieTitle}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {confirmedTicket.format || 'Dolby Atmos 2D'}
                </p>
              </div>

              {/* QR Ticket Code Graphic */}
              <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center shadow-md">
                <QrCode className="w-14 h-14 text-slate-950" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-800/80 py-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cinema & Hall</span>
                <span className="font-semibold text-slate-200 line-clamp-1">{confirmedTicket.cinemaName}</span>
                <span className="text-slate-400 text-[11px] block">{confirmedTicket.cinemaCity}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Date & Time</span>
                <span className="font-semibold text-slate-200">{confirmedTicket.showDate}</span>
                <span className="text-rose-400 text-[11px] block font-bold">{confirmedTicket.showTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Seats</span>
                <span className="text-base font-black text-rose-400 font-mono">
                  {Array.isArray(confirmedTicket.seats)
                    ? confirmedTicket.seats.map((s) => (typeof s === 'object' ? s.seatNumber : s)).join(', ')
                    : confirmedTicket.seats}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Paid</span>
                <span className="text-base font-black text-white">
                  ₹{Number(confirmedTicket.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Perforated ticket punch holes */}
          <div className="absolute left-0 top-[70%] -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border border-slate-800"></div>
          <div className="absolute right-0 top-[70%] translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border border-slate-800"></div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save E-Ticket</span>
          </button>

          <button
            onClick={handleViewTickets}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all"
          >
            <span>Go to My Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
