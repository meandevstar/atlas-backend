import * as mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripName    : { type: String },
  data        : { type: Array },
  userId      : { type: String },
});

export default mongoose.model('Trip', tripSchema);
