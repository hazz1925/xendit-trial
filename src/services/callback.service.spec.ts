import { Test, TestingModule } from '@nestjs/testing';
import { CallbackService } from './callback.service';

describe('CallbackService', () => {
  let callbackService: CallbackService;
  const callbackRepoMock = {
    save: jest.fn(),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CallbackService,
        {
          provide: 'CallbackRepository',
          useValue: callbackRepoMock
        },
      ],
    }).compile();

    callbackService = app.get<CallbackService>(CallbackService);
  });

  describe('create callback', () => {
    it('should create callback successfully', async () => {
      const res = await callbackService.createCallback({
        callbackUrl: 'someurl',
        type: 'PAID',
        accountId: 123
      })

      expect(callbackRepoMock.save).toHaveBeenCalled();
      expect(res).toBe(callbackRepoMock.save.mock.calls[0][0].callbackToken)
    });
  });
});
