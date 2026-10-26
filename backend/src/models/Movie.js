import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    votesCount: {
      type: Number,
      default: 12000,
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG-13', 'R'],
      default: 'UA',
    },
    basePrice: {
      type: Number,
      required: [true, 'Base ticket price is required'],
      default: 250,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    bannerUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    director: {
      type: String,
      default: '',
    },
    cast: [
      {
        type: String,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNowShowing: {
      type: Boolean,
      default: true,
    },
    sampleRanking: {
      type: Number,
      default: null, // Labelled sample rank e.g. #1, #2
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before save
movieSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.model('Movie', movieSchema);
