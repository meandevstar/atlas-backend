import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { createController } from '../utils/util';
import { IRoute } from '../interfaces/common.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { signUpSchema, loginSchema } from '../validators/auth.validator';

class AuthRoute implements IRoute {
  public path: string;
  public router = Router();
  public authController = new AuthController();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/signup', validate(signUpSchema), createController(this.authController.signUp));
    this.router.post('/signin', validate(loginSchema), createController(this.authController.signIn));
    this.router.get('/check-token', authMiddleware, createController(this.authController.checkToken));
  }
}

export default AuthRoute;
