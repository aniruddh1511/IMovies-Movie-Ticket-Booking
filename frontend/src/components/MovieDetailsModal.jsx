import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  Calendar,
  MapPin,
  Film,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';
import { api } from '../services/api.js';

export const MovieDetailsModal = () => {
  const {
    activeMovie,
    bookingStep,
    closeBookingModal,
    selectedCity,
    selectShowtime,
  } = useBooking();

  const [cinemas, setCinemas] = useState([]);
  const [loadingShows, setLoadingShows] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Generate 4 calendar dates starting from today
  const dates = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const isoString = d.toISOString().split('T')[0];
    return { offset, dayName, formatted, isoString };
  });

  const currentDate = dates[selectedDateIndex]?.isoString;

  useEffect(() => {
    if (activeMovie) {
      setLoadingShows(true);
      api.getShowsForMovie(activeMovie._id, selectedCity, currentDate).then((res) => {
        setCinemas(res.cinemas || []);
        setLoadingShows(false);
      });
    }
  }, [activeMovie, selectedCity, currentDate]);

  if (bookingStep !== 'details' || !activeMovie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button Top Right */}
        <button
          onClick={closeBookingModal}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Banner Header */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
            <img
              src={activeMovie.bannerUrl || activeMovie.posterUrl}
              alt={activeMovie.title}
              className="w-full h-full object-cover object-center filter brightness-75 contrast-110"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900/40"></div>

            {/* Poster & Main Header Info Overlay */}
            <div className="absolute bottom-4 left-4 sm:left-8 right-4 sm:right-8 flex items-end gap-5">
              <div className="w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-950 shrink-0 hidden xs:block">
                <img
                  src={activeMovie.posterUrl}
                  alt={activeMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {activeMovie.certificate || 'UA'}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {activeMovie.languages?.join(', ')}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md truncate">
                  {activeMovie.title}
                </h2>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 mt-2">
                  <span className="flex items-center gap-1 font-bold text-amber-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {activeMovie.rating?.toFixed(1) || '8.8'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {Math.floor(activeMovie.durationMinutes / 60)}h {activeMovie.durationMinutes % 60}m
                  </span>
                  <span>•</span>
                  <span className="text-slate-300">{activeMovie.genres?.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Showtimes Body */}
          <div className="p-4 sm:p-8 space-y-6">
            {/* Synopsis & Cast */}
            <div className="bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
              <p className="text-sm text-slate-300 leading-relaxed font-normal mb-3">
                {activeMovie.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                {activeMovie.director && (
                  <div>
                    <span className="font-semibold text-slate-300">Director:</span> {activeMovie.director}
                  </div>
                )}
                {activeMovie.cast && (
                  <div>
                    <span className="font-semibold text-slate-300">Starring:</span> {activeMovie.cast.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Date Selector Strip */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Select Date</span>
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cinemas in {selectedCity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {dates.map((d, idx) => {
                  const isSelected = selectedDateIndex === idx;
                  return (
                    <button
                      key={d.isoString}
                      onClick={() => setSelectedDateIndex(idx)}
                      className={`flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/40 font-bold scale-105'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[11px] font-semibold">{d.dayName}</span>
                      <span className="text-sm font-bold mt-0.5">{d.formatted}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theatres and Showtimes List */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                <span>Available Theatres & Timings</span>
              </h4>

              {loadingShows ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <div className="animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Locating verified screens and showtimes in {selectedCity}...
                </div>
              ) : cinemas.length === 0 ? (
                <div className="py-8 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-sm">
                  No showtimes currently scheduled for {activeMovie.title} in {selectedCity} on this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {cinemas.map((cinemaItem) => {
                    const cinema = cinemaItem.cinema || cinemaItem;
                    const shows = cinemaItem.shows || [];

                    return (
                      <div
                        key={cinema.id || cinema._id}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all"
                      >
                        {/* Cinema Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <h5 className="font-bold text-white text-base">{cinema.name}</h5>
                            <p className="text-xs text-slate-400">{cinema.address}</p>
                          </div>

                          {cinema.facilities && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {cinema.facilities.slice(0, 3).map((f) => (
                                <span
                                  key={f}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Showtimes Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
                          {shows.map((show) => (
                            <button
                              key={show.id || show._id}
                              onClick={() => selectShowtime(cinema, show)}
                              className="group relative flex flex-col items-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-rose-500 hover:bg-rose-950/20 transition-all text-center"
                            >
                              <span className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                                {show.startTime}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-300 mt-0.5">
                                {show.format || 'Dolby Atmos 2D'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
