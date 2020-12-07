import * as aws from 'aws-sdk';
import { IEmailPayload } from '../interfaces/common.interface';
import Config from '../config';

class SESModule {

  private ses = new aws.SES();

  constructor() {
    aws.config.update({
      secretAccessKey: Config.awsSecretAccessKey,
      accessKeyId: Config.awsAccessKeyId,
      region: Config.awsRegion,
    });
  }

  public sendEmail = async (payload: IEmailPayload) => {
    const receipients =
      typeof payload.receipients === 'string'
        ? payload.receipients.split(',')
        : payload.receipients;

    const params: aws.SES.SendEmailRequest = {
      Destination: {
        ToAddresses: receipients
      },
      Message: {
        Body: {
          Html: {
            Data: payload.body,
          }
        },
        Subject: {
          Data: payload.subject,
        }
      },
      Source: Config.systemEmail,
    }

    return this.ses.sendEmail(params).promise();
  }
}

export default SESModule;