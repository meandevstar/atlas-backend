import { Router } from 'express';
import * as multer from 'multer';
import { createController } from '../utils/util';
import TripController from '../controllers/trip.controller';
import { IRoute } from '../interfaces/common.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import { createSchema, tripIdSchema, updateSchema, userIdSchema } from '../validators/trip.validator';

class TripRoute implements IRoute {
  public path: string;
  public router = Router();
  public tripController = new TripController();
  public upload = multer();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/create', authMiddleware, validate(createSchema), createController(this.tripController.createTrip));
    this.router.get('/get/all/:userId', authMiddleware, validate(userIdSchema), createController(this.tripController.getAllTrips));
    this.router.get('/get/:tripId', authMiddleware, validate(tripIdSchema), createController(this.tripController.getTripById));
    this.router.put('/update/:tripId', authMiddleware, validate(updateSchema), createController(this.tripController.updateTrip));
    this.router.delete('/:tripId', authMiddleware, validate(tripIdSchema), createController(this.tripController.deleteTrip));
    this.router.post('/poi-img-upload', authMiddleware, this.upload.single('tripImage'), this.tripController.fileUploadToS3);
    this.router.delete('/poi-img-remove/:key', authMiddleware, this.tripController.fileRemoveFromS3);
  }
}

export default TripRoute;
