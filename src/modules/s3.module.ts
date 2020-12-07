import * as aws from 'aws-sdk';
import Config from '../config';

class S3Module {

  private s3 = new aws.S3();
  private S3_BUCKET = Config.awsS3Bucket;

  constructor() {
    aws.config.update({
      secretAccessKey: Config.awsSecretAccessKey,
      accessKeyId: Config.awsAccessKeyId,
      region: Config.awsRegion,
    });
  }

  public deleteObject = (key: string) => {
    const params: aws.S3.DeleteObjectRequest = {
      Bucket: this.S3_BUCKET,
      Key: key,
    };

    return this.s3.deleteObject(params).promise();
  }

  public uploadObject = (key: string, body: Buffer) => {
    const params: aws.S3.PutObjectRequest = {
      Bucket: this.S3_BUCKET,
      Key: key,
      Body: body,
    };

    return this.s3.upload(params);
  }

}

export default S3Module;