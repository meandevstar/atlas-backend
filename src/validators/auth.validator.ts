import * as Joi from 'joi';

export const signUpSchema = {
  displayName : Joi.string().required(),
  email : Joi.string().email().required(),
  password : Joi.string().required(),
};

export const loginSchema = {
  email : Joi.string().email().required(),
  password : Joi.string().required(),
};

export const verifyEmailSchema = {
  token: Joi.string().required(),
};

export const resendVerifyEmailSchema = {
  email: Joi.string().email().required(),
};