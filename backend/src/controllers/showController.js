import Show from '../models/Show.js';
import Cinema from '../models/Cinema.js';
import Movie from '../models/Movie.js';

export const getShowsByMovieAndCity = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { city = 'Mumbai', date } = req.query;

    // Find cinemas in the selected city
    const cinemasInCity = await Cinema.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
    });
    const cinemaIds = cinemasInCity.map((c) => c._id);

    const query = {
      movie: movieId,
      cinema: { $in: cinemaIds },
    };

    if (date) {
      query.date = date;
    }

    const shows = await Show.find(query)
      .populate('cinema')
      .populate('movie', 'title durationMinutes certificate posterUrl basePrice')
      .sort({ startTime: 1 });

    // Group shows by cinema for clean display in UI
    const groupedCinemas = {};

    cinemasInCity.forEach((cinema) => {
      const cinemaShows = shows.filter(
        (s) => s.cinema._id.toString() === cinema._id.toString()
      );
      if (cinemaShows.length > 0) {
        groupedCinemas[cinema._id] = {
          cinema: {
            id: cinema._id,
            name: cinema.name,
            city: cinema.city,
            address: cinema.address,
            facilities: cinema.facilities,
          },
          shows: cinemaShows.map((s) => ({
            id: s._id,
            screenNumber: s.screenNumber,
            format: s.format,
            date: s.date,
            startTime: s.startTime,
            tiers: s.tiers,
            availableSeatsCount:
              8 * 12 - (s.bookedSeats ? s.bookedSeats.length : 0),
          })),
        };
      }
    });

    return res.status(200).json({
      success: true,
      city,
      date: date || 'All Available Dates',
      cinemas: Object.values(groupedCinemas),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching showtimes.',
    });
  }
};

export const getShowSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const show = await Show.findById(showId)
      .populate('movie', 'title durationMinutes certificate posterUrl bannerUrl basePrice')
      .populate('cinema', 'name city address screens');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    // Default 8 rows (A-H), 12 columns (1-12)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = 12;

    // Define tiers:
    // Rows A, B: Recliner (e.g. ₹450)
    // Rows C, D, E: Prime (e.g. ₹280)
    // Rows F, G, H: Classic (e.g. ₹180)
    const tierPricing = show.tiers && show.tiers.length > 0
      ? show.tiers
      : [
          { tierName: 'Recliner', rows: ['A', 'B'], price: 450 },
          { tierName: 'Prime', rows: ['C', 'D', 'E'], price: 280 },
          { tierName: 'Classic', rows: ['F', 'G', 'H'], price: 180 },
        ];

    // Combine bookedSeats and active temporary locks
    const now = new Date();
    const activeLocks = (show.lockedSeats || []).filter(
      (lock) => lock.lockedAt > new Date(now.getTime() - 10 * 60 * 1000)
    );

    const lockedSeatNumbers = activeLocks.map((l) => l.seatNumber);
    const bookedSeatNumbers = show.bookedSeats || [];

    const seatMatrix = rows.map((rowLetter) => {
      let tier = 'Classic';
      let price = 180;

      for (const t of tierPricing) {
        if (t.rows.includes(rowLetter)) {
          tier = t.tierName;
          price = t.price;
          break;
        }
      }

      const seatsInRow = [];
      for (let c = 1; c <= cols; c++) {
        const seatId = `${rowLetter}${c}`;
        const isBooked = bookedSeatNumbers.includes(seatId);
        const isLocked = lockedSeatNumbers.includes(seatId);

        seatsInRow.push({
          id: seatId,
          row: rowLetter,
          number: c,
          tier,
          price,
          status: isBooked ? 'booked' : isLocked ? 'locked' : 'available',
        });
      }

      return {
        rowLetter,
        tier,
        price,
        seats: seatsInRow,
      };
    });

    return res.status(200).json({
      success: true,
      show: {
        id: show._id,
        movie: show.movie,
        cinema: show.cinema,
        screenNumber: show.screenNumber,
        format: show.format,
        date: show.date,
        startTime: show.startTime,
        tiers: tierPricing,
        seatMatrix,
        bookedSeatsCount: bookedSeatNumbers.length,
        totalSeats: rows.length * cols,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching seating layout.',
    });
  }
};

export const getCities = async (req, res) => {
  try {
    const cities = await Cinema.distinct('city');
    return res.status(200).json({
      success: true,
      cities: cities.length > 0 ? cities : ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
