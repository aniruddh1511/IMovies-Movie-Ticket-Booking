import React from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

const CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', cinemasCount: 18 },
  { name: 'Delhi-NCR', state: 'National Capital Region', cinemasCount: 24 },
  { name: 'Bengaluru', state: 'Karnataka', cinemasCount: 16 },
  { name: 'Hyderabad', state: 'Telangana', cinemasCount: 14 },
  { name: 'Chennai', state: 'Tamil Nadu', cinemasCount: 12 },
  { name: 'Kolkata', state: 'West Bengal', cinemasCount: 10 },
  { name: 'Pune', state: 'Maharashtra', cinemasCount: 9 },
  { name: 'Ahmedabad', state: 'Gujarat', cinemasCount: 8 },
];

export const CitySelectorModal = () => {
  const { selectedCity, setSelectedCity, cityModalOpen, setCityModalOpen } = useBooking();

  if (!cityModalOpen) return null;

  const handleSelect = (cityName) => {
    setSelectedCity(cityName);
    setCityModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Select Your City</h3>
              <p className="text-xs text-slate-400">Discover showtimes & theatres near you</p>
            </div>
          </div>

          <button
            onClick={() => setCityModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {CITIES.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.name}
                onClick={() => handleSelect(city.name)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-950/30 font-semibold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white">{city.name}</div>
                  <div className="text-[11px] text-slate-500">{city.cinemasCount} Theatres</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-rose-500" />}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Showtimes, seat pricing, and multiplex formats adapt dynamically to your selected region.
          </p>
        </div>
      </div>
    </div>
  );
};
