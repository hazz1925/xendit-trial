import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// controllers
import { CallbackController } from './controllers/callback.controller';
import { NotificationController } from './controllers/notification.controller';

// services
import { CallbackService } from './services/callback.service';
import { NotificationService } from './services/notification.service';

// entities
import { Notification } from './entities/notification.entity'
import { Callback } from './entities/callback.entity'
import { Payload } from './entities/payload.entity'

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
        Callback,
        Payload
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Notification,
      Callback,
      Payload
    ])
  ],
  controllers: [CallbackController, NotificationController],
  providers: [CallbackService, NotificationService],
})
export class AppModule {}
