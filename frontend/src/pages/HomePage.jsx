import React, { useState, useEffect } from 'react';
import { FeaturedBanner } from '../components/FeaturedBanner.jsx';
import { PopularRankingChart } from '../components/PopularRankingChart.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { MovieCard } from '../components/MovieCard.jsx';
import { api } from '../services/api.js';
import { Film, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export const HomePage = ({ searchTerm }) => {
  const { selectedCity } = useBooking();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [activeStatus, setActiveStatus] = useState('now_showing');

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.getMovies({
        search: searchTerm,
        genre: selectedGenre,
        language: selectedLanguage,
        status: activeStatus,
      });
      if (res.success && res.movies) {
        setMovies(res.movies);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [searchTerm, selectedGenre, selectedLanguage, activeStatus]);

  return (
    <div className="w-full">
      {/* 1. Cinematic Featured Hero Spotlight */}
      {!searchTerm && <FeaturedBanner movies={movies} />}

      {/* 2. Popular Movies Curated Ranking Chart (Sample labeled) */}
      {!searchTerm && <PopularRankingChart movies={movies} />}

      {/* 3. Filter Bar (Genres, Languages, Now Showing / Upcoming) */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-rose-500" />
            <span>
              {activeStatus === 'now_showing' ? 'Now Showing in Theatres' : 'Upcoming Blockbusters'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing curated releases available in {selectedCity}
          </p>
        </div>

        <button
          onClick={fetchMovies}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh Catalog"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <FilterBar
        selectedGenre={selectedGenre}
        onGenreSelect={setSelectedGenre}
        selectedLanguage={selectedLanguage}
        onLanguageSelect={setSelectedLanguage}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />

      {/* 4. Movie Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Curating movies for {selectedCity}...
        </div>
      ) : movies.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-md mx-auto my-8">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No movies matched your filters</h3>
          <p className="text-xs text-slate-400 mb-4">
            Try adjusting your search terms, changing the genre or language filter, or switching between Now Showing and Upcoming.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSelectedLanguage('All');
              setActiveStatus('now_showing');
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};
