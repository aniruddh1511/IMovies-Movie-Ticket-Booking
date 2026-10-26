import express from 'express';
import {
  getShowsByMovieAndCity,
  getShowSeats,
  getCities,
} from '../controllers/showController.js';

const router = express.Router();

router.get('/cities', getCities);
router.get('/movie/:movieId', getShowsByMovieAndCity);
router.get('/:showId/seats', getShowSeats);

export default router;
