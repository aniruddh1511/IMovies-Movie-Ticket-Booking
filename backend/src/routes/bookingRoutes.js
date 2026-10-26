import express from 'express';
import {
  createBookingIntent,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect); // All booking routes require user authentication

router.post('/intent', bookingLimiter, createBookingIntent);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

export default router;
