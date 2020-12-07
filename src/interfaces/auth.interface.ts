export interface IDataStoredInToken {
  _id: string;
  email: string;
}

export interface ITokenData {
  token: string;
  expiresIn: number;
}

export interface ISignInData {
  email: string;
  password: string;
}