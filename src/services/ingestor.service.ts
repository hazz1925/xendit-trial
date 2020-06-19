import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { SqsService } from './sqs.service'
import { NotificationService } from './notification.service'

interface Message {
  notificationId: number
}

@Injectable()
export class IngestorService {
  constructor(
    private readonly sqsService: SqsService,
    private readonly notificationService: NotificationService,
  ) {
    console.log('starting ingestor')
    setInterval(() => {
      this.process()
    }, 15000)
  }

  async process() {
    const res = await this.sqsService.receiveMessage()
    res.Messages?.forEach(this.handleMessage.bind(this))
  }

  async handleMessage(message) {
    const body = JSON.parse(message.Body)
    console.log('processing message', body)
    const success = await this.notificationService
      .retrySendNotification(body.notificationId)

    if (success) {
      await this.sqsService.deleteMessage(message.ReceiptHandle)
    }
  }
}
