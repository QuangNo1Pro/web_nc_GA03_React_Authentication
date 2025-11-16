import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ReactWindow from 'react-window';
import { api } from '../services/api';
import './Inbox.css';

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
    focusedEmailIndex,
    handleToggleCheckbox,
    handleEmailSelect,
    handleToggleRead,
    handleToggleStar,
  } = data;

  const email = emails[index];
  if (!email) return null;

  const isFocused = index === focusedEmailIndex;

  return (
    <div
      style={style}
      role="button"
      tabIndex={isFocused ? 0 : -1}
      aria-label={`Email from ${email.sender}: ${email.subject}`}
      className={`flex items-start p-3 cursor-pointer hover:bg-gray-100 border-b ${
        selectedEmail === email.id ? 'bg-blue-50' : ''
      } ${isFocused ? 'ring-2 ring-blue-400' : ''} ${!email.read && selectedMailbox !== 'sent' && selectedMailbox !== 'trash' && selectedMailbox !== 'starred' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
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
        <div className="flex justify-between items-center mb-1">
          <span className="email-sender">{email.sender}</span>
          <span className="flex items-center gap-2">
            {/* Nút đánh dấu đã đọc/chưa đọc */}
            <span
              className="cursor-pointer hover:opacity-75 transition-opacity"
              title={email.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
              onClick={e => {
                e.stopPropagation();
                handleToggleRead(email.id);
              }}
            >
              {email.read ? (
                <MdMarkEmailRead size={20} color="#3b82f6" />
              ) : (
                <MdMarkEmailUnread size={20} color="#9CA3AF" />
              )}
            </span>
            {/* Icon sao */}
            <span
              className="cursor-pointer hover:opacity-75 transition-opacity"
              title={starredState[email.id] ? 'Bỏ gắn sao' : 'Gắn sao'}
              onClick={e => {
                e.stopPropagation();
                handleToggleStar(email.id);
              }}
            >
              <FiStar color={starredState[email.id] ? '#FBBF24' : '#D1D5DB'} fill={starredState[email.id] ? '#FBBF24' : 'none'} size={18} />
            </span>
          </span>
        </div>
        {/* Hàng thứ hai: subject */}
        <div className="flex justify-between items-center mb-1">
          <span className="email-subject truncate mr-4">{email.subject}</span>
          <span className="email-timestamp flex-shrink-0">
            {new Date(email.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {/* Hàng thứ ba: preview */}
        <div className="email-preview truncate">{email.preview}</div>
      </div>
    </div>
  );
};

export default function Inbox() {
  const queryClient = useQueryClient();
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState('emails'); // emails or email (default: emails)
  const [starredState, setStarredState] = useState<{ [id: string]: boolean }>({});
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [mailboxWidth, setMailboxWidth] = useState(20); // % width
  const [emailListWidth, setEmailListWidth] = useState(40); // % width
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeAttachments, setComposeAttachments] = useState<File[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [focusedEmailIndex, setFocusedEmailIndex] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showMailboxMenu, setShowMailboxMenu] = useState(false);
  const emailListRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(500);

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
    data: emailDetail,
    isLoading: emailLoading,
    error: emailError,
  } = useQuery({
    queryKey: ['email', selectedEmail],
    queryFn: () => fetchEmail(selectedEmail!),
    enabled: !!selectedEmail,
  });

  // Lấy email từ list để có read/starred state mới nhất
  const email = selectedEmail 
    ? { 
        ...emailDetail, 
        ...(emails?.find((e: any) => e.id === selectedEmail) || {})
      }
    : null;

  const handleMailboxSelect = (mailboxId: string) => {
    setSelectedMailbox(mailboxId);
    setSelectedEmail(null);
    setMobileView('emails');
    setStarredState({}); // reset starred state when switching mailbox
    setSelectedEmails(new Set()); // reset selected emails when switching mailbox
    setFocusedEmailIndex(0); // reset focus to first email
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!emails || emails.length === 0) return;
      
      const filteredEmails = emails.filter((email: any) => {
        if (selectedMailbox === 'starred') return starredState[email.id];
        return true;
      });
      
      if (filteredEmails.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedEmailIndex(prev => Math.min(prev + 1, filteredEmails.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedEmailIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredEmails[focusedEmailIndex]) {
            handleEmailSelect(filteredEmails[focusedEmailIndex].id);
          }
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRefresh();
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowComposeModal(true);
          }
          break;
        case 's':
          if ((e.ctrlKey || e.metaKey) && selectedEmail) {
            e.preventDefault();
            handleToggleStar(selectedEmail);
          }
          break;
        case 'u':
          if ((e.ctrlKey || e.metaKey) && selectedEmail) {
            e.preventDefault();
            handleToggleRead(selectedEmail);
          }
          break;
        case 'Escape':
          if (showComposeModal) {
            setShowComposeModal(false);
          } else if (showKeyboardHelp) {
            setShowKeyboardHelp(false);
          } else if (showMailboxMenu) {
            setShowMailboxMenu(false);
          } else if (selectedEmail) {
            setSelectedEmail(null);
            setMobileView('emails');
          }
          break;
        case '?':
          if (e.shiftKey) {
            e.preventDefault();
            setShowKeyboardHelp(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emails, selectedMailbox, starredState, focusedEmailIndex, selectedEmail, showComposeModal]);

  // Update list height when container size changes
  useEffect(() => {
    const updateHeight = () => {
      if (emailListRef.current) {
        setListHeight(emailListRef.current.clientHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

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
    
    // Optimistic update: cập nhật TẤT CẢ cache liên quan
    queryClient.setQueryData(['emails', selectedMailbox], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((e: any) => 
        e.id === emailId ? { ...e, starred: newStarred } : e
      );
    });
    
    // Update cache của starred mailbox luôn
    queryClient.setQueryData(['emails', 'starred'], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((e: any) => 
        e.id === emailId ? { ...e, starred: newStarred } : e
      );
    });
    
    try {
      await api.patch(`/mail/emails/${emailId}/star`, { starred: newStarred });
      // Invalidate TẤT CẢ để đồng bộ với backend
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails', selectedMailbox] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'starred'] });
      // Nếu đang xem email này ở Column 3, re-fetch để update UI
      if (selectedEmail === emailId) {
        queryClient.invalidateQueries({ queryKey: ['email', emailId] });
      }
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
    
    // Optimistic update: cập nhật TẤT CẢ cache liên quan
    queryClient.setQueryData(['emails', selectedMailbox], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((e: any) => 
        e.id === emailId ? { ...e, read: newRead } : e
      );
    });
    
    // Update cache của starred mailbox nếu email có starred
    if (emailObj.starred) {
      queryClient.setQueryData(['emails', 'starred'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((e: any) => 
          e.id === emailId ? { ...e, read: newRead } : e
        );
      });
    }
    
    try {
      await api.patch(`/mail/emails/${emailId}/read`, { read: newRead });
      // Invalidate TẤT CẢ để đồng bộ với backend (backend đã tự động cập nhật count)
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails', selectedMailbox] });
      if (emailObj.starred) {
        queryClient.invalidateQueries({ queryKey: ['emails', 'starred'] });
      }
      // Nếu đang xem email này ở Column 3, re-fetch để update UI
      if (selectedEmail === emailId) {
        queryClient.invalidateQueries({ queryKey: ['email', emailId] });
      }
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
        cc: composeCc,
        bcc: composeBcc,
        subject: composeSubject,
        body: composeBody,
        attachments: composeAttachments.map(f => f.name) // Chỉ gửi tên file (demo)
      });
      
      // Reset form và đóng modal
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setComposeSubject('');
      setComposeBody('');
      setComposeAttachments([]);
      setShowCc(false);
      setShowBcc(false);
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
    <div className="inbox-container flex flex-col h-[calc(100vh-65px)] bg-white">
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
          
          <div className="flex-1" />
          
          {/* Keyboard shortcuts help */}
          <button
            className="p-2 hover:bg-gray-200 rounded text-gray-600 text-sm"
            onClick={() => setShowKeyboardHelp(true)}
            title="Keyboard shortcuts (Shift + ?)"
          >
            <span className="font-semibold">?</span>
          </button>
          
          {selectedEmails.size > 0 && (
            <span className="text-sm text-gray-600">
              {selectedEmails.size} đã chọn
            </span>
          )}
        </div>
      </div>

      {/* Main content: 3 columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Mailboxes - Always hidden on mobile, show on desktop */}
        <div
          className="hidden md:flex md:flex-col bg-gray-50 overflow-hidden border-r"
          style={{ width: `${mailboxWidth}%` }}
        >
        <div className="flex justify-between items-center p-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">Mailboxes</h2>
          <FiEdit className="cursor-pointer" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
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
                role="button"
                tabIndex={0}
                aria-label={`${mailbox.name} mailbox${mailbox.unread > 0 ? `, ${mailbox.unread} unread` : ''}`}
                aria-current={selectedMailbox === mailbox.id ? 'page' : undefined}
                className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  selectedMailbox === mailbox.id ? 'bg-blue-100 text-blue-600' : ''
                }`}
                onClick={() => handleMailboxSelect(mailbox.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMailboxSelect(mailbox.id);
                  }
                }}
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
      </div>

      {/* Divider 1 */}
      <div
        className="hidden md:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize"
        onMouseDown={handleMouseDown(1)}
      />

      {/* Column 2: Email List - Show by default on mobile, hide when email is selected */}
      <div
        className={`border-r flex flex-col w-full ${
          mobileView === 'email' ? 'hidden md:flex' : 'flex'
        }`}
        style={{ width: window.innerWidth >= 768 ? `${emailListWidth}%` : undefined }}
      >
        {/* Header đơn giản - chỉ title và select all */}
        <div className="border-b flex-shrink-0">
          {/* Title */}
          <div className="flex justify-between items-center px-4 py-2">
            {/* Mobile: Mailbox dropdown menu */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowMailboxMenu(!showMailboxMenu)}
                className="flex items-center gap-2 text-lg font-semibold hover:text-blue-600"
              >
                <span>{selectedMailbox.charAt(0).toUpperCase() + selectedMailbox.slice(1)}</span>
                <span className="text-sm">▼</span>
              </button>
              
              {showMailboxMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMailboxMenu(false)}
                  ></div>
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                    {mailboxes?.map((mailbox: any) => (
                      <button
                        key={mailbox.id}
                        onClick={() => {
                          handleMailboxSelect(mailbox.id);
                          setShowMailboxMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 border-b last:border-b-0 ${
                          selectedMailbox === mailbox.id ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        <span className="text-lg">{mailboxIcons[mailbox.id as keyof typeof mailboxIcons]}</span>
                        <span className="flex-1">{mailbox.name}</span>
                        {mailbox.id === 'starred' && (mailbox as any).count > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                            {(mailbox as any).count}
                          </span>
                        )}
                        {mailbox.id !== 'starred' && mailbox.unread > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                            {mailbox.unread}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Desktop: Static title */}
            <h2 className="hidden md:block text-lg font-semibold">
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
        
        {/* Email list content with overflow */}
        <div ref={emailListRef} className="flex-1">
        {emailsLoading ? (
          <div className="center-spinner">
            <div className="spinner"></div>
          </div>
        ) : emailsError ? (
          <div>Error loading emails</div>
        ) : (
          <div className="h-full">
            <FixedSizeList
              height={listHeight}
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
      </div>

      {/* Divider 2 */}
      <div
        className="hidden md:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize"
        onMouseDown={handleMouseDown(2)}
      />

      {/* Column 3: Email Detail - Show on mobile only when email selected */}
      <div
        className={`flex flex-col overflow-hidden w-full ${
          mobileView === 'emails' ? 'hidden md:flex' : 'flex'
        }`}
        style={{ width: window.innerWidth >= 768 ? `${100 - mailboxWidth - emailListWidth}%` : undefined }}
      >
        <div className="flex-shrink-0 p-4 pb-0">
        <button
          className="md:hidden mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded hover:bg-blue-50"
          onClick={() => setMobileView('emails')}
          aria-label="Back to email list"
        >
          <span className="text-xl">←</span>
          <span>Back to emails</span>
        </button>
        </div>
        
        {/* Email detail content with overflow */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
        {emailLoading ? (
          <div className="center-spinner">
            <div className="spinner"></div>
          </div>
        ) : emailError ? (
          <div>Error loading email</div>
        ) : email ? (
          <div>
            {/* Subject Header */}
            <div className="mb-4 pb-3 border-b">
              <h2 className="text-xl font-semibold">{email.subject}</h2>
            </div>
            
            {/* Action Buttons Row */}
            <div className="mb-4 pb-3 border-b flex items-center gap-2">
              <button 
                onClick={() => alert('Reply functionality (Mock)')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <FiSend className="transform rotate-180" />
                Trả lời
              </button>
              <button 
                onClick={() => alert('Reply All functionality (Mock)')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <FiSend className="transform rotate-180" />
                Trả lời tất cả
              </button>
              <button 
                onClick={() => alert('Forward functionality (Mock)')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <FiSend />
                Chuyển tiếp
              </button>
              
              <div className="ml-auto flex items-center gap-1">
                <button 
                  onClick={() => handleToggleRead(email.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title={email.read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                >
                  {email.read ? <MdMarkEmailUnread className="w-5 h-5" /> : <MdMarkEmailRead className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => handleToggleStar(email.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title={starredState[email.id] ? "Bỏ gắn sao" : "Gắn sao"}
                >
                  <FiStar className={`w-5 h-5 ${starredState[email.id] ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                
                {/* More Menu with Delete */}
                <div className="relative">
                  <button 
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 hover:bg-gray-100 rounded" 
                    title="Thêm"
                  >
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                  
                  {showMoreMenu && (
                    <>
                      {/* Overlay để đóng menu khi click bên ngoài */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMoreMenu(false)}
                      ></div>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-20">
                        <button
                          onClick={async () => {
                            setShowMoreMenu(false);
                            if (confirm('Bạn có chắc muốn xóa email này?')) {
                              try {
                                await api.delete('/mail/emails', { 
                                  data: { ids: [email.id] } 
                                });
                                
                                // Invalidate tất cả queries để refresh
                                queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
                                queryClient.invalidateQueries({ queryKey: ['emails', selectedMailbox] });
                                queryClient.invalidateQueries({ queryKey: ['emails', 'starred'] });
                                
                                // Đóng email detail
                                setSelectedEmail(null);
                                alert('Đã xóa email thành công!');
                              } catch (error) {
                                console.error('Delete error:', error);
                                alert('Lỗi khi xóa email!');
                              }
                            }
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Xóa
                        </button>
                        <button
                          onClick={() => {
                            alert('Hành động trả lời khác (Mock)');
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FiArchive className="w-4 h-4" />
                          Lưu trữ
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Email metadata */}
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 mr-3 flex items-center justify-center font-bold text-white">
                  {email.from.charAt(0)}
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-base">{email.from}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">To:</span> {email.to}
                  </div>
                  {email.cc && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Cc:</span> {email.cc}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(email.received).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Email body */}
            <div
              className="email-body prose max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-semibold mb-2">
                  Attachments ({email.attachments.length})
                </h3>
                <div className="space-y-2">
                  {email.attachments.map((attachment: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <FiFileText className="text-gray-500" size={20} />
                        <div>
                          <div className="text-sm font-medium">{attachment.name}</div>
                          <div className="text-xs text-gray-500">{attachment.size}</div>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => alert(`Download ${attachment.name}`)}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select an email to view details
          </div>
        )}
        </div>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">Tới:</label>
                  <div className="flex gap-2 text-xs">
                    {!showCc && <button onClick={() => setShowCc(true)} className="text-blue-500 hover:underline">Cc</button>}
                    {!showBcc && <button onClick={() => setShowBcc(true)} className="text-blue-500 hover:underline">Bcc</button>}
                  </div>
                </div>
                <input 
                  type="email" 
                  className="w-full border rounded px-3 py-2" 
                  placeholder="email@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                />
              </div>
              
              {showCc && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Cc:</label>
                  <input 
                    type="email" 
                    className="w-full border rounded px-3 py-2" 
                    placeholder="email@example.com"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                  />
                </div>
              )}
              
              {showBcc && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Bcc:</label>
                  <input 
                    type="email" 
                    className="w-full border rounded px-3 py-2" 
                    placeholder="email@example.com"
                    value={composeBcc}
                    onChange={(e) => setComposeBcc(e.target.value)}
                  />
                </div>
              )}
              
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
                  rows={6} 
                  placeholder="Nhập nội dung email..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Tập đính kèm:</label>
                <input 
                  type="file" 
                  multiple
                  className="w-full border rounded px-3 py-2"
                  onChange={(e) => {
                    if (e.target.files) {
                      setComposeAttachments(Array.from(e.target.files));
                    }
                  }}
                />
                {composeAttachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {composeAttachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                        <span className="truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button 
                          onClick={() => setComposeAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
      
      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowKeyboardHelp(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Keyboard Shortcuts</h3>
              <button onClick={() => setShowKeyboardHelp(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Navigate emails</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">↑ / ↓</kbd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Open email</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Compose new email</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + C</kbd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Refresh</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + R</kbd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Toggle star</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Toggle read/unread</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + U</kbd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Close / Go back</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Esc</kbd>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Shift + ?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
