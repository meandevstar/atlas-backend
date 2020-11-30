import { Router } from 'express';
import * as multer from 'multer';
import TripController from '../controllers/trip.controller';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';

class AuthRoute implements Route {
  public path: string;
  public router = Router();
  public tripController = new TripController();
  public upload = multer();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/create', authMiddleware, this.tripController.createTrip);
    this.router.get('/get/all/:userId', authMiddleware, this.tripController.getAllTrips);
    this.router.get('/get/:tripId', authMiddleware, this.tripController.getTripById);
    this.router.put('/update/:tripId', authMiddleware, this.tripController.updateTrip);
    this.router.post('/poi-img-upload', authMiddleware, this.upload.single('tripImage'), this.tripController.fileUploadToS3);
    this.router.delete('/poi-img-remove/:key', authMiddleware, this.tripController.fileRemoveFromS3);
  }
}

export default AuthRoute;
