import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('by-mail')
  async findByMail(@Query('mail') mail: string) {
    if (!mail) {
      throw new BadRequestException('mail is required');
    }
    return await this.userService.findByMail(mail);
  }
}
