import { Controller, Get, Param, Query, UseGuards, Patch, Body, Delete, Post } from '@nestjs/common';
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

  // PATCH /mail/emails/:id/star
  @Patch('emails/:id/star')
  setStarred(@Param('id') id: string, @Body('starred') starred: boolean) {
    return this.mailService.setEmailStarred(id, starred);
  }

  // PATCH /mail/emails/:id/read
  @Patch('emails/:id/read')
  setRead(@Param('id') id: string, @Body('read') read: boolean) {
    return this.mailService.setEmailRead(id, read);
  }

  // DELETE /mail/emails - bulk delete
  @Delete('emails')
  deleteEmails(@Body('ids') ids: string[]) {
    return this.mailService.deleteEmails(ids);
  }

  // PATCH /mail/emails/bulk-read - bulk mark read/unread
  @Patch('emails/bulk-read')
  bulkSetRead(@Body('ids') ids: string[], @Body('read') read: boolean) {
    return this.mailService.bulkSetRead(ids, read);
  }

  // POST /mail/send - send email
  @Post('send')
  sendEmail(@Body() emailData: { to: string; subject: string; body: string }) {
    return this.mailService.sendEmail(emailData);
  }
}