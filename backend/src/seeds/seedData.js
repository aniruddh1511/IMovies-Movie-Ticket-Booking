import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

dotenv.config();

const moviesData = [
  {
    title: 'The Odyssey',
    slug: 'the-odyssey',
    description: 'An epic cinematic journey tracing Odysseus’ legendary ten-year voyage home after the Trojan War, battling mythological beasts, vengeful gods, and treacherous seas in an audiovisual masterpiece.',
    genres: ['Action', 'Adventure', 'Drama', 'Mythology'],
    languages: ['English', 'Hindi', 'Tamil'],
    durationMinutes: 168,
    rating: 9.2,
    votesCount: 48200,
    certificate: 'UA',
    basePrice: 320,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://imovies.com/trailers/the-odyssey',
    director: 'Denis Villeneuve',
    cast: ['Cillian Murphy', 'Florence Pugh', 'Oscar Isaac', 'Rebecca Ferguson'],
    isFeatured: true,
    isNowShowing: true,
    sampleRanking: 1,
    releaseDate: new Date('2026-10-15'),
  },
  {
    title: 'Dhurandhar',
    slug: 'dhurandhar',
    description: 'A high-octane espionage action thriller set across five continents where a rogue operative must expose a syndicate that infiltrates global defense networks before dawn breaks.',
    genres: ['Action', 'Thriller', 'Crime'],
    languages: ['Hindi', 'Telugu', 'Tamil', 'Malayalam'],
    durationMinutes: 154,
    rating: 8.8,
    votesCount: 39500,
    certificate: 'A',
    basePrice: 280,
    posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://imovies.com/trailers/the-odyssey',
    director: 'Aditya Dhar',
    cast: ['Ranveer Singh', 'Sanjay Dutt', 'R. Madhavan', 'Akshaye Khanna'],
    isFeatured: true,
    isNowShowing: true,
    sampleRanking: 2,
    releaseDate: new Date('2026-10-10'),
  },
  {
    title: 'Interstellar: Beyond Time',
    slug: 'interstellar-beyond-time',
    description: 'A breathtaking continuation exploring the uncharted singularity, the deep origins of the five-dimensional tesseract, and humanity’s eternal quest across black holes.',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    languages: ['English', 'Hindi'],
    durationMinutes: 175,
    rating: 9.4,
    votesCount: 65000,
    certificate: 'UA',
    basePrice: 350,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Jessica Chastain', 'Timothée Chalamet', 'Anne Hathaway'],
    isFeatured: true,
    isNowShowing: true,
    sampleRanking: 3,
    releaseDate: new Date('2026-09-20'),
  },
  {
    title: 'Kalki: Reign of Ashwatthama',
    slug: 'kalki-reign-of-ashwatthama',
    description: 'Set in the dystopian city of Kasi in 2898 AD, the immortal warrior Ashwatthama awakens to fulfill his ancient vow protecting the unborn harbinger of salvation against Supreme Yaskin.',
    genres: ['Sci-Fi', 'Mythology', 'Action'],
    languages: ['Telugu', 'Hindi', 'Tamil', 'English'],
    durationMinutes: 180,
    rating: 8.9,
    votesCount: 52100,
    certificate: 'UA',
    basePrice: 300,
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&auto=format&fit=crop&q=80',
    director: 'Nag Ashwin',
    cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
    isFeatured: false,
    isNowShowing: true,
    sampleRanking: 4,
    releaseDate: new Date('2026-10-01'),
  },
  {
    title: 'Neon Horizon',
    slug: 'neon-horizon',
    description: 'In a rain-slicked cyberpunk metropolis where human memories can be traded as contraband, an ethical cyber-detective investigates the assassination of the synthetic syndicate founder.',
    genres: ['Sci-Fi', 'Neo-Noir', 'Thriller'],
    languages: ['English'],
    durationMinutes: 138,
    rating: 8.4,
    votesCount: 22000,
    certificate: 'A',
    basePrice: 260,
    posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    director: 'Alex Garland',
    cast: ['Ryan Gosling', 'Ana de Armas', 'Dev Patel'],
    isFeatured: false,
    isNowShowing: true,
    sampleRanking: 5,
    releaseDate: new Date('2026-10-18'),
  },
  {
    title: 'The Last Symphony',
    slug: 'the-last-symphony',
    description: 'An intimate, soul-stirring drama chronicling a virtuoso deaf pianist who creates an unconventional sonic resonance chamber to craft the most triumphant piece in orchestral history.',
    genres: ['Drama', 'Music', 'Romance'],
    languages: ['English', 'Hindi'],
    durationMinutes: 125,
    rating: 8.6,
    votesCount: 18400,
    certificate: 'U',
    basePrice: 220,
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1600&auto=format&fit=crop&q=80',
    director: 'Damien Chazelle',
    cast: ['Bradley Cooper', 'Emma Stone', 'Andrew Garfield'],
    isFeatured: false,
    isNowShowing: true,
    sampleRanking: 6,
    releaseDate: new Date('2026-10-12'),
  },
  {
    title: 'Gladiator: Echoes of Rome',
    slug: 'gladiator-echoes-of-rome',
    description: 'Years after Maximus’ ultimate sacrifice, Lucius must enter the Colosseum after his home is conquered by the tyrannical emperors who rule Rome with an iron fist.',
    genres: ['Action', 'Historical', 'Drama'],
    languages: ['English', 'Hindi'],
    durationMinutes: 160,
    rating: 8.7,
    votesCount: 31000,
    certificate: 'A',
    basePrice: 290,
    posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Denzel Washington', 'Pedro Pascal', 'Connie Nielsen'],
    isFeatured: false,
    isNowShowing: false,
    sampleRanking: null,
    releaseDate: new Date('2026-11-20'),
  },
];

const cinemasData = [
  // Mumbai
  {
    name: 'PVR ICON: Phoenix Palladium',
    city: 'Mumbai',
    address: 'High Street Phoenix, Senapati Bapat Marg, Lower Parel',
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Gourmet Lounge', 'Wheelchair Access', 'Valet Parking'],
    screens: [
      { screenNumber: 1, name: 'Audi 1 (IMAX Laser 3D)', format: 'Laser IMAX' },
      { screenNumber: 2, name: 'Audi 2 (Dolby Atmos)', format: 'Dolby Atmos 2D' },
      { screenNumber: 3, name: 'Audi 3 (4DX)', format: '4DX' },
    ],
  },
  {
    name: 'INOX Megaplex: Inorbit Mall',
    city: 'Mumbai',
    address: 'Inorbit Mall, Link Road, Malad West',
    facilities: ['Dolby Atmos', 'Recliner Seating', 'Food Court Delivery', 'Parking'],
    screens: [
      { screenNumber: 1, name: 'Screen 1 (Laser 4K)', format: 'Dolby Atmos 2D' },
      { screenNumber: 2, name: 'Screen 2 (MX4D)', format: '4DX' },
    ],
  },
  // Delhi-NCR
  {
    name: 'PVR Director’s Cut: Ambience Mall',
    city: 'Delhi-NCR',
    address: 'Ambience Mall, Vasant Kunj, New Delhi',
    facilities: ['Platinum Recliner Lounge', 'Live Chef Kitchen', 'Dolby Atmos'],
    screens: [
      { screenNumber: 1, name: 'Audi 1 (Director’s Cut)', format: 'Dolby Atmos 2D' },
      { screenNumber: 2, name: 'Audi 2 (IMAX)', format: 'IMAX 3D' },
    ],
  },
  {
    name: 'Cinepolis: DLF Avenue Saket',
    city: 'Delhi-NCR',
    address: 'DLF Avenue Mall, Saket District Centre, New Delhi',
    facilities: ['4DX', 'RealD 3D', 'VIP Recliners'],
    screens: [
      { screenNumber: 1, name: 'Screen 1 (Macro XE)', format: 'Dolby Atmos 2D' },
      { screenNumber: 2, name: 'Screen 2 (4DX)', format: '4DX' },
    ],
  },
  // Bengaluru
  {
    name: 'PVR Superplex: Vega City Mall',
    city: 'Bengaluru',
    address: 'Bannerghatta Main Road, Dollar Layout, Bengaluru',
    facilities: ['IMAX with Laser', '4DX', 'Playhouse', 'Dolby 7.1'],
    screens: [
      { screenNumber: 1, name: 'Audi 1 (IMAX Laser)', format: 'Laser IMAX' },
      { screenNumber: 2, name: 'Audi 2 (Dolby Atmos)', format: 'Dolby Atmos 2D' },
    ],
  },
  {
    name: 'INOX: Forum Rex Walk',
    city: 'Bengaluru',
    address: 'Rex Walk, Brigade Road, Ashok Nagar, Bengaluru',
    facilities: ['Dolby Atmos', 'Laser Projection', 'Artisanal Cafe'],
    screens: [
      { screenNumber: 1, name: 'Screen 1', format: 'Dolby Atmos 2D' },
    ],
  },
  // Hyderabad
  {
    name: 'Prasad Multiplex: Large Screen',
    city: 'Hyderabad',
    address: 'NTR Gardens, Necklace Road, Hyderabad',
    facilities: ['Giant Screen Laser', 'Dolby Atmos', 'Ample Parking'],
    screens: [
      { screenNumber: 1, name: 'Large Screen 1', format: 'Laser IMAX' },
      { screenNumber: 2, name: 'Screen 2', format: 'Dolby Atmos 2D' },
    ],
  },
  // Chennai
  {
    name: 'SPI Sathyam Cinemas',
    city: 'Chennai',
    address: 'Thiru Vi Ka Road, Royapettah, Chennai',
    facilities: ['Dolby Atmos', 'Legendary Popcorn', 'Elite Seating'],
    screens: [
      { screenNumber: 1, name: 'Sathyam (Main)', format: 'Dolby Atmos 2D' },
      { screenNumber: 2, name: 'Santham', format: 'Laser IMAX' },
    ],
  },
];

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Cinema.deleteMany({});
    await Show.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // Seed default Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await User.create({
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const standardUser = await User.create({
      name: 'Rachit Banke',
      email: 'user@imovies.com',
      password: hashedPassword,
      role: 'user',
      phone: '+91 91234 56789',
    });

    console.log('[Seed] Seeded Admin and Demo users.');

    // Seed Movies
    const insertedMovies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Seeded ${insertedMovies.length} movies.`);

    // Seed Cinemas
    const insertedCinemas = await Cinema.insertMany(cinemasData);
    console.log(`[Seed] Seeded ${insertedCinemas.length} cinemas.`);

    // Dates for shows: Today, Tomorrow, Day after tomorrow
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const showTimes = ['10:30 AM', '01:45 PM', '05:15 PM', '08:45 PM', '11:15 PM'];
    const showsToInsert = [];

    // Create shows for each cinema & now showing movies
    const nowShowingMovies = insertedMovies.filter((m) => m.isNowShowing);

    for (const cinema of insertedCinemas) {
      for (const movie of nowShowingMovies.slice(0, 4)) {
        for (const date of dates) {
          // Add 2 to 3 showtimes per day
          const times = [showTimes[0], showTimes[2], showTimes[3]];
          times.forEach((time, idx) => {
            // Pre-seed some booked seats for realistic look (e.g. C5, C6, D7)
            const sampleBooked = idx === 0 ? ['C5', 'C6', 'D7', 'D8'] : ['B3', 'B4', 'F6'];

            showsToInsert.push({
              movie: movie._id,
              cinema: cinema._id,
              screenNumber: 1,
              format: cinema.screens[0]?.format || 'Dolby Atmos 2D',
              date,
              startTime: time,
              tiers: [
                { tierName: 'Recliner', rows: ['A', 'B'], price: movie.basePrice + 150 },
                { tierName: 'Prime', rows: ['C', 'D', 'E'], price: movie.basePrice + 50 },
                { tierName: 'Classic', rows: ['F', 'G', 'H'], price: movie.basePrice },
              ],
              bookedSeats: sampleBooked,
            });
          });
        }
      }
    }

    const insertedShows = await Show.insertMany(showsToInsert);
    console.log(`[Seed] Seeded ${insertedShows.length} showtimes.`);

    // Create a sample confirmed booking for standardUser
    const sampleShow = insertedShows[0];
    const sampleMovie = insertedMovies.find((m) => m._id.toString() === sampleShow.movie.toString());
    const sampleCinema = insertedCinemas.find((c) => c._id.toString() === sampleShow.cinema.toString());

    const sampleBooking = await Booking.create({
      bookingReference: 'IMV-ODYS78',
      user: standardUser._id,
      show: sampleShow._id,
      movieTitle: sampleMovie.title,
      moviePoster: sampleMovie.posterUrl,
      cinemaName: sampleCinema.name,
      cinemaCity: sampleCinema.city,
      screenNumber: sampleShow.screenNumber,
      format: sampleShow.format,
      showDate: sampleShow.date,
      showTime: sampleShow.startTime,
      seats: [
        { seatNumber: 'C5', tier: 'Prime', price: sampleMovie.basePrice + 50 },
        { seatNumber: 'C6', tier: 'Prime', price: sampleMovie.basePrice + 50 },
      ],
      baseAmount: (sampleMovie.basePrice + 50) * 2,
      convenienceFee: 60,
      taxAmount: 10.8,
      totalAmount: (sampleMovie.basePrice + 50) * 2 + 70.8,
      status: 'confirmed',
      paymentMethod: 'phonepe_qr',
      confirmedAt: new Date(),
    });

    await Payment.create({
      booking: sampleBooking._id,
      user: standardUser._id,
      amount: sampleBooking.totalAmount,
      currency: 'INR',
      provider: 'phonepe_qr',
      status: 'successful',
      phonepeUtr: '428901928471',
      verifiedAt: new Date(),
    });

    console.log('[Seed] Seeded confirmed sample booking and payment.');
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}
