import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly mailboxes = [
    { id: 'inbox', name: 'Inbox', unread: 3 },
    { id: 'starred', name: 'Starred', unread: 0 },
    { id: 'sent', name: 'Sent', unread: 0 },
    { id: 'drafts', name: 'Drafts', unread: 1 },
    { id: 'archive', name: 'Archive', unread: 0 },
    { id: 'trash', name: 'Trash', unread: 0 },
    { id: 'spam', name: 'Spam', unread: 12 },
    { id: 'custom1', name: 'Custom Folder 1', unread: 0 },
    { id: 'custom2', name: 'Custom Folder 2', unread: 5 },
  ];

  private readonly emails: { [key: string]: any[] } = {
    inbox: [
      {
        id: '1',
        sender: 'John Doe',
        subject: 'Hello World',
        preview: 'This is a test email',
        timestamp: '2025-11-15T10:00:00Z',
        starred: false,
        read: false,
      },
      {
        id: '2',
        sender: 'Jane Doe',
        subject: 'Re: Hello World',
        preview: 'This is another test email',
        timestamp: '2025-11-15T11:00:00Z',
        starred: true,
        read: false,
      },
      {
        id: '3',
        sender: 'Peter Jones',
        subject: 'Important Notice',
        preview: 'Please read this important notice',
        timestamp: '2025-11-15T12:00:00Z',
        starred: false,
        read: true,
      },
    ],
    sent: [
      {
        id: '4',
        sender: 'Me',
        subject: 'Test Email',
        preview: 'This is a test email I sent',
        timestamp: '2025-11-15T09:00:00Z',
        starred: false,
        read: true,
      },
    ],
  };

  private readonly emailDetails: { [key: string]: any } = {
    '1': {
      from: 'John Doe <john.doe@example.com>',
      to: 'Me <me@example.com>',
      cc: '',
      subject: 'Hello World',
      received: '2025-11-15T10:00:00Z',
      body: '<p>This is a test email.</p>',
      attachments: [],
    },
    '2': {
      from: 'Jane Doe <jane.doe@example.com>',
      to: 'Me <me@example.com>',
      cc: 'John Doe <john.doe@example.com>',
      subject: 'Re: Hello World',
      received: '2025-11-15T11:00:00Z',
      body: '<p>This is another test email.</p>',
      attachments: [
        { name: 'attachment1.pdf', size: '1.2 MB' },
        { name: 'attachment2.jpg', size: '3.4 MB' },
      ],
    },
    '3': {
      from: 'Peter Jones <peter.jones@example.com>',
      to: 'Me <me@example.com>',
      cc: '',
      subject: 'Important Notice',
      received: '2025-11-15T12:00:00Z',
      body: '<h1>Important Notice</h1><p>Please read this important notice.</p>',
      attachments: [],
    },
    '4': {
      from: 'Me <me@example.com>',
      to: 'test@example.com',
      cc: '',
      subject: 'Test Email',
      received: '2025-11-15T09:00:00Z',
      body: '<p>This is a test email I sent.</p>',
      attachments: [],
    },
  };

  getMailboxes() {
    return this.mailboxes;
  }

  getEmails(mailboxId: string, page: number) {
    return this.emails[mailboxId] || [];
  }

  getEmail(emailId: string) {
    return this.emailDetails[emailId] || null;
  }
}