import * as mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripName    : { type: String },
  data        : { type: Array },
});

export default mongoose.model('Trip', tripSchema);
