import { model, Schema, Types } from 'mongoose';
import { pick } from 'lodash';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import Config from '../config';
import { SALT_ROUNDS } from '../constants';
import { IDocument } from '../interfaces/common.interface';

export interface IUser extends IDocument<IUser> {
  displayName: string;
  email: string;
  username: string;
  password: string;
  verified: {
    email: boolean;
  };
  followers: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  verifyPassword: (password: string) => Promise<boolean>;
  getToken: () => string;
}

const userSchema: Schema = new Schema(
  {
    displayName: { type: String },
    email: { type: String, trim: true, unique: true },
    username: { type: String, trim: true, unique: true },
    password: { type: String },
    followers: [{ type: Types.ObjectId, ref: 'User' }],
    verified: {
      email: Boolean,
    }
  },
  {
    timestamps: true,
    autoIndex: process.env.MONGO_AUTO_INDEX === '1',
    versionKey: false,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

userSchema.methods.verifyPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.getPublicData = function () {
  return pick(this, ['_id', 'email', 'username', 'followers', 'displayName']);
};

userSchema.methods.getToken = function () {
  return jwt.sign(pick(this, ['_id', 'email']), Config.jwtSecret, Config.jwtAuthExpires);
};

userSchema.pre<IUser>('save', async function (next) {
  this.email = this.email.toLowerCase().trim();

  if (this.isNew || this.modifiedPaths().includes('password')) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }

  next();
});

export default model<IUser>('User', userSchema);
