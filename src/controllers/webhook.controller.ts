import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { WebhookDto } from '../dtos/webhook.dto'

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('new')
  async create(@Body() webhookDto: WebhookDto): Promise<CreateResponse> {
    const callbackToken = await this.webhookService.createWebhook(webhookDto);
    return {
      callbackToken
    }
  }
}

interface CreateResponse {
  callbackToken: string
}
