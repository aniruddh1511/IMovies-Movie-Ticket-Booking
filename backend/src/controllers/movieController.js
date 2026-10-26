import Movie from '../models/Movie.js';

export const getMovies = async (req, res) => {
  try {
    const { search, genre, language, status, featured } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { cast: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    if (language && language !== 'All') {
      query.languages = { $in: [new RegExp(`^${language}$`, 'i')] };
    }

    if (status === 'now_showing') {
      query.isNowShowing = true;
    } else if (status === 'upcoming') {
      query.isNowShowing = false;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const movies = await Movie.find(query).sort({ sampleRanking: 1, rating: -1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching movies.',
    });
  }
};

export const getFeaturedMovies = async (req, res) => {
  try {
    const featured = await Movie.find({ isFeatured: true }).limit(5);
    return res.status(200).json({
      success: true,
      movies: featured,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPopularRanking = async (req, res) => {
  try {
    // Curated sample ranking clearly labelled
    const ranked = await Movie.find({ sampleRanking: { $ne: null } })
      .sort({ sampleRanking: 1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      rankingNotice: 'Curated Editor Sample Ranking (Not real-time metrics)',
      movies: ranked,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    let movie;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(id);
    } else {
      movie = await Movie.findOne({ slug: id });
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
