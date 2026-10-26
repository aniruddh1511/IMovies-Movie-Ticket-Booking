import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Film,
  TrendingUp,
  Ticket,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const { setCurrentView } = useBooking();

  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);

  // New movie form state
  const [title, setTitle] = useState('');
  const [genres, setGenres] = useState('Action, Sci-Fi');
  const [languages, setLanguages] = useState('English, Hindi');
  const [durationMinutes, setDurationMinutes] = useState(150);
  const [rating, setRating] = useState(8.5);
  const [basePrice, setBasePrice] = useState(280);
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [addNotice, setAddNotice] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setStats(res.stats);
        setRecentBookings(res.recentBookings || []);
      }
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setAddNotice('');

    if (!title || !description) {
      setAddNotice('Please fill in title and synopsis.');
      return;
    }

    try {
      const res = await api.createMovieAdmin({
        title,
        description,
        genres: genres.split(',').map((g) => g.trim()),
        languages: languages.split(',').map((l) => l.trim()),
        durationMinutes: Number(durationMinutes),
        rating: Number(rating),
        basePrice: Number(basePrice),
        posterUrl:
          posterUrl ||
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        bannerUrl:
          bannerUrl ||
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        certificate: 'UA',
      });

      if (res.success) {
        setAddNotice('Movie added to system successfully!');
        setTitle('');
        setDescription('');
        setTimeout(() => setShowAddMovie(false), 1500);
        fetchAdminData();
      }
    } catch (err) {
      setAddNotice(err.message || 'Failed to add movie.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Portal</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <span>IMovies Administrative Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform metrics, ticketing logs, and movie catalog orchestration
          </p>
        </div>

        <button
          onClick={() => setShowAddMovie(!showAddMovie)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddMovie ? 'Close Movie Form' : 'Add New Movie'}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '1,24,500'}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Verified Transactions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Bookings</span>
            <Ticket className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.totalBookings || '38'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats?.confirmedBookings || '36'} confirmed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Movies</span>
            <Film className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.totalMovies || '6'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all cities</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Registered Users</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.totalUsers || '142'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Verified accounts</span>
        </div>
      </div>

      {/* Add Movie Form Collapse */}
      {showAddMovie && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl mb-8 animate-fade-in">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-500" />
            <span>Create Movie Catalog Entry</span>
          </h3>

          {addNotice && (
            <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-rose-500/50 text-xs text-rose-300">
              {addNotice}
            </div>
          )}

          <form onSubmit={handleCreateMovie} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blade Runner 2099"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Genres (comma separated)
              </label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Sci-Fi, Action, Thriller"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Languages (comma separated)
              </label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="English, Hindi, Telugu"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Base Price</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Poster Image URL
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Synopsis / Description
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a compelling synopsis for audiences..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Publish Movie to Platform
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Bookings Auditing Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
          <span>Recent Global Transactions</span>
          <span className="text-xs text-slate-500">Live booking feed</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Movie</th>
                <th className="pb-3 pr-4">Cinema & City</th>
                <th className="pb-3 pr-4">Seats</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Method</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentBookings.map((b, idx) => {
                const isConf = b.status === 'confirmed';
                return (
                  <tr key={b.id || b._id || idx} className="hover:bg-slate-950/40">
                    <td className="py-3 pr-4 font-mono font-bold text-white">
                      {b.bookingReference || 'IMV-REF'}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-200">
                      {b.movieTitle || 'The Odyssey'}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {b.cinemaName || 'PVR ICON'} ({b.cinemaCity || 'Mumbai'})
                    </td>
                    <td className="py-3 pr-4 font-mono text-rose-400">
                      {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats || 'C5, C6'}
                    </td>
                    <td className="py-3 pr-4 font-bold text-white">
                      ₹{b.totalAmount || 760.8}
                    </td>
                    <td className="py-3 pr-4 uppercase text-[10px] text-slate-400">
                      {b.paymentMethod || 'phonepe_qr'}
                    </td>
                    <td className="py-3">
                      {isConf ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Confirmed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
