import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Cinema from '../models/Cinema.js';
import User from '../models/User.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const totalUsers = await User.countDocuments();

    // Calculate total confirmed revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    return res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        totalShows,
        totalBookings,
        confirmedBookings,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalUsers,
      },
      recentBookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin metrics.',
    });
  }
};

export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Movie added successfully!',
      movie,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully.',
      movie,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    // Delete associated shows
    await Show.deleteMany({ movie: id });

    return res.status(200).json({
      success: true,
      message: 'Movie and associated shows deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createShow = async (req, res) => {
  try {
    const show = await Show.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully!',
      show,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('user', 'name email phone');

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
