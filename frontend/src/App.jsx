import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookingProvider, useBooking } from './context/BookingContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { MyTicketsPage } from './pages/MyTicketsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

import { CitySelectorModal } from './components/CitySelectorModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { MovieDetailsModal } from './components/MovieDetailsModal.jsx';
import { SeatMapModal } from './components/SeatMapModal.jsx';
import { CheckoutModal } from './components/CheckoutModal.jsx';
import { BookingSuccessModal } from './components/BookingSuccessModal.jsx';

const MainLayout = () => {
  const { currentView } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');

  // Synchronize address bar URL to /imovies
  useEffect(() => {
    try {
      if (window.location.protocol.startsWith('http')) {
        if (!window.location.pathname.includes('imovies')) {
          window.history.replaceState(null, '', '/imovies/' + window.location.search);
        }
      }
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Sticky Navbar */}
      <Navbar onSearchChange={setSearchTerm} searchTerm={searchTerm} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentView === 'home' && <HomePage searchTerm={searchTerm} />}
        {currentView === 'tickets' && <MyTicketsPage />}
        {currentView === 'profile' && <ProfilePage />}
        {currentView === 'admin' && <AdminPage />}
      </main>

      {/* Persistent Global Modals (In-App, No New Tabs) */}
      <CitySelectorModal />
      <AuthModal />
      <MovieDetailsModal />
      <SeatMapModal />
      <CheckoutModal />
      <BookingSuccessModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainLayout />
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
