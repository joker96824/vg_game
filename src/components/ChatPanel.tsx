import React, { useState, useRef, useCallback, useMemo } from 'react';
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
}

// 聊天内容组件
const ChatContent = React.memo(({ messages, chatType, friendName }: {
  messages: WebSocketMessage[];
  chatType: 'world' | 'friend';
  friendName?: string;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    console.log('[ChatContent] 消息更新，数量:', messages.length);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  console.log('[ChatContent] 渲染');

  const messageElements = useMemo(() => {
    if (chatType === 'world') {
      return messages.map((msg, index) => (
        <div key={index} className="p-2 bg-gray-100 rounded-lg">
          {msg.sender_name && (
            <span className="font-bold text-blue-600 mr-2">{msg.sender_name}:</span>
          )}
          <span>{msg.content}</span>
        </div>
      ));
    }
    return (
      <div className="text-gray-500 text-center">
        {`与 ${friendName} 的聊天内容`}
      </div>
    );
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

  console.log('[ChatInput] 渲染');

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        console.log('[ChatInput] 发送消息:', message);
        onSendMessage(message);
        setMessage('');
      }
    }
  }, [message, onSendMessage]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ChatInput] 输入变化:', e.target.value);
    setMessage(e.target.value);
  }, []);

  const handleClick = useCallback(() => {
    if (message.trim()) {
      console.log('[ChatInput] 点击发送消息:', message);
      onSendMessage(message);
      setMessage('');
    }
  }, [message, onSendMessage]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const inputElement = useMemo(() => (
    <div className="border-t border-gray-200 p-4">
      <div className="flex space-x-2">
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
          className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-300"
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

const ChatPanel: React.FC<ChatPanelProps> = ({ wsService, chatMessages, isMobile = false }) => {
  console.log('[ChatPanel] 渲染');

  const [chatTabs, setChatTabs] = useState<ChatTab[]>([{ type: 'world' }]);
  const [activeChatTab, setActiveChatTab] = useState<number>(0);

  const handleSendMessage = useCallback((message: string) => {
    console.log('[ChatPanel] 处理发送消息:', message);
    if (chatTabs[activeChatTab]?.type === 'world') {
      wsService.sendMessage('chat', message);
    }
  }, [chatTabs, activeChatTab, wsService]);

  const handleCloseChatTab = useCallback((index: number) => {
    console.log('[ChatPanel] 关闭标签页:', index);
    setChatTabs(prev => prev.filter((_, i) => i !== index));
    if (activeChatTab >= index) {
      setActiveChatTab(Math.max(0, activeChatTab - 1));
    }
  }, [activeChatTab]);

  const renderChatTabs = useCallback(() => {
    console.log('[ChatPanel] 渲染标签页');
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
              onClick={() => setActiveChatTab(index)}
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
                  handleCloseChatTab(index);
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
  }, [chatTabs, activeChatTab, handleCloseChatTab]);

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
      disabled={chatTabs[activeChatTab]?.type !== 'world'}
    />
  ), [handleSendMessage, chatTabs, activeChatTab]);

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

          {renderChatTabs()}

          <div className="flex-1 overflow-y-auto p-4">
            {chatContent}
          </div>

          <div className="flex-shrink-0">
            {chatInput}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex flex-col border-l border-gray-200">
      {renderChatTabs()}

      <div className="flex-1 overflow-y-auto p-4">
        {chatContent}
      </div>

      <div className="flex-shrink-0">
        {chatInput}
      </div>
    </div>
  );
};

export default ChatPanel; 