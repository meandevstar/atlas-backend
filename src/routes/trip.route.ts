import { Router } from 'express';
import * as multer from 'multer';
import { createController } from '../utils/util';
import TripModule from '../modules/trip.module';
import { IRoute } from '../interfaces/common.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { createSchema, tripIdSchema, updateSchema, userIdSchema } from '../validators/trip.validator';

class TripRoute implements IRoute {
  public path: string;
  public router = Router();
  public tripModule = new TripModule();
  public upload = multer();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/create', authMiddleware, validate(createSchema), createController(this.tripModule.createTrip));
    this.router.get('/get/all/:userId', authMiddleware, validate(userIdSchema), createController(this.tripModule.getAllTrips));
    this.router.get('/get/:tripId', authMiddleware, validate(tripIdSchema), createController(this.tripModule.getTripById));
    this.router.put('/update/:tripId', authMiddleware, validate(updateSchema), createController(this.tripModule.updateTrip));
    this.router.delete('/:tripId', authMiddleware, validate(tripIdSchema), createController(this.tripModule.deleteTrip));
    this.router.post('/poi-img-upload', authMiddleware, this.upload.single('tripImage'), this.tripModule.fileUploadToS3);
    this.router.delete('/poi-img-remove/:key', authMiddleware, this.tripModule.fileRemoveFromS3);
  }
}

export default TripRoute;
