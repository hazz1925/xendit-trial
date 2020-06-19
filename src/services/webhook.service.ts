import * as uuid from 'uuid'
import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Webhook } from '../entities/webhook.entity'
import { TestPayload } from '../entities/test-payload.entity'
import { WebhookDto } from '../dtos/webhook.dto'
import { NotificationService } from './notification.service'

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook) private webhookRepository: Repository<Webhook>,
    @InjectRepository(TestPayload) private testPayloadRepository: Repository<TestPayload>,
    private readonly notificationService: NotificationService,
  ) {}

  async createWebhook(webhookDto: WebhookDto): Promise<Webhook> {
    try {
      const token = this.generateToken()
      return this.webhookRepository.save({
        ...webhookDto,
        token
      })
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async get(id): Promise<Webhook> {
    try {
      return this.webhookRepository.findOne(id)
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async testWebhook(id): Promise<boolean> {
    try {
      const webhook = await this.webhookRepository.findOne(id)
      const testPayload = await this.testPayloadRepository.findOne({
        type: webhook.type
      })
      const res = await this.notificationService.callUrl(
        webhook.url,
        JSON.parse(testPayload.payload),
        webhook.token
      )
      return res.status === 200
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async regenerateToken(id): Promise<string> {
    try {
      const webhook = await this.webhookRepository.findOne(id)
      const token = this.generateToken()
      await this.webhookRepository.update(id, { token })
      return token
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private generateToken(): string {
    return uuid.v4()
  }
}
