import axios from 'axios'
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { SqsService } from './sqs.service';

jest.mock('axios')

describe('NotificationService', () => {
  let notificationService: NotificationService;
  const notificationRepoMock = {
    save: jest.fn(),
    update: jest.fn(),
  }
  const webhookRepoMock = {
    findOne: jest.fn(),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        SqsService,
        {
          provide: 'NotificationRepository',
          useValue: notificationRepoMock
        },
        {
          provide: 'WebhookRepository',
          useValue: webhookRepoMock
        },
      ],
    }).compile();

    notificationService = app.get<NotificationService>(NotificationService);
  });

  describe('create and send notification', () => {
    it('should create and send notification successfully', async () => {
      const payload = {
        message: 'test payload'
      }
      webhookRepoMock.findOne.mockResolvedValue({
        id: 1,
        type: 'PAYMENT',
        accountId: 234,
        url: 'someurl',
        token: 'sometoken'
      })
      notificationRepoMock.save.mockResolvedValue({
        id: 1,
        webhookId: 1,
        paymentId: 987,
        tries: 1,
        status: NotificationService.PENDING,
        payload: JSON.stringify(payload)
      });
      (axios.post as jest.Mock).mockImplementationOnce((req) => {
        Promise.resolve({
          status: 200
        })
      })

      const res = await notificationService.createAndSendNotification({
        type: 'PAYMENT',
        accountId: 234,
        paymentId: 123,
        payload
      })

      expect(notificationRepoMock.update).toHaveBeenCalled();
    });
  });
});
