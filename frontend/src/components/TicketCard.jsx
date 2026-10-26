import React from 'react';
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Film,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const TicketCard = ({ booking, onResumePayment }) => {
  const isConfirmed = booking.status === 'confirmed';
  const seatsFormatted = Array.isArray(booking.seats)
    ? booking.seats.map((s) => (typeof s === 'object' ? s.seatNumber : s)).join(', ')
    : booking.seats;

  return (
    <div
      className={`relative rounded-3xl bg-slate-900 border transition-all overflow-hidden shadow-xl ${
        isConfirmed
          ? 'border-slate-800 hover:border-slate-700'
          : 'border-amber-800/60 bg-amber-950/10'
      }`}
    >
      {/* Top Banner with Status Badge */}
      <div
        className={`px-6 py-3 flex items-center justify-between border-b ${
          isConfirmed
            ? 'bg-gradient-to-r from-slate-950 to-slate-900 border-slate-800'
            : 'bg-amber-950/40 border-amber-900/60'
        }`}
      >
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-mono font-bold text-slate-300">
            REF: <strong className="text-white">{booking.bookingReference || 'IMV-XXXX'}</strong>
          </span>
        </div>

        {/* Clear status distinction per prompt */}
        {isConfirmed ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Payment Pending
          </span>
        )}
      </div>

      {/* Main Ticket Content */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
          <div className="flex gap-4">
            {booking.moviePoster && (
              <img
                src={booking.moviePoster}
                alt={booking.movieTitle}
                className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
              />
            )}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {booking.movieTitle}
              </h3>
              <p className="text-xs text-rose-400 font-semibold mt-0.5">
                {booking.format || 'Dolby Atmos 2D'}
              </p>

              <div className="mt-3 space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-200">{booking.cinemaName}</span>
                  <span className="text-slate-400">({booking.cinemaCity})</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {booking.showDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    {booking.showTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Ticket Stamp: QR Code or Pending Pay Button */}
          <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            {isConfirmed ? (
              <div className="flex sm:flex-col items-center sm:items-end gap-3">
                <div className="bg-white p-1.5 rounded-xl shadow-md border border-slate-200">
                  <QrCode className="w-14 h-14 text-slate-950" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:block">
                  Scan at Hall Entry
                </span>
              </div>
            ) : (
              <div className="space-y-2 text-right">
                <p className="text-xs text-amber-400">Awaiting payment verification</p>
                {onResumePayment && (
                  <button
                    onClick={() => onResumePayment(booking)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Complete Payment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Details Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Reserved Seats:</span>
            <span className="font-mono text-sm font-bold text-rose-400">
              {seatsFormatted || 'Not assigned'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Payment Method:</span>
            <span className="font-semibold text-slate-200 uppercase text-[11px]">
              {booking.paymentMethod?.replace('_', ' ') || 'UPI / QR'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Total Paid:</span>
            <span className="text-base font-black text-white">
              ₹{Number(booking.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
