import React from 'react';
import { Award, Star, Info, ChevronRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export const PopularRankingChart = ({ movies = [] }) => {
  const { startMovieBooking } = useBooking();
  const rankedMovies = movies
    .filter((m) => m.sampleRanking != null)
    .sort((a, b) => a.sampleRanking - b.sampleRanking)
    .slice(0, 5);

  if (rankedMovies.length === 0) return null;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl backdrop-blur-md">
      {/* Header with Clear Labeling Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Curated Popular Rankings
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
            <span>Editorial Sample Ranking (Curated benchmark; not real-time streaming metrics)</span>
          </p>
        </div>

        <span className="self-start sm:self-center text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Top 5 Selections
        </span>
      </div>

      {/* Ranked List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {rankedMovies.map((movie, index) => {
          const rank = movie.sampleRanking || index + 1;
          return (
            <div
              key={movie._id || index}
              onClick={() => startMovieBooking(movie)}
              className="group relative flex flex-row md:flex-col items-center md:items-start p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-rose-500/50 hover:bg-slate-800/40 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-rose-950/20"
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 font-black text-lg md:text-xl text-amber-400 shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                #{rank}
              </div>

              {/* Poster thumbnail on small screens */}
              <div className="w-12 h-16 rounded-lg overflow-hidden ml-3 md:ml-0 md:mt-3 md:w-full md:h-36 shrink-0 bg-slate-900">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title & Stats */}
              <div className="ml-3 md:ml-0 md:mt-3 flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                  {movie.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {movie.genres?.slice(0, 2).join(', ')}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {movie.rating?.toFixed(1) || '9.0'}
                  </span>
                  <span className="text-[11px] text-slate-500">•</span>
                  <span className="text-[11px] text-slate-400">
                    ₹{movie.basePrice || 250}
                  </span>
                </div>
              </div>

              {/* Action arrow */}
              <div className="ml-auto md:hidden text-slate-500 group-hover:text-rose-400">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
