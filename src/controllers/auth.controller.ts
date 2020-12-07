import * as jwt from 'jsonwebtoken';
import User, { IUser } from '../models/users.model';
import Config from '../config';
import { IDataStoredInToken, ISignInData } from '../interfaces/auth.interface';
import { createError } from '../utils/util';
import statusCodes from '../utils/statusCodes';
import { IControllerData } from 'interfaces/common.interface';

class AuthController {

  public async signUp (payload: Partial<IUser>) {
    try {
      const { email } = payload;

      // Check if email already exists
      const userExists = await User.findOne({ email }).countDocuments();
      if (userExists === 1) {
        throw createError(statusCodes.BAD_REQUEST, 'Email already exists');
      }

      // Create user
      const user = await new User(payload).save();

      // Generate token
      const token = jwt.sign(user.getTokenData(), Config.jwtSecret, Config.jwtExpires);

      return {
        token,
        user: user.getPublicData(),
      };
    } catch (err) {
      throw err;
    }
  }

  public async signIn (payload: ISignInData) {
    try {
      const { email, password } = payload;

      const user = await User.findOne({ email });
      if (!user) {
        throw createError(statusCodes.UNAUTHORIZED, 'No user with that email registered');
      }
      // Validate password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        throw createError(statusCodes.UNAUTHORIZED, 'Incorrect password');
      }

      // Generate token
      const token = jwt.sign(user.getTokenData(), Config.jwtSecret, Config.jwtExpires);

      // Return
      return {
        token,
        user: user.getPublicData(),
      };
    } catch (err) {
      throw err;
    }
  }

  public async checkToken ({ _auth }: IControllerData) {
    try {
      const user = await User.findById(_auth._id);
      const newToken = jwt.sign(user.getTokenData(), Config.jwtSecret, Config.jwtExpires);

      return {
        token: newToken,
        user: user.getPublicData(),
      };
    } catch (err) {
      throw err;
    }
  }

}

export default AuthController;
