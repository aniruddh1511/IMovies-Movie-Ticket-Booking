import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    enum: ['IMAX 3D', '4DX', 'Dolby Atmos 2D', 'Standard 2D', 'Laser IMAX'],
    default: 'Dolby Atmos 2D',
  },
  seatLayout: {
    rows: { type: Number, default: 8 }, // A to H
    cols: { type: Number, default: 12 }, // 1 to 12
  },
});

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cinema name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    facilities: [
      {
        type: String,
      },
    ],
    screens: [screenSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Cinema', cinemaSchema);
