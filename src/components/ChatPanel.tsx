import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { WebSocketMessage } from '../services/websocketService';
import { websocketManager } from '../services/websocketManager';
import { getAvatarUrl, handleImageError } from '../utils/image/imageUtils';

interface Friend {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  is_blocked: boolean;
  friend_id: string;
  friend_username: string;
  friend_nickname: string;
  friend_avatar: string;
}

interface ChatTab {
  type: 'world' | 'friend';
  friend?: Friend;
}

interface ChatPanelProps {
  wsService: typeof websocketManager;
  chatMessages: WebSocketMessage[];
  isMobile?: boolean;
  chatTabs: { type: 'world' | 'friend'; friend?: Friend }[];
  activeChatTab: number;
  onTabChange: (index: number) => void;
  onCloseTab: (index: number) => void;
  unreadTabs?: Set<number>;
}

// 聊天内容组件
const ChatContent = React.memo(({ messages, chatType, friendId }: {
  messages: WebSocketMessage[];
  chatType: 'world' | 'friend';
  friendId?: string;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageElements = useMemo(() => {
    // 获取当前用户信息
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id;

    // 根据聊天类型过滤消息
    const filteredMessages = chatType === 'world'
      ? messages.filter(msg => !msg.receiver_id)  // 世界聊天：没有接收者的消息
      : messages.filter(msg => {
          // 私聊：必须是有接收者的消息
          if (!msg.receiver_id) return false; // 排除世界聊天消息
          
          // 检查消息是否与当前好友相关
          // 情况1：好友发送消息给我 - sender_id 是好友ID，receiver_id 是我的ID
          if (msg.sender_id && msg.sender_id !== currentUserId) {
            // 由于ID可能是UUID格式，我们直接比较字符串
            return msg.sender_id === friendId;
          }
          
          // 情况2：我发送消息给好友 - sender_id 是我的ID，receiver_id 是好友ID
          if (msg.sender_id === currentUserId && msg.receiver_id) {
            // 检查 receiver_id 是否对应当前好友
            return msg.receiver_id === friendId;
          }
          
          return false;
        });

    return filteredMessages.map((msg, index) => {
      // 判断是否为当前用户发送的消息
      const isCurrentUser = currentUser && msg.sender_id === currentUser.id;
      
      // 获取当前用户头像
      const getCurrentUserAvatar = () => {
        // 优先使用临时 blob URL，如果不存在则使用服务器头像
        const tempAvatarUrl = localStorage.getItem('tempAvatarUrl');
        if (tempAvatarUrl) {
          return tempAvatarUrl;
        } else if (currentUser?.avatar) {
          return getAvatarUrl(currentUser.avatar);
        } else {
          return '/images/default-avatar.png';
        }
      };
      
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      }) : '';

      return (
        <div key={index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
          {!isCurrentUser && (
            <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
              <img
                src={msg.sender_avatar ? getAvatarUrl(msg.sender_avatar) : '/images/default-avatar.png'}
                alt="头像"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          )}
          <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
            <div className="flex items-center mb-1">
              {!isCurrentUser && (
                <span className="text-sm text-gray-600 mr-2">{msg.sender_name}</span>
              )}
              <span className="text-xs text-gray-400">{timestamp}</span>
            </div>
            <div className={`rounded-lg px-3 py-1 ${
              isCurrentUser 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
          {isCurrentUser && (
            <div className="w-10 h-10 rounded-full overflow-hidden ml-2 flex-shrink-0">
              <img
                src={getCurrentUserAvatar()}
                alt="我的头像"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          )}
        </div>
      );
    });
  }, [messages, chatType, friendId]);

  return (
    <div className="space-y-2 p-4">
      {messageElements}
      <div ref={messagesEndRef} />
    </div>
  );
});

// 聊天输入组件
const ChatInput = React.memo(({ onSendMessage, disabled }: {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
        // 发送后重新聚焦输入框
        inputRef.current?.focus();
      }
    }
  }, [message, onSendMessage]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const handleClick = useCallback(() => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      // 发送后重新聚焦输入框
      inputRef.current?.focus();
    }
  }, [message, onSendMessage]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const inputElement = useMemo(() => (
    <div className="border-t border-gray-200 p-3">
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
        />
        <button 
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          disabled={!message.trim() || disabled}
          className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-300 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </div>
  ), [message, disabled, handleChange, handleKeyPress, handleClick, handleMouseDown]);

  return inputElement;
});

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  wsService, 
  chatMessages, 
  isMobile = false,
  chatTabs,
  activeChatTab,
  onTabChange,
  onCloseTab,
  unreadTabs = new Set()
}) => {
  const [chatPanelHeight, setChatPanelHeight] = useState<number>(0);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatPanelRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        setChatPanelHeight(height);
      }
    });

    resizeObserver.observe(chatPanelRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    const currentTab = chatTabs[activeChatTab];
    if (currentTab.type === 'world') {
      wsService.sendMessage('chat', message);
    } else if (currentTab.type === 'friend' && currentTab.friend) {
      wsService.sendMessage('chat', message, currentTab.friend.friend_id.toString());
    }
  }, [chatTabs, activeChatTab, wsService]);

  const renderChatTabs = useCallback(() => {
    return (
      <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
        {chatTabs.map((tab, index) => (
          <div
            key={index}
            className={`flex items-center px-3 py-2 border-b-2 relative ${
              activeChatTab === index
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            <button
              className="flex items-center space-x-1"
              onClick={() => onTabChange(index)}
            >
              <span className="text-sm whitespace-nowrap">
                {tab.type === 'world' ? '世界聊天' : tab.friend?.friend_nickname}
              </span>
            </button>
            {index > 0 && (
              <button
                className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(index);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {unreadTabs.has(index) && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full z-100"></div>
            )}
          </div>
        ))}
      </div>
    );
  }, [chatTabs, activeChatTab, onTabChange, onCloseTab, unreadTabs]);

  const chatContent = useMemo(() => (
    <ChatContent
      messages={chatMessages}
      chatType={chatTabs[activeChatTab]?.type || 'world'}
      friendId={chatTabs[activeChatTab]?.friend?.friend_id}
    />
  ), [chatMessages, chatTabs, activeChatTab]);

  const chatInput = useMemo(() => (
    <ChatInput
      onSendMessage={handleSendMessage}
      disabled={false}
    />
  ), [handleSendMessage]);

  const renderContent = () => (
    <>
      {renderChatTabs()}
      <div 
        ref={contentRef}
        className="overflow-y-auto"
        style={{ 
          height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 250px)',
          minHeight: '300px',
          maxHeight: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 250px)'
        }}
      >
        {chatContent}
      </div>
      <div className="flex-shrink-0">
        {chatInput}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed top-0 right-0 h-full w-[70%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50">
        <div className="h-full flex flex-col">
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
            <span className="font-bold">聊天</span>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => {
                // 这里需要添加关闭聊天框的回调
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div ref={chatPanelRef} className="w-80 flex flex-col border-l border-gray-200">
      {renderContent()}
    </div>
  );
};

export default ChatPanel; 