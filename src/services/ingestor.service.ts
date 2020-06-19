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
    this.process()
  }

  async process() {
    const res = await this.sqsService.receiveMessage()
    res.Messages.forEach((message) => {
      const body = JSON.parse(message.Body)
      console.log(body)
      this.handleMessage(body)
    })
  }

  handleMessage(message: Message) {
    this.notificationService
      .retrySendNotification(message.notificationId)
  }
}
