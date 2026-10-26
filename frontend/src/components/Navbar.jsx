import React, { useState } from 'react';
import {
  Film,
  MapPin,
  Search,
  User,
  Ticket,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';

export const Navbar = ({ onSearchChange, searchTerm }) => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { selectedCity, setCityModalOpen, currentView, setCurrentView } = useBooking();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:scale-105 transition-transform duration-200">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                  I<span className="text-rose-500">MOVIES</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-widest uppercase text-slate-400 -mt-1">
                  Cinematic Booking
                </span>
              </div>
            </button>

            {/* City Selector Pill */}
            <button
              onClick={() => setCityModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-inner"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies, genres, actors or directors..."
                value={searchTerm || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Nav Links & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'home'
                  ? 'text-white bg-slate-900 border border-slate-800'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Movies
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('signin');
                } else {
                  setCurrentView('tickets');
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'tickets'
                  ? 'text-white bg-slate-900 border border-slate-800'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4 text-rose-500" />
              <span>My Tickets</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  currentView === 'admin'
                    ? 'text-amber-400 bg-amber-950/40 border border-amber-800/60'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}

            {/* Auth Button or Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800/70">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Administrator
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('tickets');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4 text-slate-400" />
                      My Booked Tickets
                    </button>

                    <div className="border-t border-slate-800/70 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 rounded-xl shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setCityModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300"
            >
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>{selectedCity}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              />
            </div>
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-900 text-slate-200"
            >
              Movies Discovery
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) openAuthModal('signin');
                else setCurrentView('tickets');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-900 text-slate-200 flex items-center justify-between"
            >
              <span>My Tickets</span>
              <Ticket className="w-4 h-4 text-rose-500" />
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-900 text-slate-200"
                >
                  My Profile ({user?.name})
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setCurrentView('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-sm font-medium rounded-lg hover:bg-slate-900 text-amber-400"
                  >
                    Admin Console
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-sm font-medium text-rose-400 hover:bg-rose-950/20 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-rose-600 rounded-xl"
              >
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
