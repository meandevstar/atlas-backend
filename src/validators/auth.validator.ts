import * as Joi from 'joi';
import { REGEX } from '../utils/util';

export const signUpSchema = {
  displayName: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().regex(REGEX.email).required(),
};

export const loginSchema = {
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const verifyEmailSchema = {
  token: Joi.string().required(),
};

export const resendVerifyEmailSchema = {
  email: Joi.string().email().required(),
};

export const passwordResetSchema = {
  email: Joi.string().email().required(),
};

export const verifyPasswordTokenSchema = {
  token: Joi.string().required(),
  password: Joi.string().regex(REGEX.email).required(),
};

export const updateUserSchema = {
  oldEmail: Joi.string().email().required(),
  newEmail: Joi.string().email().required(),
  displayName: Joi.string().required(),
  newPassword: Joi.string().allow(''),
  oldPassword: Joi.string().allow(''),
};
