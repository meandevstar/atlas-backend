import * as Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import Trip from '../models/trips.model';
import Config from '../config';
import * as aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@elastic/elasticsearch';
import { Source, SearchResponse } from '../interfaces/poi.interface';

class TripController {

  private s3 = new aws.S3();
  private S3_BUCKET = Config.awsS3Bucket;
  private esClient = new Client({
    cloud: {
      id: Config.esCloudId,
    },
    auth: {
      username: Config.esUsername,
      password: Config.esPassword,
    },
  });

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
   * Update trip
   */
  public updateTrip = async (req: Request, res: Response, next: NextFunction) => {
    // Validate data from request object
    const schema = Joi.object({
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
      // Get trip object
      const tripObj = await Trip.findById(req.params.tripId);
      if (!tripObj) {
        return res.status(404).json({ message: 'Cannot find trip' });
      }

      // Update trip
      Object.assign(tripObj, value);
      await tripObj.save();

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
   * Delete trip
   */
  public deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
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
      // Get trip object
      const tripObj = await Trip.findById(value.tripId);
      if (!tripObj) {
        return res.status(404).json({ message: 'Cannot find trip' });
      }
      const tripData = tripObj.toObject();

      for (const poi of tripData.data) {
        if (poi.type && poi.type === 'poi' && poi.photos) {
          for (const photo of poi.photos) {
            const params: aws.S3.DeleteObjectRequest = {
              Bucket: this.S3_BUCKET,
              Key: photo.key,
            };

            await this.s3.deleteObject(params).promise();
          }
        }
      }

      // Delete trip
      await tripObj.deleteOne();

      res.status(200).json({
        message: `Successfully removed trip with Id of ${value.tripId}`,
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

  /**
   * Trip POI image upload
   * @param req
   * @param res
   * @param next
   */
  public fileUploadToS3 = async (req: Request, res: Response, next: NextFunction) => {
    const fileType = req.file.originalname.split('.').length === 2 ? req.file.originalname.split('.')[1] : 'jpg';
    const key = `${uuidv4()}.${fileType}`;
    const params: aws.S3.PutObjectRequest = {
      Bucket: this.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
    };

    this.s3.upload(params, (err: Error, data: aws.S3.ManagedUpload.SendData) => {
      if (err) {
        console.log(err.message);
        res.status(422).send(err);
      }

      res.json({ fileURL: data.Location, fileKey: key });
    });
  }

  /**
   * Trip POI image remove
   * @param req
   * @param res
   * @param next
   */
  public fileRemoveFromS3 = async (req: Request, res: Response, next: NextFunction) => {
    const fileKey = req.params.key;
    if (!fileKey) {
      return res.status(400).json({ message: 'Invalid request!' });
    }

    const params: aws.S3.DeleteObjectRequest = {
      Bucket: this.S3_BUCKET,
      Key: fileKey,
    };

    this.s3.deleteObject(params, (err: Error, data: aws.S3.DeleteObjectOutput) => {
      if (err) {
        console.log(err.message);
        res.status(422).send(err);
      }

      res.status(200).json({ message: 'Successfully removed' });
    });
  }

  /**
   * Search POIs by given name, ElasticSearch implemented
   */
  public searchPoiByName = async (req: Request, res: Response, next: NextFunction) => {
    // Validate data from request object
    const schema = Joi.object({
      poiName: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.params);

    // Error handling
    if (error) {
      const message = error.details.length > 0 ? error.details[0].message : 'Invalid request';
      return res.status(400).json({ message });
    }

    try {
      const result = await this.esClient.search<SearchResponse<Source>>({
        index: 'geonames-poi',
        body: {
          from: 0,
          size: 5,
          query: {
            multi_match: {
              fields: ['name', 'admin1_name', 'admin2_name', 'country_code'],
              query: value.poiName,
              fuzziness: '2',
            },
          },
        },
      });

      res.json({
        pois: result.body.hits.hits,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default TripController;
