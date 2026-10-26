import express from 'express';
import {
  getAdminStats,
  createMovie,
  updateMovie,
  deleteMovie,
  createShow,
  getAllBookings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Restrict all endpoints to admin users

router.get('/stats', getAdminStats);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);
router.post('/shows', createShow);
router.get('/bookings', getAllBookings);

export default router;
