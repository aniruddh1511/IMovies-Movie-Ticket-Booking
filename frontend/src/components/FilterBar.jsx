import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Thriller', 'Mythology', 'Romance'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Telugu', 'Tamil'];

export const FilterBar = ({
  selectedGenre,
  onGenreSelect,
  selectedLanguage,
  onLanguageSelect,
  activeStatus,
  onStatusChange,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Genre Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Genre:
          </span>
          {GENRES.map((genre) => {
            const isActive = (selectedGenre || 'All') === genre;
            return (
              <button
                key={genre}
                onClick={() => onGenreSelect(genre)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full shrink-0 transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40 scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Right side: Language & Now Showing / Upcoming Switch */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/60 rounded-xl px-2.5 py-1">
            <span className="text-xs text-slate-400 font-medium">Lang:</span>
            <select
              value={selectedLanguage || 'All'}
              onChange={(e) => onLanguageSelect(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-white">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => onStatusChange('now_showing')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeStatus === 'now_showing'
                  ? 'bg-slate-800 text-rose-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => onStatusChange('upcoming')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeStatus === 'upcoming'
                  ? 'bg-slate-800 text-rose-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
