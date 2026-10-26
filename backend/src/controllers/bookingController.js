import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Payment from '../models/Payment.js';

export const createBookingIntent = async (req, res) => {
  try {
    const { showId, seats, paymentMethod = 'phonepe_qr' } = req.body;
    const userId = req.user._id;

    if (!showId) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID is required.',
      });
    }

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat before continuing.',
      });
    }

    const requestedSeatNumbers = seats.map((s) => s.seatNumber);

    // Fetch show to check seat availability with server-side validation
    const show = await Show.findById(showId)
      .populate('movie')
      .populate('cinema');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    // Check if any requested seat is already booked
    const alreadyBooked = requestedSeatNumbers.some((seat) =>
      show.bookedSeats.includes(seat)
    );

    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: 'One or more of the selected seats have already been booked by another user. Please choose different seats.',
      });
    }

    // Calculate total pricing on server (never trust client total)
    let baseAmount = 0;
    const tierMap = {};
    (show.tiers || []).forEach((t) => {
      t.rows.forEach((r) => {
        tierMap[r] = { tier: t.tierName, price: t.price };
      });
    });

    const validatedSeats = seats.map((seat) => {
      const row = seat.seatNumber.charAt(0);
      const tierInfo = tierMap[row] || { tier: 'Prime', price: 280 };
      baseAmount += tierInfo.price;
      return {
        seatNumber: seat.seatNumber,
        tier: tierInfo.tier,
        price: tierInfo.price,
      };
    });

    // Convenience fee & GST (18% on convenience fee)
    const convenienceFee = 30 * validatedSeats.length;
    const taxAmount = Number((convenienceFee * 0.18).toFixed(2));
    const totalAmount = Number((baseAmount + convenienceFee + taxAmount).toFixed(2));

    const bookingRef = Booking.generateBookingRef();

    // Create Booking with status 'pending_payment'
    const booking = await Booking.create({
      bookingReference: bookingRef,
      user: userId,
      show: show._id,
      movieTitle: show.movie.title,
      moviePoster: show.movie.posterUrl,
      cinemaName: show.cinema.name,
      cinemaCity: show.cinema.city,
      screenNumber: show.screenNumber,
      format: show.format,
      showDate: show.date,
      showTime: show.startTime,
      seats: validatedSeats,
      baseAmount,
      convenienceFee,
      taxAmount,
      totalAmount,
      status: 'pending_payment',
      paymentMethod,
    });

    // Create associated Payment record with status 'pending'
    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      amount: totalAmount,
      currency: 'INR',
      provider: paymentMethod,
      status: 'pending',
    });

    booking.paymentId = payment._id;
    await booking.save();

    return res.status(201).json({
      success: true,
      message: 'Booking initiated. Please complete your payment.',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        movieTitle: booking.movieTitle,
        cinemaName: booking.cinemaName,
        cinemaCity: booking.cinemaCity,
        showDate: booking.showDate,
        showTime: booking.showTime,
        seats: booking.seats,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing booking intent.',
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all bookings for the authenticated user only
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('paymentId');

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b._id,
        bookingReference: b.bookingReference,
        movieTitle: b.movieTitle,
        moviePoster: b.moviePoster,
        cinemaName: b.cinemaName,
        cinemaCity: b.cinemaCity,
        screenNumber: b.screenNumber,
        format: b.format,
        showDate: b.showDate,
        showTime: b.showTime,
        seats: b.seats.map((s) => s.seatNumber),
        totalAmount: b.totalAmount,
        status: b.status,
        paymentMethod: b.paymentMethod,
        confirmedAt: b.confirmedAt,
        createdAt: b.createdAt,
        isConfirmed: b.status === 'confirmed',
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user bookings.',
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: id, user: userId }).populate('paymentId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you are not authorized to view it.',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    // Release seats from show
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { $in: seatNumbers } },
    });

    booking.status = 'cancelled';
    await booking.save();

    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, {
        status: 'cancelled',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
