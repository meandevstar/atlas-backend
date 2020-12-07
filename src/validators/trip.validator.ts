import * as Joi from 'joi';

export const createSchema = {
  tripName: Joi.string().required(),
  data : Joi.array().required(),
  published: Joi.boolean(),
};

export const updateSchema = {
  tripId: Joi.string().required(),
  tripName: Joi.string().required(),
  data: Joi.array().required(),
  published: Joi.boolean(),
};

export const tripIdSchema = {
  tripId: Joi.string().required(),
};

export const userIdSchema = {
  userId: Joi.string().required(),
};
