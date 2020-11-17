import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName   : { type: String },
  email         : { type: String, unique: true },
  password      : { type: String },
  createdAt     : { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
