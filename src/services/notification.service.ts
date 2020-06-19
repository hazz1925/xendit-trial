import axios from 'axios'
import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Notification } from '../entities/notification.entity'
import { Callback } from '../entities/callback.entity'
import { NotifyDto } from '../dtos/notify.dto'
import { SqsService } from './sqs.service';

@Injectable()
export class NotificationService {
  public static readonly PENDING = 'PENDING'
  public static readonly ACKNOWLEDGED = 'ACKNOWLEDGED'

  private static readonly FIFTEEN_MINS = 1000

  constructor(
    @InjectRepository(Callback) private callbackRepository: Repository<Callback>,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    private readonly sqsService: SqsService
  ) {}

  async createAndSendNotification(notifyDto: NotifyDto): Promise<void> {
    try {
      const callback = await this.callbackRepository.findOne({
        accountId: notifyDto.accountId,
        type: notifyDto.type
      })
      const notification = await this.notificationRepository.save({
        callbackId: callback.id,
        paymentId: notifyDto.paymentId,
        tries: 1,
        status: NotificationService.PENDING,
        payload: JSON.stringify(notifyDto.payload)
      })

      const sent = await this.sendNotification(
        notification,
        callback
      )
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async sendNotification(
    notification: Notification,
    callback: Callback
  ) {
    try {
      const res = await axios.post(
        callback.callbackUrl,
        JSON.parse(notification.payload),
        {
          headers: {
            'X-Callback-Token': callback.callbackToken
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
    const callback = await this.callbackRepository.findOne(notification.callbackId)
    this.updateNotification(notification.id, {
      tries: notification.tries + 1
    })
    this.sendNotification(
      notification,
      callback
    )
  }
}
