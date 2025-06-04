import React, { useState } from 'react';

type ChatType = 'world' | 'friend';

interface ChatPanelProps {
  isMobile?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isMobile = false }) => {
  const [activeChat, setActiveChat] = useState<ChatType>('world');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // 如果滑动距离超过阈值，切换聊天类型
    if (Math.abs(diff) > 50) {
      setActiveChat(prev => prev === 'world' ? 'friend' : 'world');
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 mb-24">
        {activeChat === 'world' ? (
          <div className="space-y-4">
            {/* 世界聊天内容 */}
            <div className="text-gray-500 text-center">世界聊天内容</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 好友聊天内容 */}
            <div className="text-gray-500 text-center">好友聊天内容</div>
          </div>
        )}
      </div>

      {/* 底部切换按钮 */}
      <div 
        className="flex border-t border-gray-200 bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className={`flex-1 py-2 text-center transition-colors text-sm ${
            activeChat === 'world' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveChat('world')}
        >
          世界聊天
        </button>
        <button
          className={`flex-1 py-2 text-center transition-colors text-sm ${
            activeChat === 'friend' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveChat('friend')}
        >
          好友聊天
        </button>
      </div>
    </div>
  );
};

export default ChatPanel; 