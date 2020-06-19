import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from '../services/webhook.service';

describe.skip('WebhookController', () => {
  let webhookController: WebhookController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [WebhookService],
    }).compile();

    webhookController = app.get<WebhookController>(WebhookController);
  });

  describe('create', () => {
    it('should create new webhook', () => {
    });
  });
});
