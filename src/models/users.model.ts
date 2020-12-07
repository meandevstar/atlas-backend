import { model, Schema } from 'mongoose';
import { pick } from 'lodash';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../constants';
import { IDataStoredInToken } from '../interfaces/auth.interface';
import { IDocument } from '../interfaces/common.interface';

export interface IUser extends IDocument<IUser> {
  displayName: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  verifyPassword: (password: string) => Promise<boolean>;
  getTokenData: () => IDataStoredInToken;
}

const userSchema: Schema = new Schema(
  {
    displayName: { type: String },
    email: { type: String, trim: true, unique: true },
    password: { type: String },
  },
  {
    timestamps: true,
    autoIndex: process.env.MONGO_AUTO_INDEX === '1',
  }
);

userSchema.methods.verifyPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.getPublicData = function () {
  return pick(this, ['_id', 'email', 'displayName']);
};

userSchema.methods.getTokenData = function () {
  return pick(this, ['_id', 'email']);
};

userSchema.pre<IUser>('save', async function (next) {
  this.email = this.email.toLowerCase().trim();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);

  next();
});

export default model<IUser>('User', userSchema);
