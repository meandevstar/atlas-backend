import * as Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import Trip from '../models/trips.model';
import Config from '../config';

class TripController {

  /**
   * Create new trip
   */
  public createTrip = async (req: Request, res: Response, next: NextFunction) => {
    // Validate data from request object
    const schema = Joi.object({
      tripName: Joi.string().required(),
      data : Joi.array().required(),
    });
    const { error, value } = schema.validate(req.body);

    // Error handling
    if (error) {
      const message = error.details.length > 0 ? error.details[0].message : 'Invalid request';
      return res.status(400).json({ message });
    }

    try {
      const tripObj = await Trip.create(value);

      // Return
      const tripData = tripObj.toObject();
      const resData = {
        _id         : tripData._id,
        tripName    : tripData.tripName,
        data        : tripData.data,
      };

      res.status(200).json({
        data: resData,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default TripController;
