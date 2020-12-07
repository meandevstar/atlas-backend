import * as Joi from 'joi';
import { RequestHandler } from 'express';
import HttpException from '../exceptions/HttpException';

function validate(schemaObj: any): RequestHandler {
  return (req, res, next) => {
    const schema = Joi.object(schemaObj);
    const { error, value } = schema.validate({
      ...req.body,
      ...req.query,
      ...req.params
    });

    if (error) {
      return next(new HttpException(400, error.details[0]?.message || 'Invalid request'));
    }

    if (req.method === 'GET') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
}

export default validate;
