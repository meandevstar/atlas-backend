import { IncomingHttpHeaders } from 'http';
import { Router, Request } from 'express';
import { Document } from 'mongoose';
import { IUser } from '../models/users.model';

export interface IControllerData {
  _auth?: IUser;
  _headers?: IncomingHttpHeaders;
  [key: string]: any;
}

export interface IRequest extends Request {
  auth?: IUser;
}

export interface IRoute {
  path?: string;
  router: Router;
}

export interface IDocument<T> extends Document {
  getPublicData: () => Partial<T>;
}
