import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [cityModalOpen, setCityModalOpen] = useState(false);

  // In-app booking flow state
  // steps: 'none' | 'details' | 'seats' | 'checkout' | 'success'
  const [bookingStep, setBookingStep] = useState('none');
  const [activeMovie, setActiveMovie] = useState(null);
  const [activeCinema, setActiveCinema] = useState(null);
  const [activeShow, setActiveShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Navigation tabs
  // 'home' | 'tickets' | 'profile' | 'admin'
  const [currentView, setCurrentView] = useState('home');

  // Start booking flow for a movie
  const startMovieBooking = (movie) => {
    setActiveMovie(movie);
    setActiveCinema(null);
    setActiveShow(null);
    setSelectedSeats([]);
    setActiveBooking(null);
    setBookingStep('details');
  };

  // Select showtime & advance to Seat Map
  const selectShowtime = (cinema, show) => {
    setActiveCinema(cinema);
    setActiveShow(show);
    setSelectedSeats([]);
    setBookingStep('seats');
  };

  // Toggle seat selection
  const toggleSeat = (seat) => {
    if (seat.isBooked) return;

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatNumber === seat.seatNumber);
      if (exists) {
        return prev.filter((s) => s.seatNumber !== seat.seatNumber);
      } else {
        // Limit max 8 tickets per booking
        if (prev.length >= 8) {
          alert('You can select up to 8 seats per transaction.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  // Pricing calculations
  const baseTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length * 30;
  const gstTax = Number((convenienceFee * 0.18).toFixed(2));
  const grandTotal = Number((baseTotal + convenienceFee + gstTax).toFixed(2));

  // Proceed from seats to checkout
  const proceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat before continuing.');
      return false;
    }

    const res = await api.createBookingIntent({
      showId: activeShow.id,
      seats: selectedSeats,
      movie: activeMovie,
      cinema: activeCinema,
      showDetails: activeShow,
    });

    if (res.success && res.booking) {
      setActiveBooking(res.booking);
      setBookingStep('checkout');
      return true;
    } else {
      alert(res.message || 'Unable to reserve seats. Please retry.');
      return false;
    }
  };

  // Finish confirmation
  const onBookingConfirmed = (confirmedBooking) => {
    setConfirmedTicket(confirmedBooking);
    setBookingStep('success');
  };

  // Close booking modal completely
  const closeBookingModal = () => {
    setBookingStep('none');
    setActiveMovie(null);
    setActiveCinema(null);
    setActiveShow(null);
    setSelectedSeats([]);
    setActiveBooking(null);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        cityModalOpen,
        setCityModalOpen,
        currentView,
        setCurrentView,
        bookingStep,
        setBookingStep,
        activeMovie,
        activeCinema,
        activeShow,
        selectedSeats,
        activeBooking,
        confirmedTicket,
        baseTotal,
        convenienceFee,
        gstTax,
        grandTotal,
        startMovieBooking,
        selectShowtime,
        toggleSeat,
        proceedToCheckout,
        onBookingConfirmed,
        closeBookingModal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
