import mongoose from 'mongoose';

const DaySchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    activities: [String],
  },
  { _id: false }
);

const ItinerarySchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    days: [DaySchema],
    // later: userId for auth
  },
  { timestamps: true, versionKey: false }
);

ItinerarySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Itinerary', ItinerarySchema);
