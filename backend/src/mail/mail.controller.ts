import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MailService } from './mail.service';

@Controller('mail')
@UseGuards(AuthGuard('jwt'))
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('mailboxes')
  getMailboxes() {
    return this.mailService.getMailboxes();
  }

  @Get('mailboxes/:id/emails')
  getEmails(@Param('id') id: string, @Query('page') page: number = 1) {
    return this.mailService.getEmails(id, page);
  }

  @Get('emails/:id')
  getEmail(@Param('id') id: string) {
    return this.mailService.getEmail(id);
  }
}