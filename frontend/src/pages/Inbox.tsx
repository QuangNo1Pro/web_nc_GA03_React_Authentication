import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ReactWindow from 'react-window';
import { api } from '../services/api';

const FixedSizeList = (ReactWindow as any).FixedSizeList;
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
import { MdMarkEmailRead, MdMarkEmailUnread } from 'react-icons/md';

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
  return data.emails || []; // Backend trả về { emails, total, page, pageSize }
};

const fetchEmail = async (emailId: string) => {
  const { data } = await api.get(`/mail/emails/${emailId}`);
  return data;
};

// EmailRow component cho virtualized list
const EmailRow = ({ index, style, data }: any) => {
  const {
    emails,
    selectedEmail,
    selectedMailbox,
    selectedEmails,
    starredState,
    handleToggleCheckbox,
    handleEmailSelect,
    handleToggleRead,
    handleToggleStar,
  } = data;

  const email = emails[index];
  if (!email) return null;

  return (
    <div
      style={style}
      className={`flex items-start p-3 cursor-pointer hover:bg-gray-100 border-b ${
        selectedEmail === email.id ? 'bg-blue-50' : ''
      } ${!email.read && selectedMailbox !== 'sent' && selectedMailbox !== 'trash' && selectedMailbox !== 'starred' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        className="w-4 h-4 mt-3 mr-3 cursor-pointer flex-shrink-0"
        checked={selectedEmails.has(email.id)}
        onChange={(e) => {
          e.stopPropagation();
          handleToggleCheckbox(email.id);
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 mr-3 flex items-center justify-center font-bold text-white">
        {email.sender.charAt(0)}
      </div>
      <div className="flex-grow" onClick={() => handleEmailSelect(email.id)}>
        {/* Hàng đầu tiên: tên người gửi */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-base">{email.sender}</span>
          <span className="flex items-center gap-2">
            {/* Nút đánh dấu đã đọc/chưa đọc */}
            <span
              className="cursor-pointer"
              title={email.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
              onClick={e => {
                e.stopPropagation();
                handleToggleRead(email.id);
              }}
            >
              {email.read ? (
                <MdMarkEmailRead size={22} color="#3b82f6" />
              ) : (
                <MdMarkEmailUnread size={22} color="#e5e7eb" />
              )}
            </span>
            {/* Icon sao */}
            <span
              className="cursor-pointer"
              title={starredState[email.id] ? 'Unstar' : 'Star'}
              onClick={e => {
                e.stopPropagation();
                handleToggleStar(email.id);
              }}
            >
              <FiStar color={starredState[email.id] ? 'gold' : '#e5e7eb'} fill={starredState[email.id] ? 'gold' : '#e5e7eb'} />
            </span>
          </span>
        </div>
        {/* Hàng thứ hai: subject */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-base">{email.subject}</span>
          <span className="text-xs text-gray-500 ml-2">
            {new Date(email.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {/* Hàng thứ ba: preview */}
        <div className="text-sm text-gray-500 truncate">{email.preview}</div>
      </div>
    </div>
  );
};

export default function Inbox() {
  const queryClient = useQueryClient();
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState('mailboxes'); // mailboxes, emails, email
  const [starredState, setStarredState] = useState<{ [id: string]: boolean }>({});
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [mailboxWidth, setMailboxWidth] = useState(20); // % width
  const [emailListWidth, setEmailListWidth] = useState(40); // % width
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

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
    setStarredState({}); // reset starred state when switching mailbox
    setSelectedEmails(new Set()); // reset selected emails when switching mailbox
  };

  // Khi fetch emails, cập nhật trạng thái starred từ dữ liệu backend
  useEffect(() => {
    if (emails) {
      const newState: { [id: string]: boolean } = {};
      emails.forEach((email: any) => {
        newState[email.id] = email.starred;
      });
      setStarredState(newState);
    }
  }, [emails]);

  // Hàm toggle starred cho email, đồng bộ với backend
  const handleToggleStar = async (emailId: string) => {
    const newStarred = !starredState[emailId];
    console.log(`Toggle star for email ${emailId}: ${starredState[emailId]} -> ${newStarred}`);
    
    setStarredState((prev) => ({
      ...prev,
      [emailId]: newStarred,
    }));
    
    // Optimistic update: cập nhật cache trực tiếp để trigger re-render
    queryClient.setQueryData(['emails', selectedMailbox], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((e: any) => 
        e.id === emailId ? { ...e, starred: newStarred } : e
      );
    });
    
    try {
      const response = await api.patch(`/mail/emails/${emailId}/star`, { starred: newStarred });
      console.log('Star API response:', response.data);
      // Invalidate cache để cập nhật số lượng starred
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'starred'] });
    } catch (err) {
      console.error('Star API error:', err);
      // Nếu lỗi, revert lại state và cache
      setStarredState((prev) => ({
        ...prev,
        [emailId]: !newStarred,
      }));
      queryClient.setQueryData(['emails', selectedMailbox], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((e: any) => 
          e.id === emailId ? { ...e, starred: !newStarred } : e
        );
      });
      alert('Lỗi cập nhật trạng thái starred!');
    }
  };

  // Hàm toggle trạng thái đã đọc/chưa đọc cho email
  const handleToggleRead = async (emailId: string) => {
    if (!emails) return;
    const emailObj = emails.find((e: any) => e.id === emailId);
    if (!emailObj) return;
    const newRead = !emailObj.read;
    
    // Optimistic update: cập nhật cache trực tiếp để trigger re-render
    queryClient.setQueryData(['emails', selectedMailbox], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((e: any) => 
        e.id === emailId ? { ...e, read: newRead } : e
      );
    });
    
    try {
      await api.patch(`/mail/emails/${emailId}/read`, { read: newRead });
      // Invalidate cache để đồng bộ backend (backend đã tự động cập nhật count)
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    } catch (err) {
      // Nếu lỗi, revert lại cache
      queryClient.setQueryData(['emails', selectedMailbox], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((e: any) => 
          e.id === emailId ? { ...e, read: !newRead } : e
        );
      });
      alert('Lỗi cập nhật trạng thái đã đọc/chưa đọc!');
    }
  };

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmail(emailId);
    setMobileView('email');
    // Tự động đánh dấu đã đọc khi click vào email chưa đọc
    if (emails) {
      const emailObj = emails.find((e: any) => e.id === emailId);
      if (emailObj && !emailObj.read) {
        handleToggleRead(emailId);
      }
    }
  };

  // Hàm toggle checkbox
  const handleToggleCheckbox = (emailId: string) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  // Hàm select all / deselect all
  const handleToggleSelectAll = () => {
    if (!emails) return;
    const visibleEmails = emails.filter((email: any) => {
      if (selectedMailbox === 'starred') {
        return starredState[email.id];
      }
      return true;
    });
    
    if (selectedEmails.size === visibleEmails.length) {
      // Deselect all
      setSelectedEmails(new Set());
    } else {
      // Select all
      setSelectedEmails(new Set(visibleEmails.map((e: any) => e.id)));
    }
  };

  // Hàm xử lý resize columns
  const handleMouseDown = (dividerIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startMailboxWidth = mailboxWidth;
    const startEmailListWidth = emailListWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;

      if (dividerIndex === 1) {
        // Resize mailbox column
        const newMailboxWidth = Math.max(15, Math.min(30, startMailboxWidth + deltaPercent));
        setMailboxWidth(newMailboxWidth);
      } else if (dividerIndex === 2) {
        // Resize email list column
        const newEmailListWidth = Math.max(30, Math.min(50, startEmailListWidth + deltaPercent));
        setEmailListWidth(newEmailListWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Hàm xử lý bulk delete
  const handleBulkDelete = async () => {
    if (selectedEmails.size === 0) return;
    if (!confirm(`Xóa ${selectedEmails.size} email?`)) return;
    
    try {
      await api.delete('/mail/emails', { 
        data: { ids: Array.from(selectedEmails) } 
      });
      
      // Invalidate cache để refresh danh sách
      queryClient.invalidateQueries({ queryKey: ['emails', selectedMailbox] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      // Không unselect - giữ nguyên selection
      alert('Xóa thành công!');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Lỗi khi xóa email!');
    }
  };

  // Hàm xử lý bulk mark read/unread
  const handleBulkMarkRead = async (read: boolean) => {
    if (selectedEmails.size === 0) return;
    
    try {
      await api.patch('/mail/emails/bulk-read', {
        ids: Array.from(selectedEmails),
        read
      });
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['emails', selectedMailbox] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      // Không unselect - giữ nguyên selection
    } catch (err) {
      console.error('Bulk mark read error:', err);
      alert('Lỗi khi cập nhật trạng thái!');
    }
  };

  // Hàm refresh emails
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['emails', selectedMailbox] });
    queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
  };

  // Hàm gửi email
  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    try {
      await api.post('/mail/send', {
        to: composeTo,
        subject: composeSubject,
        body: composeBody
      });
      
      // Reset form và đóng modal
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setShowComposeModal(false);
      
      // Refresh sent mailbox
      queryClient.invalidateQueries({ queryKey: ['emails', 'sent'] });
      alert('Gửi email thành công!');
    } catch (err) {
      console.error('Send email error:', err);
      alert('Lỗi khi gửi email!');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-white">
      {/* Action Bar - ngang hàng với navbar, ở trên cùng */}
      <div className="border-b bg-white">
        {/* Hàng 1: Action buttons */}
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Compose button */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setShowComposeModal(true)}
          >
            <FiEdit size={16} />
            <span className="text-sm">Thư mới</span>
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1" />
          
          {/* Refresh */}
          <button
            className="p-2 hover:bg-gray-200 rounded"
            onClick={handleRefresh}
            title="Làm mới"
          >
            <FiRefreshCw size={16} className="text-gray-600" />
          </button>
          
          {/* Delete */}
          <button
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleBulkDelete}
            disabled={selectedEmails.size === 0}
            title="Xóa"
          >
            <FiTrash2 size={16} className="text-gray-600" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1" />
          
          {/* Mark as read */}
          <button
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleBulkMarkRead(true)}
            disabled={selectedEmails.size === 0}
            title="Đánh dấu đã đọc"
          >
            <MdMarkEmailRead size={18} className="text-gray-600" />
          </button>
          
          {/* Mark as unread */}
          <button
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleBulkMarkRead(false)}
            disabled={selectedEmails.size === 0}
            title="Đánh dấu chưa đọc"
          >
            <MdMarkEmailUnread size={18} className="text-gray-600" />
          </button>
          
          {selectedEmails.size > 0 && (
            <span className="ml-auto text-sm text-gray-600">
              {selectedEmails.size} đã chọn
            </span>
          )}
        </div>
      </div>

      {/* Main content: 3 columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Mailboxes */}
        <div
          className={`bg-gray-50 p-4 overflow-y-auto border-r ${
            mobileView !== 'mailboxes' && 'hidden md:block'
          }`}
          style={{ width: `${mailboxWidth}%` }}
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
                <span className="mr-2">{mailboxIcons[mailbox.id as keyof typeof mailboxIcons]}</span>
                <span>{mailbox.name}</span>
                {/* Hiển thị count cho starred, unread cho các mailbox khác */}
                {mailbox.id === 'starred' && (mailbox as any).count > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2">
                    {(mailbox as any).count}
                  </span>
                )}
                {mailbox.id !== 'starred' && mailbox.unread > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2">
                    {mailbox.unread}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Divider 1 */}
      <div
        className="hidden md:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize"
        onMouseDown={handleMouseDown(1)}
      />

      {/* Column 2: Email List */}
      <div
        className={`border-r p-4 overflow-y-auto ${
          mobileView !== 'emails' && 'hidden md:block'
        }`}
        style={{ width: `${emailListWidth}%` }}
      >
        {/* Header đơn giản - chỉ title và select all */}
        <div className="border-b">
          {/* Title */}
          <div className="flex justify-between items-center px-4 py-2">
            <button
              className="md:hidden text-blue-500"
              onClick={() => setMobileView('mailboxes')}
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold">
              {selectedMailbox.charAt(0).toUpperCase() + selectedMailbox.slice(1)}
            </h2>
            <div className="flex items-center gap-2">
              <FiMoreVertical className="cursor-pointer text-gray-600" />
            </div>
          </div>
          
          {/* Select all checkbox */}
          <div className="flex items-center gap-3 px-4 py-2 border-t">
            <input
              type="checkbox"
              className="w-4 h-4 cursor-pointer"
              checked={emails && selectedEmails.size > 0 && selectedEmails.size === emails.filter((email: any) => {
                if (selectedMailbox === 'starred') return starredState[email.id];
                return true;
              }).length}
              onChange={handleToggleSelectAll}
            />
            <span className="text-sm text-gray-600">
              {selectedEmails.size > 0 ? `${selectedEmails.size} selected` : 'Chọn tất cả'}
            </span>
          </div>
        </div>
        {emailsLoading ? (
          <div className="center-spinner">
            <div className="spinner"></div>
          </div>
        ) : emailsError ? (
          <div>Error loading emails</div>
        ) : (
          <div className="h-[calc(100vh-250px)]">
            <FixedSizeList
              height={window.innerHeight - 250}
              itemCount={emails?.filter((email: any) => {
                if (selectedMailbox === 'starred') {
                  return starredState[email.id];
                }
                return true;
              }).length || 0}
              itemSize={110}
              width="100%"
              itemData={{
                emails: emails?.filter((email: any) => {
                  if (selectedMailbox === 'starred') {
                    return starredState[email.id];
                  }
                  return true;
                }),
                selectedEmail,
                selectedMailbox,
                selectedEmails,
                starredState,
                handleToggleCheckbox,
                handleEmailSelect,
                handleToggleRead,
                handleToggleStar,
              }}
            >
              {EmailRow}
            </FixedSizeList>
          </div>
        )}
      </div>

      {/* Divider 2 */}
      <div
        className="hidden md:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize"
        onMouseDown={handleMouseDown(2)}
      />

      {/* Column 3: Email Detail */}
      <div
        className={`p-4 overflow-y-auto ${
          mobileView !== 'email' && 'hidden md:block'
        }`}
        style={{ width: `${100 - mailboxWidth - emailListWidth}%` }}
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
      
      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowComposeModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Thư mới</h3>
              <button onClick={() => setShowComposeModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Tới:</label>
                <input 
                  type="email" 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="email@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Chủ đề:</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="Nhập chủ đề..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Nội dung:</label>
                <textarea 
                  className="w-full border rounded px-3 py-2" 
                  rows={8} 
                  placeholder="Nhập nội dung email..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowComposeModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">
                  Hủy
                </button>
                <button onClick={handleSendEmail} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
