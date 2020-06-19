import * as uuid from 'uuid'
import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Webhook } from '../entities/webhook.entity'
import { WebhookDto } from '../dtos/webhook.dto'

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook) private webhookRepository: Repository<Webhook>,
  ) {}

  async createWebhook(webhookDto: WebhookDto): Promise<string> {
    try {
      const token = this.generateToken()
      await this.webhookRepository.save({
        ...webhookDto,
        token
      })
      return token
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private generateToken(): string {
    return uuid.v4()
  }
}
