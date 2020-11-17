import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/auth.service';

class AuthController {
  public authService = new AuthService();

  /**
   * User signUp
   * @param req
   * @param res
   * @param next
   */
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'success',
    });
  }

  /**
   * User login
   * @param req
   * @param res
   * @param next
   */
  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'success',
    });
  }

  /**
   * User logout
   * @param req
   * @param res
   * @param next
   */
  public logOut = async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'success',
    });
  }
}

export default AuthController;
