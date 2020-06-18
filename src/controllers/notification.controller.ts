import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotifyDto } from '../dtos/notify.dto'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notify')
  async notify(@Body() notifyDto: NotifyDto): Promise<NotifyResponse> {
    const callbackToken = await this.notificationService
      .createAndSendNotification(notifyDto);
    return {
      message: 'Success'
    }
  }
}

interface NotifyResponse {
  message: string
}
