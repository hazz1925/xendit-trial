import { Controller, Post, Body } from '@nestjs/common';
import { CallbackService } from '../services/callback.service';
import { CallbackDto } from '../dtos/callback.dto'

@Controller('callback')
export class CallbackController {
  constructor(private readonly callbackService: CallbackService) {}

  @Post('new')
  async create(@Body() callbackDto: CallbackDto): Promise<CreateResponse> {
    const callbackToken = await this.callbackService.createCallback(callbackDto);
    return {
      callbackToken
    }
  }
}

interface CreateResponse {
  callbackToken: string
}
