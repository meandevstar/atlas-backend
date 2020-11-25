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
      userId: Joi.string().required(),
      tripName: Joi.string().required(),
      data : Joi.array().required(),
      published: Joi.boolean(),
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
        userId      : tripData.userId,
        tripName    : tripData.tripName,
        data        : tripData.data,
        published   : tripData.published || false,
      };

      res.status(200).json({
        data: resData,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Get all trips for given user
   */
  public getAllTrips = async (req: Request, res: Response, next: NextFunction) => {
    // Validate data from request object
    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.params);

    // Error handling
    if (error) {
      const message = error.details.length > 0 ? error.details[0].message : 'Invalid request';
      return res.status(400).json({ message });
    }

    try {
      const trips = await Trip.find({ userId: value.userId });

      res.status(200).json({
        data: trips,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Get trip by id
   */
  public getTripById = async (req: Request, res: Response, next: NextFunction) => {
    // Validate data from request object
    const schema = Joi.object({
      tripId: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.params);

    // Error handling
    if (error) {
      const message = error.details.length > 0 ? error.details[0].message : 'Invalid request';
      return res.status(400).json({ message });
    }

    try {
      const trip = await Trip.findOne({ _id: value.tripId });

      res.status(200).json({
        data: trip,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default TripController;
