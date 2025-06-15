import React, { useState } from 'react';
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

const ChatPanel: React.FC<ChatPanelProps> = ({ wsService, chatMessages, isMobile = false }) => {
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([{ type: 'world' }]);
  const [activeChatTab, setActiveChatTab] = useState<number>(0);
  const [chatMessage, setChatMessage] = useState('');

  const handleCloseChatTab = (index: number) => {
    setChatTabs(prev => prev.filter((_, i) => i !== index));
    if (activeChatTab >= index) {
      setActiveChatTab(Math.max(0, activeChatTab - 1));
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && chatTabs[activeChatTab]?.type === 'world') {
      wsService.sendMessage('chat', chatMessage);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderChatContent = () => {
    if (chatTabs[activeChatTab]?.type === 'world') {
      return (
        <div className="space-y-2">
          {chatMessages.map((msg, index) => (
            <div key={index} className="p-2 bg-gray-100 rounded-lg">
              {msg.sender_name && (
                <span className="font-bold text-blue-600 mr-2">{msg.sender_name}:</span>
              )}
              <span>{msg.content}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="text-gray-500 text-center">
        {`与 ${chatTabs[activeChatTab]?.friend?.friend_nickname} 的聊天内容`}
      </div>
    );
  };

  const renderChatInput = () => (
    <div className="border-t border-gray-200 p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!chatMessage.trim() || chatTabs[activeChatTab]?.type !== 'world'}
          className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed top-0 right-0 h-full w-[70%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40">
        <div className="h-full flex flex-col">
          {/* 聊天框头部 */}
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

          {/* 聊天标签栏 */}
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

          {/* 聊天内容区域 */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderChatContent()}
          </div>

          {renderChatInput()}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex flex-col border-l border-gray-200">
      {/* 聊天标签栏 */}
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

      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderChatContent()}
      </div>

      {renderChatInput()}
    </div>
  );
};

export default ChatPanel; 