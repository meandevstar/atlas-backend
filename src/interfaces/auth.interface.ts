import { IUser } from 'models/users.model';

export interface IDataStoredInToken {
  _id: string;
  email: string;
}

export interface IDataStoredInEmailToken {
  id: string;
}

export interface IDataStoredInPasswordToken {
  id: string;
  password: string;
}

export interface ITokenData {
  token: string;
  expiresIn: number;
}

export interface ISignInData {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token?: string;
  user: Partial<IUser>;
}