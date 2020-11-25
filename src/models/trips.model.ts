import * as mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripName    : { type: String },
  data        : { type: Array },
  userId      : { type: String },
  published   : { type: Boolean },
});

export default mongoose.model('Trip', tripSchema);
