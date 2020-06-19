import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  let webhookService: WebhookService;
  const webhookRepoMock = {
    save: jest.fn(),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: 'WebhookRepository',
          useValue: webhookRepoMock
        },
      ],
    }).compile();

    webhookService = app.get<WebhookService>(WebhookService);
  });

  describe('create webhook', () => {
    it('should create webhook successfully', async () => {
      const res = await webhookService.createWebhook({
        url: 'someurl',
        type: 'PAID',
        accountId: 123
      })

      expect(webhookRepoMock.save).toHaveBeenCalled();
      expect(res).toBe(webhookRepoMock.save.mock.calls[0][0].token)
    });
  });
});
