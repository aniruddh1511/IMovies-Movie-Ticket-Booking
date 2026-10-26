import React from 'react';
import { Star, Clock, Ticket, Award } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export const MovieCard = ({ movie }) => {
  const { startMovieBooking } = useBooking();

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden hover:border-slate-700/80 hover:shadow-2xl hover:shadow-rose-950/20 transition-all duration-300">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient shadow at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity"></div>

        {/* Certificate Pill Top Left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-950/80 text-slate-200 border border-slate-700/70 backdrop-blur-md">
            {movie.certificate || 'UA'}
          </span>
          {movie.sampleRanking && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1">
              <Award className="w-3 h-3" />
              #{movie.sampleRanking}
            </span>
          )}
        </div>

        {/* Rating Badge Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-800 text-amber-300 backdrop-blur-md shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold">{movie.rating?.toFixed(1) || '8.8'}</span>
        </div>

        {/* Languages Strip on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
          <span className="font-medium bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-800">
            {movie.languages?.slice(0, 2).join(', ')}
            {movie.languages?.length > 2 && ` +${movie.languages.length - 2}`}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
          </span>
        </div>
      </div>

      {/* Movie Details Bottom Panel */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-rose-400 transition-colors line-clamp-1 mb-1">
            {movie.title}
          </h3>

          {/* Genres */}
          <p className="text-xs text-slate-400 line-clamp-1 mb-3">
            {movie.genres?.join(' • ')}
          </p>
        </div>

        {/* Footer info & Book Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-slate-500">Tickets from</span>
            <span className="text-sm font-bold text-rose-400">₹{movie.basePrice || 250}</span>
          </div>

          <button
            onClick={() => startMovieBooking(movie)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-rose-950/40 hover:shadow-rose-900/60 active:scale-95 transition-all"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
};
