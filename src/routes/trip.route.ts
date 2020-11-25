import { Router } from 'express';
import TripController from '../controllers/trip.controller';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';

class AuthRoute implements Route {
  public path: string;
  public router = Router();
  public tripController = new TripController();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/create', authMiddleware, this.tripController.createTrip);
    this.router.get('/get/all/:userId', authMiddleware, this.tripController.getAllTrips);
    this.router.get('/get/:tripId', authMiddleware, this.tripController.getTripById);
    this.router.put('/update/:tripId', authMiddleware, this.tripController.updateTrip);
  }
}

export default AuthRoute;
