import statusCodes from '../utils/statusCodes';

class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }

  public static fromError(err: any) {
    if (!err.status) {
      return new HttpException(statusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
    
    return err;
  }
}

export default HttpException; 
