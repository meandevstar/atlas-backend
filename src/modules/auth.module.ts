import * as jwt from 'jsonwebtoken';
import User, { IUser } from '../models/users.model';
import Config from '../config';
import {
  IAuthResponse,
  IDataStoredInEmailToken,
  ISignInData,
} from '../interfaces/auth.interface';
import { createError } from '../utils/util';
import statusCodes from '../utils/statusCodes';
import { IControllerData, IEmailPayload } from 'interfaces/common.interface';
import SESModule from './ses.module';
import { exist } from 'joi';

class AuthModule {
  private ses: SESModule;

  constructor() {
    this.ses = new SESModule();
  }

  public signUp = async (payload: Partial<IUser>) => {
    try {
      const { email } = payload;

      // Check if email already exists
      const userExists = await User.findOne({ email }).countDocuments();
      if (userExists === 1) {
        throw createError(statusCodes.BAD_REQUEST, 'Email already exists');
      }

      // Create user
      const user = await new User(payload).save();

      await this.sendVerifyEmail(user);

      return {
        user: user.getPublicData(),
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  public signIn = async (payload: ISignInData) => {
    try {
      const { email, password } = payload;

      const user = await User.findOne({ email });
      if (!user) {
        throw createError(
          statusCodes.UNAUTHORIZED,
          'No user with that email registered'
        );
      }

      // Validate password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        throw createError(statusCodes.UNAUTHORIZED, 'Incorrect password');
      }

      const result: IAuthResponse = {
        user: user.getPublicData(),
      };

      if (user.verified.email) {
        result.token = user.getToken();
      }

      // Return
      return result;
    } catch (err) {
      throw err;
    }
  };

  public async checkToken({ _req: { auth } }: IControllerData) {
    try {
      return {
        token: auth.getToken(),
        user: auth.getPublicData(),
      };
    } catch (err) {
      throw err;
    }
  }

  public verifyEmailToken = async (payload: IControllerData) => {
    const { token } = payload;

    try {
      const { id } = jwt.verify(
        token,
        Config.jwtSecret
      ) as IDataStoredInEmailToken;
      const user = await User.findById(id);

      user.verified.email = true;
      user.markModified('verified');
      await user.save();

      return {
        token: user.getToken(),
        user: user.getPublicData(),
      };
    } catch (err) {
      throw err;
    }
  };

  public sendVerifyEmail = async (payload: Partial<IUser> | IControllerData) => {
    try {
      let { _id, email } = payload;
      let user;

      if (!_id) {
        user = await User.findOne({ email });

        if (!user) {
          throw createError(statusCodes.NOT_FOUND, 'Email not found');
        }

        _id = user._id;
      }

      // Generate token
      const tokenPayload: IDataStoredInEmailToken = { id: _id };

      const emailToken = jwt.sign(
        tokenPayload,
        Config.jwtSecret,
        Config.jwtEmailTokenExpires
      );

      const emailPayload: IEmailPayload = {
        subject: 'Verify your email',
        body: `Please verify your email by clicking following <a href="${Config.frontUrl}/email-validation?token=${emailToken}">link</a>`,
        receipients: payload.email,
      };

      await this.ses.sendEmail(emailPayload);

      return {
        message: 'Email sent successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  public updateUser = async ({ _req, ...value }: IControllerData) => {
    value.oldEmail = value.oldEmail.toLowerCase().trim();
    value.newEmail = value.newEmail.toLowerCase().trim();

    try {
      const user = await User.findOne({ email: value.oldEmail });
      if (!user) {
        throw createError(statusCodes.UNAUTHORIZED, 'No user with that email registered');
      }

      // Validate old password
      if (value.oldPassword) {
        const match = await user.verifyPassword(value.oldPassword);
        if (!match) {
          throw createError(statusCodes.UNAUTHORIZED, 'Password is not correct!');
        }

        user.password = value.newPassword;
      }

      user.email = value.newEmail;
      user.displayName = value.displayName;

      await user.save();

      return {
        token: user.getToken(),
        user: user.getPublicData(),
      };

    } catch (err) {
      throw err;
    }
  }
}

export default AuthModule;
