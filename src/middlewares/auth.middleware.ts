import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import statusCodes from '../utils/statusCodes';
import HttpException from '../exceptions/HttpException';
import { IDataStoredInToken } from '../interfaces/auth.interface';
import User from '../models/users.model';
import { IRequest } from '../interfaces/common.interface';
import Config from '../config';

async function authMiddleware(req: IRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new HttpException(statusCodes.UNAUTHORIZED, 'Please sign in'));
  }

  if (authorization) {
    try {
      const tokenData = jwt.verify(authorization.split(' ')[1], Config.jwtSecret) as IDataStoredInToken;
      const user = await User.findById(tokenData._id);

      if (!user) {
        throw new Error();
      }

      req.auth = user;
      next();
    } catch (error) {
      next(new HttpException(statusCodes.UNAUTHORIZED, 'Session expired'));
    }
  }
}

export default authMiddleware;
