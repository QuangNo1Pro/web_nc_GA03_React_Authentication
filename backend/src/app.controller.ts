import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectModel('User') private userModel: Model<any>) {}
  @Get('db')
  async showDatabase() {
    const users = await this.userModel.find().lean();
    return {
      count: users.length,
      data: users,
    };
  }
}
