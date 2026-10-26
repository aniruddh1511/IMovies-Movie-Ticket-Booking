import express from 'express';
import {
  getMovies,
  getFeaturedMovies,
  getPopularRanking,
  getMovieById,
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/popular-ranking', getPopularRanking);
router.get('/:id', getMovieById);

export default router;
