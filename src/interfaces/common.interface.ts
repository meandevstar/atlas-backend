import { IncomingHttpHeaders } from 'http';
import { Router, Request } from 'express';
import { Document } from 'mongoose';
import { IUser } from '../models/users.model';

export interface IControllerData {
  _req?: IRequest;
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

export interface IEmailPayload {
  receipients: string | string[];
  subject: string;
  body: string;
}