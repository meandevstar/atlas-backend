import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';

class AuthRoute implements Route {
  public path: string;
  public router = Router();
  public authController = new AuthController();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/signup', this.authController.signUp);
    this.router.post('/signin', this.authController.signIn);
  }
}

export default AuthRoute;
