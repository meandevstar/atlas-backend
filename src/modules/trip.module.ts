import * as aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';
import Trip, { ITrip } from '../models/trips.model';
import S3Module from './s3.module';
import { IControllerData } from '../interfaces/common.interface';
import statusCodes from '../utils/statusCodes';
import { createError } from '../utils/util';

class TripModule {

  private s3: S3Module;
  
  constructor() {
    this.s3 = new S3Module();
  }

  /**
   * Create new trip
   */
  public createTrip = async (payload: Partial<ITrip>) => {
    try {
      const trip = await new Trip(payload).save();

      return trip.getPublicData();
    } catch (err) {
      throw err;
    }
  };

  /**
   * Update trip
   */
  public updateTrip = async (payload: IControllerData) => {
    const { tripId, ...newPayload } = payload;

    try {
      // Get trip object
      const trip = await Trip.findByIdAndUpdate(tripId, newPayload, {
        lean: true,
      });

      return trip.getPublicData();
    } catch (err) {
      throw err;
    }
  };

  /**
   * Delete trip
   */
  public deleteTrip = async (payload: IControllerData) => {
    try {
      const trip = await Trip.findById(payload.tripId);
      if (!trip) {
        throw createError(statusCodes.NOT_FOUND, 'Cannot find trip');
      }

      const photoDeleteActions = [];
      for (const poi of trip.data) {
        if (!poi.type || poi.type !== 'poi' || !poi.photos) {
          continue;
        }
        for (const photo of poi.photos) {
          photoDeleteActions.push(this.s3.deleteObject(photo.key));
        }
      }

      await Promise.all(photoDeleteActions);
      await trip.deleteOne();

      return {
        message: `Successfully removed trip with Id of ${payload.tripId}`,
      };
    } catch (err) {
      throw err;
    }
  };

  /**
   * Get all trips for given user
   */
  public getAllTrips = async (payload: IControllerData) => {
    try {
      const data = await Trip.find({ user: payload.userId }).lean();

      return { data };
    } catch (err) {
      throw err;
    }
  };

  /**
   * Get trip by id
   */
  public getTripById = async (payload: IControllerData) => {
    try {
      const data = await Trip.findById(payload.tripId);

      if (!data) {
        throw createError(statusCodes.NOT_FOUND, 'Trip not found');
      }

      return { data };
    } catch (err) {
      throw err;
    }
  };

  /**
   * Trip POI image upload
   */
  public fileUploadToS3 = async ({ _req: { file } }: IControllerData) => {
    try {
      const ext =
        file.originalname.split('.').length === 2
          ? file.originalname.split('.')[1]
          : 'jpg';
      const key = `${uuidv4()}.${ext}`;

      const data: any = await this.s3.uploadObject(key, file.buffer);

      return {
        fileURL: data.Location,
        fileKey: key
      };
    } catch (err) {
      throw err;
    }
  };

  /**
   * Trip POI image remove
   */
  public fileRemoveFromS3 = async ({ _req: { params } }: IControllerData) => {
    try {
      const fileKey = params.key;
      if (!fileKey) {
        throw createError(statusCodes.BAD_REQUEST, 'Invalid request!');
      }

      await this.s3.deleteObject(fileKey);

      return { message: 'Successfully removed' };
    } catch (err) {
      throw err;
    }
  };
}

export default TripModule;
