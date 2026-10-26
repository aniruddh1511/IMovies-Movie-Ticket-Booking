import rateLimit from 'express-rate-limit';

// Global API rate limiter: 120 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication (prevent brute force): 15 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Booking limiter to prevent seat scraping / automated checkout abuse
export const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Rate limit exceeded for booking requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
