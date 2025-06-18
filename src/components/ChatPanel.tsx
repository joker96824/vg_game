import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { WebSocketService, WebSocketMessage } from '../services/websocketService';

interface Friend {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  is_blocked: boolean;
  friend_id: number;
  friend_username: string;
  friend_nickname: string;
  friend_avatar: string;
}

interface ChatTab {
  type: 'world' | 'friend';
  friend?: Friend;
}

interface ChatPanelProps {
  wsService: WebSocketService;
  chatMessages: WebSocketMessage[];
  isMobile?: boolean;
  chatTabs: { type: 'world' | 'friend'; friend?: Friend }[];
  activeChatTab: number;
  onTabChange: (index: number) => void;
  onCloseTab: (index: number) => void;
}

// 聊天内容组件
const ChatContent = React.memo(({ messages, chatType, friendName }: {
  messages: WebSocketMessage[];
  chatType: 'world' | 'friend';
  friendName?: string;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageElements = useMemo(() => {
    // 根据聊天类型过滤消息
    const filteredMessages = chatType === 'world'
      ? messages.filter(msg => !msg.receiver_id)  // 世界聊天：没有接收者的消息
      : messages.filter(msg => msg.receiver_id === friendName || msg.sender_name === friendName);  // 私聊：与特定好友相关的消息

    return filteredMessages.map((msg, index) => (
      <div key={index} className="p-2 bg-gray-100 rounded-lg">
        {msg.sender_name && (
          <span className="font-bold text-blue-600 mr-2">{msg.sender_name}:</span>
        )}
        <span>{msg.content}</span>
      </div>
    ));
  }, [messages, chatType, friendName]);

  return (
    <div className="space-y-2">
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
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          disabled={!message.trim() || disabled}
          className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-300 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  onCloseTab
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
            className={`flex items-center px-3 py-2 border-b-2 ${
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
          </div>
        ))}
      </div>
    );
  }, [chatTabs, activeChatTab, onTabChange, onCloseTab]);

  const chatContent = useMemo(() => (
    <ChatContent
      messages={chatMessages}
      chatType={chatTabs[activeChatTab]?.type || 'world'}
      friendName={chatTabs[activeChatTab]?.friend?.friend_nickname}
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
        className="flex-1 overflow-y-auto p-4"
        style={{ 
          height: chatPanelHeight ? `${chatPanelHeight - 120}px` : 'auto',
          maxHeight: 'calc(100vh - 120px)'
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
      <div className="fixed top-0 right-0 h-full w-[70%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40">
        <div className="h-full flex flex-col">
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
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