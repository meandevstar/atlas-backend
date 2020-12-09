import { Router } from 'express';
import { createController } from '../utils/util';
import { IRoute } from '../interfaces/common.interface';
import UserModule from '../modules/user.module';
import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { getUserSchema, followUserSchema } from '../validators/user.validator';

class UserRoute implements IRoute {
  public path: string;
  public router = Router();
  public userModule = new UserModule();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/:search',
      validate(getUserSchema),
      createController(this.userModule.getUser)
    );
    this.router.post(
      '/follow',
      authMiddleware,
      validate(followUserSchema),
      createController(this.userModule.followUser)
    );
  }
}

export default UserRoute;
