import { Router } from 'express';
import AuthModule from '../modules/auth.module';
import { createController } from '../utils/util';
import { IRoute } from '../interfaces/common.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { signUpSchema, loginSchema, verifyEmailSchema, resendVerifyEmailSchema } from '../validators/auth.validator';

class AuthRoute implements IRoute {
  public path: string;
  public router = Router();
  public authModule = new AuthModule();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/signup', validate(signUpSchema), createController(this.authModule.signUp));
    this.router.post('/signin', validate(loginSchema), createController(this.authModule.signIn));
    this.router.get('/verify-email-token', validate(verifyEmailSchema), createController(this.authModule.verifyEmailToken));
    this.router.get('/resend-verify-email', validate(resendVerifyEmailSchema), createController(this.authModule.sendVerifyEmail));
    this.router.get('/check-token', authMiddleware, createController(this.authModule.checkToken));
  }
}

export default AuthRoute;
