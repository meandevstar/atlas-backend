import * as Joi from 'joi';

export const getUserSchema = {
  search: Joi.string().required(),
};

export const followUserSchema = {
  username: Joi.string().required(),
}