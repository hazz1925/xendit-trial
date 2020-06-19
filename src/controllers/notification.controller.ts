import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotifyDto } from '../dtos/notify.dto'
import { RetryDto } from '../dtos/retry.dto'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notify')
  async notify(@Body() notifyDto: NotifyDto): Promise<Response> {
    const callbackToken = await this.notificationService
      .createAndSendNotification(notifyDto);
    return {
      message: 'Success'
    }
  }

  @Post('retry')
  // Retry here means recreate a new record in notification table
  async retry(@Body() retryDto: RetryDto): Promise<Response> {
    this.notificationService
      .recreateAndSendNotification(retryDto)
    return {
      message: 'Success'
    }
  }
}

interface Response {
  message: string
}
