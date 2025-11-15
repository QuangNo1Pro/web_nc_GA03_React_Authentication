import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  FiInbox,
  FiStar,
  FiSend,
  FiFileText,
  FiArchive,
  FiTrash2,
  FiFolder,
  FiEdit,
  FiRefreshCw,
  FiMoreVertical,
} from 'react-icons/fi';

const mailboxIcons = {
  inbox: <FiInbox />,
  starred: <FiStar />,
  sent: <FiSend />,
  drafts: <FiFileText />,
  archive: <FiArchive />,
  trash: <FiTrash2 />,
  spam: <FiFolder />,
  custom1: <FiFolder />,
  custom2: <FiFolder />,
};

const fetchMailboxes = async () => {
  const { data } = await api.get('/mail/mailboxes');
  return data;
};

const fetchEmails = async (mailboxId: string) => {
  const { data } = await api.get(`/mail/mailboxes/${mailboxId}/emails`);
  return data;
};

const fetchEmail = async (emailId: string) => {
  const { data } = await api.get(`/mail/emails/${emailId}`);
  return data;
};

export default function Inbox() {
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState('mailboxes'); // mailboxes, emails, email

  const {
    data: mailboxes,
    isLoading: mailboxesLoading,
    error: mailboxesError,
  } = useQuery({
    queryKey: ['mailboxes'],
    queryFn: fetchMailboxes,
  });

  const {
    data: emails,
    isLoading: emailsLoading,
    error: emailsError,
  } = useQuery({
    queryKey: ['emails', selectedMailbox],
    queryFn: () => fetchEmails(selectedMailbox),
    enabled: !!selectedMailbox,
  });

  const {
    data: email,
    isLoading: emailLoading,
    error: emailError,
  } = useQuery({
    queryKey: ['email', selectedEmail],
    queryFn: () => fetchEmail(selectedEmail!),
    enabled: !!selectedEmail,
  });

  const handleMailboxSelect = (mailboxId: string) => {
    setSelectedMailbox(mailboxId);
    setSelectedEmail(null);
    setMobileView('emails');
  };

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmail(emailId);
    setMobileView('email');
  };

  return (
    <div className="flex h-[calc(100vh-65px)] bg-white">
      {/* Column 1: Mailboxes */}
      <div
        className={`w-full md:w-1/5 bg-gray-50 p-4 overflow-y-auto border-r ${
          mobileView !== 'mailboxes' && 'hidden md:block'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Mailboxes</h2>
          <FiEdit className="cursor-pointer" />
        </div>
        {mailboxesLoading ? (
          <div className="center-spinner">
            <div className="spinner"></div>
          </div>
        ) : mailboxesError ? (
          <div>Error loading mailboxes</div>
        ) : (
          <ul>
            {mailboxes?.map((mailbox: any) => (
              <li
                key={mailbox.id}
                className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-200 ${
                  selectedMailbox === mailbox.id ? 'bg-blue-100 text-blue-600' : ''
                }`}
                onClick={() => handleMailboxSelect(mailbox.id)}
              >
                <span className="mr-2">{mailboxIcons[mailbox.id]}</span>
                <span>{mailbox.name}</span>
                {mailbox.unread > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2">
                    {mailbox.unread}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Column 2: Email List */}
      <div
        className={`w-full md:w-2/5 border-r p-4 overflow-y-auto ${
          mobileView !== 'emails' && 'hidden md:block'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            className="md:hidden"
            onClick={() => setMobileView('mailboxes')}
          >
            &larr; Back
          </button>
          <h2 className="text-lg font-semibold">
            {selectedMailbox.charAt(0).toUpperCase() + selectedMailbox.slice(1)}
          </h2>
          <div className="flex items-center gap-4">
            <FiRefreshCw className="cursor-pointer" />
            <FiMoreVertical className="cursor-pointer" />
          </div>
        </div>
        {emailsLoading ? (
          <div className="center-spinner">
            <div className="spinner"></div>
          </div>
        ) : emailsError ? (
          <div>Error loading emails</div>
        ) : (
          <ul>
            {emails?.map((email: any) => (
              <li
                key={email.id}
                className={`flex items-start p-3 rounded cursor-pointer hover:bg-gray-100 border-b ${
                  selectedEmail === email.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleEmailSelect(email.id)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 mr-3 flex items-center justify-center font-bold text-white">
                  {email.sender.charAt(0)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <span className="font-semibold">{email.sender}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(email.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-semibold">{email.subject}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {email.preview}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Column 3: Email Detail */}
      <div
        className={`w-full md:w-2/5 p-4 overflow-y-auto ${
          mobileView !== 'email' && 'hidden md:block'
        }`}
      >
        <button
          className="md:hidden mb-4"
          onClick={() => setMobileView('emails')}
        >
          &larr; Back
        </button>
        {emailLoading ? (
          <div className="center-spinner">
            <div className="spinner"></div>
          </div>
        ) : emailError ? (
          <div>Error loading email</div>
        ) : email ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{email.subject}</h2>
              <div className="flex items-center gap-4">
                <FiArchive className="cursor-pointer" />
                <FiTrash2 className="cursor-pointer" />
                <FiMoreVertical className="cursor-pointer" />
              </div>
            </div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 mr-3 flex items-center justify-center font-bold text-white">
                {email.from.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{email.from}</div>
                <div className="text-sm text-gray-500">To: {email.to}</div>
              </div>
            </div>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select an email to view details
          </div>
        )}
      </div>
    </div>
  );
}
