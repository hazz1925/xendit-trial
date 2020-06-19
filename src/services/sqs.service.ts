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
    } catch(error) {
      console.error(error)
      throw new Error('Sending message to SQS failed.')
    }
  }

  async receiveMessage() {
    try {
      return this.sqs.receiveMessage({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 120
      }).promise()
    } catch(error) {
      console.error(error)
      throw new Error('Receiving message from SQS failed.')
    }
  }

  async deleteMessage(receiptHandle: string) {
    try {
      return this.sqs.deleteMessage({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle
      }).promise()
    } catch(error) {
      console.error(error)
      throw new Error('Deleting message from SQS failed.')
    }
  }
}
