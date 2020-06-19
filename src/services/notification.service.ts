import axios from 'axios'
import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Notification } from '../entities/notification.entity'
import { Webhook } from '../entities/webhook.entity'
import { NotifyDto } from '../dtos/notify.dto'
import { SqsService } from './sqs.service';

@Injectable()
export class NotificationService {
  public static readonly PENDING = 'PENDING'
  public static readonly ACKNOWLEDGED = 'ACKNOWLEDGED'

  private static readonly FIFTEEN_MINS = 1000

  constructor(
    @InjectRepository(Webhook) private webhookRepository: Repository<Webhook>,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    private readonly sqsService: SqsService
  ) {}

  async createAndSendNotification(notifyDto: NotifyDto): Promise<void> {
    try {
      const webhook = await this.webhookRepository.findOne({
        accountId: notifyDto.accountId,
        type: notifyDto.type
      })
      const notification = await this.notificationRepository.save({
        webhookId: webhook.id,
        paymentId: notifyDto.paymentId,
        tries: 1,
        status: NotificationService.PENDING,
        payload: JSON.stringify(notifyDto.payload)
      })

      const sent = await this.sendNotification(
        notification,
        webhook
      )
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async sendNotification(
    notification: Notification,
    webhook: Webhook
  ) {
    try {
      const res = await axios.post(
        webhook.url,
        JSON.parse(notification.payload),
        {
          headers: {
            'X-Callback-Token': webhook.token
          },
          timeout: 2000
        }
      )

      if (res.status === 200) {
        this.updateNotification(notification.id, {
          status: NotificationService.ACKNOWLEDGED
        })
      } else {
        this.pushToRetryQueue(notification.id)
      }
    } catch(error) {
      this.pushToRetryQueue(notification.id)
    }
  }

  private pushToRetryQueue(notificationId) {
    setTimeout(() => {
      this.sqsService.sendMessage({
        notificationId
      })
    }, NotificationService.FIFTEEN_MINS)
  }

  async updateNotification(id: number, partialNotification: Partial<Notification>) {
    this.notificationRepository.update(id, partialNotification)
  }

  async retrySendNotification(notificationId: number) {
    const notification = await this.notificationRepository.findOne(notificationId)
    const webhook = await this.webhookRepository.findOne(notification.webhookId)
    this.updateNotification(notification.id, {
      tries: notification.tries + 1
    })
    this.sendNotification(
      notification,
      webhook
    )
  }
}
