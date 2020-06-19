import axios from 'axios'
import * as _ from 'lodash'
import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Notification } from '../entities/notification.entity'
import { Webhook } from '../entities/webhook.entity'
import { NotifyDto } from '../dtos/notify.dto'
import { RetryDto } from '../dtos/retry.dto'
import { SqsService } from './sqs.service';

@Injectable()
export class NotificationService {
  public static readonly PENDING = 'PENDING'
  public static readonly ACKNOWLEDGED = 'ACKNOWLEDGED'
  public static readonly STOP_TRY = 'STOP_TRY'

  private static readonly MAX_TRIES = 5
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

      await this.sendNotification(
        notification,
        webhook
      )
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async recreateAndSendNotification(retryDto: RetryDto): Promise<void> {
    try {
      const webhook = await this.webhookRepository.findOne(retryDto.webhookId)
      const stoppedNotifications = await this.notificationRepository.find({
        webhookId: webhook.id,
        status: NotificationService.STOP_TRY
      })
      const uniqStoppedNoti = _.uniqBy(stoppedNotifications, 'paymentId')

      uniqStoppedNoti.forEach((notification) => {
        this.createAndSendNotification({
          payload: JSON.parse(notification.payload),
          accountId: webhook.accountId,
          type: webhook.type,
          paymentId: notification.paymentId
        })
      })
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private async sendNotification(
    notification: Notification,
    webhook: Webhook
  ): Promise<void> {
    try {
      const res = await this.callUrl(
        webhook.url,
        JSON.parse(notification.payload),
        webhook.token
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

  async callUrl(url: string, payload: object, token: string) {
    return axios.post(
      url,
      payload,
      {
        headers: {
          'X-Callback-Token': token
        },
        timeout: 2000
      }
    )
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

  async retrySendNotification(notificationId: number): Promise<boolean> {
    try {
      const notification = await this.notificationRepository.findOne(notificationId)
      if (notification.tries === NotificationService.MAX_TRIES) {
        this.updateNotification(notification.id, {
          status: NotificationService.STOP_TRY
        })
        return true
      }

      const webhook = await this.webhookRepository.findOne(notification.webhookId)
      this.updateNotification(notification.id, {
        tries: notification.tries + 1
      })
      this.sendNotification(
        notification,
        webhook
      )
      return true
    } catch(error) {
      console.log(error)
      return false
    }
  }
}
