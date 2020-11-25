import * as Joi from 'joi';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import User from '../models/users.model';
import { SALT_ROUNDS } from '../constants';
import Config from '../config';
import { DataStoredInToken } from 'interfaces/auth.interface';

class AuthController {
  /**
   * User signUp
   * @param req
   * @param res
   * @param next
   */
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    // Validate data from request object
    const schema = Joi.object({
      displayName   : Joi.string().required(),
      email         : Joi.string().email().required(),
      password      : Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);

    // Error handling
    if (error) {
      const message = error.details.length > 0 ? error.details[0].message : 'Invalid request';
      return res.status(400).json({ message });
    }
    value.email = value.email.toLowerCase().trim();
    value.password = await bcrypt.hash(value.password, SALT_ROUNDS);

    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email: value.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Create user
      const userObj = await User.create(value);
      res.status(200).json({
        message: `${value.displayName} successfully signed up!`,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * User signIn
   * @param req
   * @param res
   * @param next
   */
  public signIn = async (req: Request, res: Response, next: NextFunction) => {
    // Validate data from request object
    const schema = Joi.object({
      email    : Joi.string().email().required(),
      password : Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);

    // Error handling
    if (error) {
      const message = error.details.length > 0 ? error.details[0].message : 'Invalid request';
      return res.status(400).json({ message });
    }
    value.email = value.email.toLowerCase().trim();
    const { email, password } = value;

    try {
      const userObj = await User.findOne({ email }, {});
      if (!userObj) {
        return res.status(401).json({ message: 'No user with that email registered' });
      }

      // Validate password
      const userData = userObj.toObject();
      const match = await bcrypt.compare(password, userData.password);
      if (!match) {
        return res.status(401).json({ message: 'Wrong password or username' });
      }

      // Generate token
      const tokenData: DataStoredInToken = {
        id: userData._id,
        email: userData.email,
      };
      const token = jwt.sign(tokenData, Config.jwtSecret, Config.jwtExpires);

      // Return
      const data = {
        _id         : userData._id,
        email       : userData.email,
        displayName : userData.displayName,
      };
      res.json({ token, user: data });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Check token
   * @param req
   * @param res
   * @param next
   */
  public checkToken = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    const secret = process.env.JWT_SECRET;

    try {
      const tokenData = jwt.verify(authorization.split(' ')[1], secret) as DataStoredInToken;
      const newToken = jwt.sign({ id: tokenData.id, email: tokenData.email }, Config.jwtSecret, Config.jwtExpires);

      const userObj = await User.findById(tokenData.id);
      const userData = userObj.toObject();
      const data = {
        _id         : userData._id,
        email       : userData.email,
        displayName : userData.displayName,
      };

      res.json({ token: newToken, user: data });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default AuthController;
