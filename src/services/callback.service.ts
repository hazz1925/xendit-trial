import * as uuid from 'uuid'
import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Callback } from '../entities/callback.entity'
import { CallbackDto } from '../dtos/callback.dto'

@Injectable()
export class CallbackService {
  constructor(
    @InjectRepository(Callback) private callbackRepository: Repository<Callback>,
  ) {}

  async createCallback(callbackDto: CallbackDto): Promise<string> {
    try {
      const callbackToken = this.generateToken()
      await this.callbackRepository.save({
        ...callbackDto,
        callbackToken
      })
      return callbackToken
    } catch(error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  private generateToken(): string {
    return uuid.v4()
  }
}
