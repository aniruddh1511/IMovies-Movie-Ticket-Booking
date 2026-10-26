import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useBooking } from '../context/BookingContext.jsx';

export const ProfilePage = () => {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const { setCurrentView } = useBooking();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthenticated || !user) {
    return (
      <div className="py-20 text-center text-slate-400">
        Please sign in to access your profile.
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email cannot be left blank.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile(name, email, phone);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    setCurrentView('home');
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      {/* Back button */}
      <button
        onClick={() => setCurrentView('home')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Discovery</span>
      </button>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white uppercase shadow-lg shadow-rose-950/50">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              Role: {user.role || 'Member'}
            </span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Edit Profile Form */}
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Your confirmed booking invoices and QR tickets are dispatched to this address.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 font-semibold text-xs border border-rose-900/40 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
