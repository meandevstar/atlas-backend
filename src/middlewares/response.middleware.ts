import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import statusCodes from '../utils/statusCodes';

function responseHandler(data: HttpException | any, req: Request, res: Response, next: NextFunction) {
  if (data instanceof HttpException) {
    console.log(data);
    return res.status(data.status || statusCodes.INTERNAL_SERVER_ERROR).json({
      name: data.name || 'Error',
      message: data.message || 'Server Error',
    });
  }

  if (data === 'OK') {
    res.status(statusCodes.OK).send();
  } else {
    res.status(statusCodes.OK).json(data);
  }
}

export default responseHandler;
