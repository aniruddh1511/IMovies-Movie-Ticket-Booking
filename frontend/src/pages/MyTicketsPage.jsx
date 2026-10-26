import React, { useState, useEffect } from 'react';
import { Ticket, Search, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { TicketCard } from '../components/TicketCard.jsx';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';

export const MyTicketsPage = () => {
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const { setCurrentView } = useBooking();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'confirmed' | 'pending'

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Sign in to view your tickets</h2>
        <p className="text-xs text-slate-400 mb-6">
          Access your confirmed cinema passes, booking reference codes, seat reservations, and payment receipts.
        </p>
        <button
          onClick={() => openAuthModal('signin')}
          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/60 transition-all"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'confirmed') return b.status === 'confirmed';
    if (filterTab === 'pending') return b.status !== 'confirmed';
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-rose-500" />
            <span>My Bookings & E-Tickets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Signed in as <strong className="text-slate-200">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterTab === 'all'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterTab('confirmed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterTab === 'confirmed'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterTab === 'pending'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({bookings.filter((b) => b.status !== 'confirmed').length})
            </button>
          </div>

          <button
            onClick={fetchBookings}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Retrieving your tickets...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-slate-900/40 border border-slate-800 text-center max-w-md mx-auto">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No bookings found</h3>
          <p className="text-xs text-slate-400 mb-6">
            {filterTab === 'all'
              ? 'You have not booked any movie tickets yet. Discover now-showing releases and reserve your preferred seats.'
              : `No ${filterTab} tickets found in your transaction history.`}
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Browse Movies & Book Now
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((b) => (
            <TicketCard key={b.id || b._id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
};
