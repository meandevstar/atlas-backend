import { pick } from 'lodash';
import { IDocument } from '../interfaces/common.interface';
import { Types, Schema, model } from 'mongoose';

export interface ITrip extends IDocument<ITrip> {
  tripName: string;
  data: any[];
  user: Types.ObjectId | string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const tripSchema = new Schema(
  {
    tripName: { type: String },
    data: { type: Array },
    user: { type: Types.ObjectId, ref: 'User' },
    published: { type: Boolean },
  },
  {
    timestamps: true,
    autoIndex: process.env.MONGO_AUTO_INDEX === '1',
  }
);

tripSchema.methods.getPublicData = function () {
  return pick(this, ['_id', 'user', 'tripName', 'data', 'published']);
};

export default model<ITrip>('Trip', tripSchema);
