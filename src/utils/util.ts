import { NextFunction, Response } from 'express';
import { IControllerData, IRequest } from '../interfaces/common.interface';
import HttpException from '../exceptions/HttpException';
import statusCodes from './statusCodes';

export function isEmptyObject (obj: object): boolean {
  return !Object.keys(obj).length;
};

export function createError(status: number, message: string): HttpException {
  let errorName: string = '';
  let errorMsg: string = message;
  let errorStatus: number = status;

  if (typeof status === 'string') {
    errorStatus = statusCodes.INTERNAL_SERVER_ERROR;
    errorMsg = status;
  }

  switch (errorStatus) {
    case statusCodes.UNAUTHORIZED:
      errorName = 'UnauthorizedError';
      errorMsg = errorMsg || 'Authentication required';

      break;

    case statusCodes.BAD_REQUEST:
      errorName = 'BadRequest';
      errorMsg = errorMsg || 'Invalid request';

      break;

    case statusCodes.FORBIDDEN:
      errorName = 'BadPermission';
      errorMsg = errorMsg || 'Permission denied';

      break;

    case statusCodes.UNPROCESSABLE_ENTITY:
      errorName = 'NotFound';
      errorMsg = errorMsg || 'Entry not found';

      break;

    default:
      errorName = 'Error';
      errorStatus = statusCodes.INTERNAL_SERVER_ERROR;
      errorMsg = errorMsg || 'An error occurred';

      break;
  }

  const error = new HttpException(errorStatus, errorMsg);

  error.name = errorName;
  error.status = errorStatus;
  error.message = errorMsg;

  return error;
}

export function createController(handler: Function) {
  return async function (req: IRequest, res: Response, next: NextFunction) {
    try {
      const data: IControllerData = {
        ...req.body,
        ...req.query,
        ...req.params,
        _req: req,
      };
      const result = await handler(data);

      next(result || 'OK');
    } catch (err) {
      next(HttpException.fromError(err));
    }
  }
}
