import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from '../dtos/users.dto';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import userModel from '../models/users.model';

class AuthService {
  public users = userModel;

  public async signup(userData: CreateUserDto): Promise<any> {
    return {};
  }

  public async login(userData: CreateUserDto): Promise<any> {
    return {};
  }

  public async logout(userData: any): Promise<any> {
    return {};
  }

  public createToken(user: any): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secret: string = process.env.JWT_SECRET;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: jwt.sign(dataStoredInToken, secret, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
