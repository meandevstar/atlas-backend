import * as aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';
import Trip, { ITrip } from '../models/trips.model';
import Config from '../config';
import { IControllerData } from '../interfaces/common.interface';
import statusCodes from '../utils/statusCodes';
import { createError } from '../utils/util';

class TripController {
  private s3 = new aws.S3();
  private S3_BUCKET = Config.awsS3Bucket;

  constructor() {
    aws.config.update({
      secretAccessKey: Config.awsSecretAccessKey,
      accessKeyId: Config.awsAccessKeyId,
      region: Config.awsRegion,
    });
  }

  /**
   * Create new trip
   */
  public async createTrip (payload: Partial<ITrip>) {
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
  public async updateTrip (payload: IControllerData) {
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
  public async deleteTrip (payload: IControllerData) {
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
          const params: aws.S3.DeleteObjectRequest = {
            Bucket: this.S3_BUCKET,
            Key: photo.key,
          };

          photoDeleteActions.push(this.s3.deleteObject(params).promise());
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
  public async getAllTrips (payload: IControllerData) {
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
  public async getTripById (payload: IControllerData) {
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
  public fileUploadToS3 = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const ext =
      req.file.originalname.split('.').length === 2
        ? req.file.originalname.split('.')[1]
        : 'jpg';
    const key = `${uuidv4()}.${ext}`;
    const params: aws.S3.PutObjectRequest = {
      Bucket: this.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
    };

    this.s3.upload(
      params,
      (err: Error, data: aws.S3.ManagedUpload.SendData) => {
        if (err) {
          console.log(err.message);
          res.status(422).send(err);
        }

        res.json({ fileURL: data.Location, fileKey: key });
      }
    );
  };

  /**
   * Trip POI image remove
   */
  public fileRemoveFromS3 = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const fileKey = req.params.key;
    if (!fileKey) {
      return res.status(400).json({ message: 'Invalid request!' });
    }

    const params: aws.S3.DeleteObjectRequest = {
      Bucket: this.S3_BUCKET,
      Key: fileKey,
    };

    this.s3.deleteObject(
      params,
      (err: Error, data: aws.S3.DeleteObjectOutput) => {
        if (err) {
          console.log(err.message);
          res.status(422).send(err);
        }

        res.status(200).json({ message: 'Successfully removed' });
      }
    );
  };
}

export default TripController;
