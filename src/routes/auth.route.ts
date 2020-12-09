import { Router } from 'express';
import AuthModule from '../modules/auth.module';
import { createController } from '../utils/util';
import { IRoute } from '../interfaces/common.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import {
  signUpSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerifyEmailSchema,
  passwordResetSchema,
  verifyPasswordTokenSchema,
  updateUserSchema,
} from '../validators/auth.validator';

class AuthRoute implements IRoute {
  public path: string;
  public router = Router();
  public authModule = new AuthModule();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/signup',
      validate(signUpSchema),
      createController(this.authModule.signUp)
    );
    this.router.post(
      '/signin',
      validate(loginSchema),
      createController(this.authModule.signIn)
    );
    this.router.get(
      '/verify-email-token',
      validate(verifyEmailSchema),
      createController(this.authModule.verifyEmailToken)
    );
    this.router.get(
      '/resend-verify-email',
      validate(resendVerifyEmailSchema),
      createController(this.authModule.sendVerifyEmail)
    );
    this.router.post(
      '/verify-password-token',
      validate(verifyPasswordTokenSchema),
      createController(this.authModule.verifyPasswordToken)
    );
    this.router.post(
      '/reset-password',
      validate(passwordResetSchema),
      createController(this.authModule.sendResetPasswordEmail)
    );
    this.router.get(
      '/check-token',
      authMiddleware,
      createController(this.authModule.checkToken)
    );
    this.router.put(
      '/profile',
      authMiddleware,
      validate(updateUserSchema),
      createController(this.authModule.updateUser)
    );
  }
}

export default AuthRoute;
