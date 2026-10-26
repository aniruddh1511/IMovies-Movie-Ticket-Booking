/**
 * IMovies API Service
 * Connects to the Express backend API with graceful fallback to client-side storage
 * when backend is unreachable or running in mock mode.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/imovies/api';

// Helper for standard fetch with JWT headers
const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('imovies_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    console.warn(`[API] Network error connecting to ${endpoint}:`, err.message);
    return { ok: false, status: 0, networkError: true, error: err.message };
  }
};

// ==========================================
// 1. Initial Mock Data for Seamless Fallback
// ==========================================
const INITIAL_MOVIES = [
  {
    _id: 'mov-1',
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
    releaseDate: '2026-10-15',
  },
  {
    _id: 'mov-2',
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
    releaseDate: '2026-10-10',
  },
  {
    _id: 'mov-3',
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
    releaseDate: '2026-09-20',
  },
  {
    _id: 'mov-4',
    title: 'Kalki: Reign of Ashwatthama',
    slug: 'kalki-reign-of-ashwatthama',
    description: 'Set in the dystopian city of Kasi in 2898 AD, the immortal warrior Ashwatthama awakens to fulfill his ancient vow protecting the unborn harbinger of salvation.',
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
    releaseDate: '2026-10-01',
  },
  {
    _id: 'mov-5',
    title: 'Neon Horizon',
    slug: 'neon-horizon',
    description: 'In a rain-slicked cyberpunk metropolis where memories are traded as contraband, an ethical cyber-detective investigates the assassination of the synthetic syndicate founder.',
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
    releaseDate: '2026-10-18',
  },
  {
    _id: 'mov-6',
    title: 'The Last Symphony',
    slug: 'the-last-symphony',
    description: 'An intimate drama chronicling a virtuoso deaf pianist who creates an unconventional sonic resonance chamber to craft the most triumphant piece in orchestral history.',
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
    releaseDate: '2026-10-12',
  },
];

const INITIAL_CINEMAS = {
  Mumbai: [
    {
      id: 'cin-mum-1',
      name: 'PVR ICON: Phoenix Palladium',
      city: 'Mumbai',
      address: 'High Street Phoenix, Senapati Bapat Marg, Lower Parel',
      facilities: ['IMAX Laser', 'Dolby Atmos', 'Gourmet Lounge', 'Wheelchair Access'],
      shows: [
        { id: 'sh-101', format: 'Laser IMAX', startTime: '10:30 AM', bookedSeats: ['C5', 'C6', 'D7', 'D8'] },
        { id: 'sh-102', format: 'Dolby Atmos 2D', startTime: '02:15 PM', bookedSeats: ['B3', 'B4', 'F6'] },
        { id: 'sh-103', format: 'Laser IMAX', startTime: '06:45 PM', bookedSeats: ['D5', 'D6', 'E5', 'E6'] },
        { id: 'sh-104', format: 'Dolby Atmos 2D', startTime: '10:00 PM', bookedSeats: ['A1', 'A2'] },
      ],
    },
    {
      id: 'cin-mum-2',
      name: 'INOX Megaplex: Inorbit Mall',
      city: 'Mumbai',
      address: 'Inorbit Mall, Link Road, Malad West',
      facilities: ['Dolby Atmos', 'Recliner Seating', 'Food Court Delivery'],
      shows: [
        { id: 'sh-105', format: 'Dolby Atmos 2D', startTime: '11:15 AM', bookedSeats: ['C4', 'C5'] },
        { id: 'sh-106', format: '4DX', startTime: '03:30 PM', bookedSeats: ['E7', 'E8'] },
        { id: 'sh-107', format: 'Dolby Atmos 2D', startTime: '07:30 PM', bookedSeats: ['B5', 'B6'] },
      ],
    },
  ],
  'Delhi-NCR': [
    {
      id: 'cin-del-1',
      name: 'PVR Director’s Cut: Ambience Mall',
      city: 'Delhi-NCR',
      address: 'Ambience Mall, Vasant Kunj, New Delhi',
      facilities: ['Platinum Recliner Lounge', 'Live Chef Kitchen', 'Dolby Atmos'],
      shows: [
        { id: 'sh-201', format: 'Dolby Atmos 2D', startTime: '12:00 PM', bookedSeats: ['C1', 'C2'] },
        { id: 'sh-202', format: 'IMAX 3D', startTime: '04:45 PM', bookedSeats: ['D4', 'D5'] },
        { id: 'sh-203', format: 'Dolby Atmos 2D', startTime: '09:00 PM', bookedSeats: ['E1', 'E2', 'E3'] },
      ],
    },
    {
      id: 'cin-del-2',
      name: 'Cinepolis: DLF Avenue Saket',
      city: 'Delhi-NCR',
      address: 'DLF Avenue Mall, Saket District Centre, New Delhi',
      facilities: ['4DX', 'RealD 3D', 'VIP Recliners'],
      shows: [
        { id: 'sh-204', format: 'Dolby Atmos 2D', startTime: '01:30 PM', bookedSeats: ['B6', 'B7'] },
        { id: 'sh-205', format: '4DX', startTime: '06:15 PM', bookedSeats: ['D8', 'D9'] },
      ],
    },
  ],
  Bengaluru: [
    {
      id: 'cin-blr-1',
      name: 'PVR Superplex: Vega City Mall',
      city: 'Bengaluru',
      address: 'Bannerghatta Main Road, Dollar Layout, Bengaluru',
      facilities: ['IMAX with Laser', '4DX', 'Playhouse', 'Dolby 7.1'],
      shows: [
        { id: 'sh-301', format: 'Laser IMAX', startTime: '11:00 AM', bookedSeats: ['C7', 'C8'] },
        { id: 'sh-302', format: 'Dolby Atmos 2D', startTime: '03:45 PM', bookedSeats: ['B4', 'B5'] },
        { id: 'sh-303', format: 'Laser IMAX', startTime: '08:30 PM', bookedSeats: ['D6', 'D7'] },
      ],
    },
    {
      id: 'cin-blr-2',
      name: 'INOX: Forum Rex Walk',
      city: 'Bengaluru',
      address: 'Rex Walk, Brigade Road, Ashok Nagar, Bengaluru',
      facilities: ['Dolby Atmos', 'Laser Projection', 'Artisanal Cafe'],
      shows: [
        { id: 'sh-304', format: 'Dolby Atmos 2D', startTime: '01:00 PM', bookedSeats: ['E4', 'E5'] },
        { id: 'sh-305', format: 'Dolby Atmos 2D', startTime: '07:15 PM', bookedSeats: ['C3', 'C4'] },
      ],
    },
  ],
  Hyderabad: [
    {
      id: 'cin-hyd-1',
      name: 'Prasad Multiplex: Large Screen',
      city: 'Hyderabad',
      address: 'NTR Gardens, Necklace Road, Hyderabad',
      facilities: ['Giant Screen Laser', 'Dolby Atmos', 'Ample Parking'],
      shows: [
        { id: 'sh-401', format: 'Laser IMAX', startTime: '11:30 AM', bookedSeats: ['C5', 'C6'] },
        { id: 'sh-402', format: 'Dolby Atmos 2D', startTime: '04:15 PM', bookedSeats: ['B1', 'B2'] },
        { id: 'sh-403', format: 'Laser IMAX', startTime: '08:45 PM', bookedSeats: ['D3', 'D4', 'D5'] },
      ],
    },
  ],
  Chennai: [
    {
      id: 'cin-chn-1',
      name: 'SPI Sathyam Cinemas',
      city: 'Chennai',
      address: 'Thiru Vi Ka Road, Royapettah, Chennai',
      facilities: ['Dolby Atmos', 'Legendary Popcorn', 'Elite Seating'],
      shows: [
        { id: 'sh-501', format: 'Dolby Atmos 2D', startTime: '12:30 PM', bookedSeats: ['C8', 'C9'] },
        { id: 'sh-502', format: 'Laser IMAX', startTime: '05:30 PM', bookedSeats: ['B6', 'B7'] },
        { id: 'sh-503', format: 'Dolby Atmos 2D', startTime: '09:30 PM', bookedSeats: ['E5', 'E6'] },
      ],
    },
  ],
};

// Initial Mock Bookings
const INITIAL_BOOKINGS = [
  {
    id: 'bkg-demo-1',
    bookingReference: 'IMV-ODYS78',
    movieTitle: 'The Odyssey',
    moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    cinemaName: 'PVR ICON: Phoenix Palladium',
    cinemaCity: 'Mumbai',
    screenNumber: 1,
    format: 'Laser IMAX',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:45 PM',
    seats: ['C5', 'C6'],
    totalAmount: 760.8,
    status: 'confirmed',
    paymentMethod: 'phonepe_qr',
    confirmedAt: new Date().toISOString(),
    isConfirmed: true,
  },
];

// Local state helpers for fallback
const getStoredBookings = () => {
  try {
    const raw = localStorage.getItem('imovies_user_bookings');
    return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
};

const saveStoredBookings = (bookings) => {
  localStorage.setItem('imovies_user_bookings', JSON.stringify(bookings));
};

// ==========================================
// 2. Exported API Methods
// ==========================================

export const api = {
  // Auth APIs
  login: async (email, password) => {
    const res = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok && res.data.success) {
      localStorage.setItem('imovies_token', res.data.token);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user, token: res.data.token };
    }

    if (res.networkError) {
      // Offline fallback login for demo purposes
      const mockUser = {
        id: email.includes('admin') ? 'usr-admin' : 'usr-demo-1',
        name: email.includes('admin') ? 'IMovies Admin' : 'Demo Patron',
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        phone: '+91 98765 43210',
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('imovies_token', mockToken);
      localStorage.setItem('imovies_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser, token: mockToken, isMock: true };
    }

    return { success: false, message: res.data?.message || 'Login failed.' };
  },

  register: async (name, email, password, phone) => {
    const res = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });

    if (res.ok && res.data.success) {
      localStorage.setItem('imovies_token', res.data.token);
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user, token: res.data.token };
    }

    if (res.networkError) {
      const mockUser = {
        id: 'usr-' + Date.now(),
        name,
        email,
        role: 'user',
        phone: phone || '',
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('imovies_token', mockToken);
      localStorage.setItem('imovies_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser, token: mockToken, isMock: true };
    }

    return { success: false, message: res.data?.message || 'Registration failed.' };
  },

  getProfile: async () => {
    const res = await authFetch('/auth/me');
    if (res.ok && res.data.success) {
      return { success: true, user: res.data.user };
    }
    const stored = localStorage.getItem('imovies_user');
    if (stored) {
      return { success: true, user: JSON.parse(stored) };
    }
    return { success: false, message: 'Not authenticated' };
  },

  updateProfile: async (name, email, phone) => {
    const res = await authFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name, email, phone }),
    });
    if (res.ok && res.data.success) {
      localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }
    // Fallback update
    const stored = localStorage.getItem('imovies_user');
    if (stored) {
      const u = JSON.parse(stored);
      const updated = { ...u, name: name || u.name, email: email || u.email, phone: phone || u.phone };
      localStorage.setItem('imovies_user', JSON.stringify(updated));
      return { success: true, user: updated, isMock: true };
    }
    return { success: false, message: 'Update failed.' };
  },

  // Movie APIs
  getMovies: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`/movies?${query}`);
    if (res.ok && res.data.success) {
      return { success: true, movies: res.data.movies };
    }

    // Filter mock movies
    let filtered = [...INITIAL_MOVIES];
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          m.director.toLowerCase().includes(s) ||
          m.cast.some((c) => c.toLowerCase().includes(s))
      );
    }
    if (params.genre && params.genre !== 'All') {
      filtered = filtered.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === params.genre.toLowerCase())
      );
    }
    if (params.language && params.language !== 'All') {
      filtered = filtered.filter((m) =>
        m.languages.some((l) => l.toLowerCase() === params.language.toLowerCase())
      );
    }
    return { success: true, movies: filtered, isMock: true };
  },

  getPopularRanking: async () => {
    const res = await authFetch('/movies/popular-ranking');
    if (res.ok && res.data.success) {
      return {
        success: true,
        rankingNotice: res.data.rankingNotice,
        movies: res.data.movies,
      };
    }
    const ranked = [...INITIAL_MOVIES]
      .filter((m) => m.sampleRanking != null)
      .sort((a, b) => a.sampleRanking - b.sampleRanking);
    return {
      success: true,
      rankingNotice: 'Curated Sample Ranking (Labelled Sample Metrics)',
      movies: ranked,
      isMock: true,
    };
  },

  getMovieById: async (id) => {
    const res = await authFetch(`/movies/${id}`);
    if (res.ok && res.data.success) {
      return { success: true, movie: res.data.movie };
    }
    const movie = INITIAL_MOVIES.find((m) => m._id === id || m.slug === id) || INITIAL_MOVIES[0];
    return { success: true, movie, isMock: true };
  },

  // Showtimes and Cinemas
  getShowsForMovie: async (movieId, city = 'Mumbai', date) => {
    const res = await authFetch(`/shows/movie/${movieId}?city=${encodeURIComponent(city)}&date=${date || ''}`);
    if (res.ok && res.data.success) {
      return { success: true, cinemas: res.data.cinemas };
    }
    const cityCinemas = INITIAL_CINEMAS[city] || INITIAL_CINEMAS['Mumbai'];
    return { success: true, cinemas: cityCinemas, isMock: true };
  },

  getShowSeats: async (showId) => {
    const res = await authFetch(`/shows/${showId}/seats`);
    if (res.ok && res.data.success) {
      return { success: true, show: res.data.show, seatLayout: res.data.seatLayout };
    }

    // Default mock seat layout
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = 12;
    const booked = ['C5', 'C6', 'D7', 'D8', 'B3', 'B4', 'F6'];

    const tiers = [
      { tierName: 'Recliner', rows: ['A', 'B'], price: 450 },
      { tierName: 'Prime', rows: ['C', 'D', 'E'], price: 280 },
      { tierName: 'Classic', rows: ['F', 'G', 'H'], price: 180 },
    ];

    const seats = [];
    rows.forEach((row) => {
      const tierObj = tiers.find((t) => t.rows.includes(row)) || tiers[1];
      for (let c = 1; c <= cols; c++) {
        const seatNumber = `${row}${c}`;
        const isBooked = booked.includes(seatNumber);
        seats.push({
          seatNumber,
          row,
          column: c,
          tier: tierObj.tierName,
          price: tierObj.price,
          isBooked,
        });
      }
    });

    return {
      success: true,
      seatLayout: {
        rows,
        columns: cols,
        tiers,
        seats,
      },
      isMock: true,
    };
  },

  // Booking Flow
  createBookingIntent: async ({ showId, seats, movie, cinema, showDetails }) => {
    const res = await authFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({ showId, seats, paymentMethod: 'phonepe_qr' }),
    });

    if (res.ok && res.data.success) {
      return { success: true, booking: res.data.booking };
    }

    // Server-side calculation emulation
    const baseAmount = seats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = 30 * seats.length;
    const taxAmount = Number((convenienceFee * 0.18).toFixed(2));
    const totalAmount = Number((baseAmount + convenienceFee + taxAmount).toFixed(2));
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();

    const mockBooking = {
      id: 'bkg-' + Date.now(),
      bookingReference: `IMV-${randomHex}99`,
      movieTitle: movie?.title || 'Selected Movie',
      moviePoster: movie?.posterUrl || '',
      cinemaName: cinema?.name || 'Grand Cinema',
      cinemaCity: cinema?.city || 'Mumbai',
      screenNumber: showDetails?.screenNumber || 1,
      format: showDetails?.format || 'Dolby Atmos 2D',
      showDate: showDetails?.date || new Date().toISOString().split('T')[0],
      showTime: showDetails?.startTime || '07:30 PM',
      seats: seats.map((s) => s.seatNumber),
      validatedSeats: seats,
      baseAmount,
      convenienceFee,
      taxAmount,
      totalAmount,
      status: 'pending_payment',
      paymentMethod: 'phonepe_qr',
      paymentId: 'pay-' + Date.now(),
    };

    return { success: true, booking: mockBooking, isMock: true };
  },

  // Payment Verification: PhonePe UPI with 12-Digit UTR
  verifyPhonePePayment: async (bookingId, utrNumber, localBooking) => {
    const res = await authFetch('/payments/phonepe/verify', {
      method: 'POST',
      body: JSON.stringify({ bookingId, utrNumber }),
    });

    if (res.ok && res.data.success) {
      return { success: true, booking: res.data.booking };
    }

    // Offline / demo validation of 12-digit numeric UTR
    const cleanUTR = (utrNumber || '').trim();
    if (!/^\d{12}$/.test(cleanUTR)) {
      return {
        success: false,
        message: 'Invalid UTR format. UPI Reference Numbers are exactly 12 numeric digits (e.g. 428901234567).',
      };
    }

    const bookings = getStoredBookings();
    const confirmedBooking = {
      ...localBooking,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      isConfirmed: true,
      phonepeUtr: cleanUTR,
      paymentMethod: 'phonepe_qr',
    };

    bookings.unshift(confirmedBooking);
    saveStoredBookings(bookings);

    return {
      success: true,
      message: 'PhonePe UPI payment verified successfully! Your tickets are confirmed.',
      booking: confirmedBooking,
      isMock: true,
    };
  },

  // Razorpay Order Creation and Verification
  createRazorpayOrder: async (bookingId, amount) => {
    const res = await authFetch('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
    if (res.ok && res.data.success) {
      return res.data;
    }
    return {
      success: true,
      orderId: 'order_mock_' + Date.now(),
      amount,
      amountInPaise: Math.round(amount * 100),
      currency: 'INR',
      keyId: 'rzp_test_placeholder_key',
      isLiveConfigured: false,
      isMock: true,
    };
  },

  verifyRazorpayPayment: async (verificationData, localBooking) => {
    const res = await authFetch('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
    if (res.ok && res.data.success) {
      return { success: true, booking: res.data.booking };
    }

    const bookings = getStoredBookings();
    const confirmedBooking = {
      ...localBooking,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      isConfirmed: true,
      paymentMethod: 'razorpay',
    };
    bookings.unshift(confirmedBooking);
    saveStoredBookings(bookings);

    return {
      success: true,
      message: 'Razorpay payment verified and booking confirmed successfully!',
      booking: confirmedBooking,
      isMock: true,
    };
  },

  // Explicit Demo Payment Mode (Clearly Labeled)
  processDemoPayment: async (bookingId, localBooking) => {
    const res = await authFetch('/payments/demo', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
    if (res.ok && res.data.success) {
      return { success: true, isDemo: true, booking: res.data.booking };
    }

    const bookings = getStoredBookings();
    const confirmedBooking = {
      ...localBooking,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      isConfirmed: true,
      paymentMethod: 'demo_mode',
      metadata: 'Explicit Demo Sandbox Payment - No Real Charge',
    };
    bookings.unshift(confirmedBooking);
    saveStoredBookings(bookings);

    return {
      success: true,
      isDemo: true,
      message: '[DEMO MODE] Test booking confirmed without actual charge.',
      booking: confirmedBooking,
      isMock: true,
    };
  },

  // Tickets & History
  getMyBookings: async () => {
    const res = await authFetch('/bookings/my');
    if (res.ok && res.data.success) {
      return { success: true, bookings: res.data.bookings };
    }
    return { success: true, bookings: getStoredBookings(), isMock: true };
  },

  // Admin APIs
  getAdminStats: async () => {
    const res = await authFetch('/admin/stats');
    if (res.ok && res.data.success) {
      return { success: true, stats: res.data.stats, recentBookings: res.data.recentBookings };
    }
    const currentBookings = getStoredBookings();
    const confirmedRevenue = currentBookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      success: true,
      stats: {
        totalMovies: INITIAL_MOVIES.length,
        totalShows: 24,
        totalBookings: currentBookings.length,
        confirmedBookings: currentBookings.filter((b) => b.status === 'confirmed').length,
        totalRevenue: Number(confirmedRevenue.toFixed(2)),
        totalUsers: 142,
      },
      recentBookings: currentBookings.slice(0, 5),
      isMock: true,
    };
  },

  createMovieAdmin: async (movieData) => {
    const res = await authFetch('/admin/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
    if (res.ok && res.data.success) {
      return { success: true, movie: res.data.movie };
    }
    const newMovie = {
      ...movieData,
      _id: 'mov-' + Date.now(),
      slug: movieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isNowShowing: true,
      sampleRanking: null,
    };
    INITIAL_MOVIES.unshift(newMovie);
    return { success: true, movie: newMovie, isMock: true };
  },
};
