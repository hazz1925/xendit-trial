import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { WebhookDto } from '../dtos/webhook.dto'

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('new')
  async create(@Body() webhookDto: WebhookDto): Promise<CreateResponse> {
    const webhook = await this.webhookService.createWebhook(webhookDto);
    return {
      webhookId: webhook.id,
      webhookToken: webhook.token
    }
  }

  @Get('token/:webhookId')
  async retrieve(@Param() params): Promise<CreateResponse> {
    const webhook = await this.webhookService.get(params.webhookId);
    return {
      webhookId: webhook.id,
      webhookToken: webhook.token
    }
  }

  @Get('test/:webhookId')
  async test(@Param() params): Promise<Response> {
    const success = await this.webhookService.testWebhook(params.webhookId)
    if (success) {
      return {
        message: 'Success'
      }
    } else {
      return {
        message: 'Fail'
      }
    }
  }
}

interface CreateResponse {
  webhookId: number
  webhookToken: string
}

interface Response {
  message: string
}
