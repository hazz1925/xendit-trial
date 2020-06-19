import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// controllers
import { WebhookController } from './controllers/webhook.controller';
import { NotificationController } from './controllers/notification.controller';

// services
import { WebhookService } from './services/webhook.service';
import { NotificationService } from './services/notification.service';
import { SqsService } from './services/sqs.service';
import { IngestorService } from './services/ingestor.service';

// entities
import { Notification } from './entities/notification.entity'
import { Webhook } from './entities/webhook.entity'
import { TestPayload } from './entities/test-payload.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'notificationapp',
      password: 'password',
      database: 'xendit',
      entities: [
        Notification,
        Webhook,
        TestPayload
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Notification,
      Webhook,
      TestPayload
    ])
  ],
  controllers: [
    WebhookController,
    NotificationController
  ],
  providers: [
    WebhookService,
    NotificationService,
    SqsService,
    IngestorService
  ],
})
export class AppModule {}
