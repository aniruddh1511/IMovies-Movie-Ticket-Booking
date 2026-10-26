import React, { useState, useEffect } from 'react';
import { Star, Clock, Ticket, ChevronRight, Play, Award, Sparkles } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export const FeaturedBanner = ({ movies = [] }) => {
  const { startMovieBooking } = useBooking();
  const featuredMovies = movies.filter((m) => m.isFeatured);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate featured movies every 7 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  if (!featuredMovies.length) return null;

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-12 border border-slate-800/80 shadow-2xl bg-slate-900 group">
      {/* Background Banner with Layered Gradients */}
      <div className="relative h-[480px] sm:h-[520px] md:h-[560px] w-full overflow-hidden">
        <img
          src={currentMovie.bannerUrl || currentMovie.posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 ease-out group-hover:scale-100 filter brightness-75 contrast-110"
        />

        {/* Gradient overlays for cinematic contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950"></div>
      </div>

      {/* Banner Content */}
      <div className="absolute inset-0 p-6 sm:p-10 md:p-14 flex flex-col justify-end max-w-3xl z-10">
        {/* Spotlight Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Spotlight Premiere
          </span>
          {currentMovie.sampleRanking && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              Editor Rank #{currentMovie.sampleRanking}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3 drop-shadow-md">
          {currentMovie.title}
        </h1>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-300 mb-4">
          <div className="flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 text-amber-300 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{currentMovie.rating?.toFixed(1) || '9.0'}</span>
            <span className="text-slate-400 font-normal">
              ({currentMovie.votesCount ? `${(currentMovie.votesCount / 1000).toFixed(1)}k` : '30k+'})
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {Math.floor(currentMovie.durationMinutes / 60)}h {currentMovie.durationMinutes % 60}m
            </span>
          </div>

          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700">
            {currentMovie.certificate || 'UA'}
          </span>

          <span className="text-slate-400">
            {currentMovie.languages?.join(', ')}
          </span>
        </div>

        {/* Synopsis */}
        <p className="text-sm sm:text-base text-slate-300/90 line-clamp-2 sm:line-clamp-3 mb-6 max-w-2xl font-normal leading-relaxed">
          {currentMovie.description}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => startMovieBooking(currentMovie)}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-950/60 hover:shadow-rose-900/80 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <Ticket className="w-5 h-5" />
            <span>Book tickets</span>
            <ChevronRight className="w-4 h-4 -mr-1" />
          </button>

          <button
            onClick={() => startMovieBooking(currentMovie)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-slate-700/80 backdrop-blur-md transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>View Details & Times</span>
          </button>
        </div>
      </div>

      {/* Featured Switcher Indicators */}
      {featuredMovies.length > 1 && (
        <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
          {featuredMovies.map((m, idx) => (
            <button
              key={m._id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 transition-all rounded-full ${
                currentIndex === idx
                  ? 'w-6 bg-rose-500'
                  : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              title={m.title}
            />
          ))}
        </div>
      )}
    </div>
  );
};
