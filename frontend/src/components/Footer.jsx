import React from 'react';
import { Film, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export const Footer = () => {
  const { setSelectedCity, setCityModalOpen } = useBooking();

  const cities = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 mt-20 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                I<span className="text-rose-500">MOVIES</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              IMovies delivers an uncompromising cinematic ticket-booking journey with real-time seat availability, PhonePe UPI QR verification, and multi-format screen scheduling across major metropolitan cinemas.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>PCI-DSS Compliant • 256-bit Secure Gateway Integration</span>
            </div>
          </div>

          {/* Supported Metropolitan Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Active Cities
            </h4>
            <ul className="space-y-2 text-xs">
              {cities.map((city) => (
                <li key={city}>
                  <button
                    onClick={() => {
                      setSelectedCity(city);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Cinemas in {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              MERN Platform Stack
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• React 18 + Vite Frontend</li>
              <li>• Tailwind CSS Cinematic Theme</li>
              <li>• Node.js & Express REST API</li>
              <li>• MongoDB & Mongoose ORM</li>
              <li>• PhonePe UPI QR + Razorpay</li>
              <li>• JWT Session Authentication</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} IMovies Entertainment Systems. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted for premium movie enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};
