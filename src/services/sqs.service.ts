import * as aws from 'aws-sdk'
import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';

@Injectable()
export class SqsService {
  private queueUrl = 'http://localhost:9324/queue/default'
  private sqs = new aws.SQS({
    apiVersion: '2012-11-05',
    endpoint: 'http://localhost:9324',
    accessKeyId: 'notAnAccessKeyId',
    secretAccessKey: 'notASecret',
    region: 'eu-central-1'
  })

  async sendMessage(payload: object) {
    try {
      const res = await this.sqs.sendMessage({
        MessageBody: JSON.stringify(payload),
        QueueUrl: this.queueUrl
      }).promise()
      console.log(res)
    } catch(error) {
      console.error(error)
      throw new Error('Sending message to SQS failed.')
    }
  }
}
