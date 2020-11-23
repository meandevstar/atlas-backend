import { Request } from 'express';

export interface DataStoredInToken {
  id: string;
  email: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}
