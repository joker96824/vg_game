import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomMenu from '../components/BottomMenu'
import { getDecks } from '../services/deckService'
import type { Deck } from '../types/deck'
import { IMAGE_BASE_URL, WS_BASE_URL } from '../constants/api'
import FriendMenu from '../components/FriendMenu'
import { getUnauditedFiles } from '../services/authService'
import { getFriendRequests } from '../services/friendService'
import { getAvatarUrl, handleImageError, getCardImageUrl, handleCardImageError } from '../utils/image/imageUtils'
import { WebSocketService, WebSocketMessage } from '../services/websocketService'
import ChatPanel from '../components/ChatPanel'

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

interface LayoutProps {
  chatPanel: React.ReactNode;
  isChatOpen?: boolean;
  isFriendMenuOpen: boolean;
  friendButtonPosition: { left: number; bottom: number } | null;
  onFriendClick: (position: { left: number; bottom: number } | null) => void;
  avatar: string;
  nickName: string;
  allDecks: Deck[];
  selectedDeckIndex: number;
  handleSelectedDeckClick: () => void;
  handleDeckClick: (index: number) => void;
  navigate: (path: string, options?: any) => void;
  setIsChatOpen: (isOpen: boolean) => void;
  setIsFriendMenuOpen: (isOpen: boolean) => void;
}

// 将布局组件提取为独立的组件
const MobileLayout = React.memo(({ 
  chatPanel, 
  isChatOpen,
  isFriendMenuOpen,
  friendButtonPosition,
  onFriendClick,
  avatar,
  nickName,
  allDecks,
  selectedDeckIndex,
  handleSelectedDeckClick,
  handleDeckClick,
  navigate,
  setIsChatOpen,
  setIsFriendMenuOpen
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* 移动端顶部栏 - 只显示欢迎文字 */}
      <header className="w-full h-14 flex items-center justify-center px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={avatar}
              alt="用户头像"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          <span className="font-bold text-lg">欢迎你，{nickName}</span>
        </div>
      </header>

      {/* 移动端主内容区域 */}
      <main className="flex-1 flex flex-col p-4">
        {/* 上半部分 - 三个按钮 */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <button className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
            匹配对战
          </button>
          <button className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors">
            加入房间
          </button>
          <button className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors">
            创建房间
          </button>
        </div>

        {/* 下半部分 - 卡组展示 */}
        <div className="h-[calc(100vh-350px)] flex flex-col">
          {/* 选中卡组展示区域 - 80%高度 */}
          <div className="h-[80%] mb-4">
            {allDecks.length > 0 ? (
              allDecks[selectedDeckIndex] && (
                <div 
                  className="w-full h-full border-2 border-blue-500 rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => handleSelectedDeckClick()}
                >
                  <div className="w-full h-full relative flex">
                    {/* 卡组图片展示 */}
                    <div className="absolute inset-0 flex">
                      {allDecks[selectedDeckIndex].deck_cards
                        .filter(card => card.deck_zone === 'ride')
                        .slice(0, 4)
                        .map((card, index) => (
                          <div 
                            key={index} 
                            className="flex-1 relative"
                          >
                            <img 
                              src={getCardImageUrl(card.image)}
                              alt={allDecks[selectedDeckIndex].deck_name}
                              className="w-full h-full object-cover"
                              onError={handleCardImageError}
                            />
                          </div>
                      ))}
                    </div>
                    {/* 卡组名称 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-center px-2 py-1 text-sm">
                      {allDecks[selectedDeckIndex].deck_name}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <button
                className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                onClick={() => navigate('/deck')}
              >
                <span className="text-xl">请编辑你的卡组</span>
              </button>
            )}
          </div>

          {/* 卡组列表区域 - 20%高度 */}
          <div className="h-[20%] overflow-x-auto">
            <div className="flex gap-3 h-full pb-2 px-2">
              {allDecks.map((deck, index) => {
                const isSelected = index === selectedDeckIndex;
                const rideCards = deck.deck_cards.filter(card => card.deck_zone === 'ride').slice(0, 4);
                
                return (
                  <div
                    key={deck.id}
                    className={`shrink-0 transition-all duration-300 h-full w-[calc(25%-12px)] min-w-[200px] cursor-pointer`}
                    onClick={() => {
                      handleDeckClick(index);
                      if (isSelected) handleSelectedDeckClick();
                    }}
                  >
                    <div className={`h-full relative border rounded-2xl overflow-hidden ${
                      isSelected ? 'border-blue-500 border-2 scale-100' : 'border-gray-200 scale-90'
                    } transition-all duration-300`}>
                      <div className="absolute inset-0 flex">
                        {rideCards.map((card, cardIndex) => (
                          <div key={cardIndex} className="flex-1 relative">
                            <img 
                              src={getCardImageUrl(card.image)}
                              alt={deck.deck_name}
                              className="w-full h-full object-cover"
                              onError={handleCardImageError}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-center px-2 py-1 text-sm">
                        {deck.deck_name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 聊天框切换按钮 */}
      <button
        className="fixed right-4 bottom-24 w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-50"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* 聊天遮罩层 */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => {
            setIsChatOpen(false);
          }}
        />
      )}

      {/* 聊天框 */}
      {isChatOpen && chatPanel}

      {/* 好友菜单 */}
      <FriendMenu
        isOpen={isFriendMenuOpen}
        onClose={() => setIsFriendMenuOpen(false)}
        position={friendButtonPosition}
        onStartChat={(friend) => {
          // 这里需要实现好友聊天的功能
        }}
      />

      {/* 底部菜单栏 */}
      <footer className="bg-white border-t border-gray-200">
        <BottomMenu onFriendClick={(position) => {
          onFriendClick(position);
        }} />
      </footer>
    </div>
  );
});

const DesktopLayout = React.memo(({ 
  chatPanel,
  isFriendMenuOpen,
  friendButtonPosition,
  onFriendClick,
  avatar,
  nickName,
  allDecks,
  selectedDeckIndex,
  handleSelectedDeckClick,
  handleDeckClick,
  navigate,
  setIsFriendMenuOpen
}: Omit<LayoutProps, 'isChatOpen' | 'setIsChatOpen'>) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 桌面版顶部栏 */}
      <header className="w-full h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex space-x-4">
          <button className="px-4 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm">
            匹配对战
          </button>
          <button className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors text-sm">
            加入房间
          </button>
          <button className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors text-sm">
            创建房间
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={avatar}
              alt="用户头像"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          <span className="font-bold text-lg">欢迎你，{nickName}</span>
        </div>
      </header>

      {/* 桌面版主内容区域 */}
      <main className="flex-1 flex min-h-0">
        {/* 左侧所有卡组 */}
        <div className="w-64 p-4 border-r border-gray-200 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {allDecks.map((deck, index) => {
              const rideCards = deck.deck_cards.filter(card => card.deck_zone === 'ride').slice(0, 4);
              return (
                <div
                  key={deck.id}
                  className={`border border-gray-200 rounded-2xl w-full h-24 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer relative overflow-hidden ${
                    selectedDeckIndex === index ? 'border-blue-500 border-2' : ''
                  }`}
                  onClick={() => handleDeckClick(index)}
                >
                  <div className="absolute inset-0 flex">
                    {rideCards.map((card, index) => (
                      <div key={index} className="flex-1 relative">
                        <img 
                          src={getCardImageUrl(card.image)}
                          alt={deck.deck_name}
                          className="w-full h-full object-cover"
                          onError={handleCardImageError}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="absolute bottom-0 left-0 right-0 text-center px-2 py-1 bg-white/80 rounded-b-2xl text-xs">
                    {deck.deck_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 中间选中卡组区域 */}
        <div className="flex-1 flex items-center justify-center">
          {allDecks.length > 0 ? (
            allDecks[selectedDeckIndex] && (
              <div 
                className="relative border border-gray-200 rounded-2xl w-96 h-56 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer overflow-hidden"
                onClick={handleSelectedDeckClick}
              >
                <div className="absolute inset-0 flex">
                  {allDecks[selectedDeckIndex].deck_cards
                    .filter(card => card.deck_zone === 'ride')
                    .slice(0, 4)
                    .map((card, index) => (
                      <div key={index} className="flex-1 relative">
                        <img 
                          src={getCardImageUrl(card.image)}
                          alt={allDecks[selectedDeckIndex].deck_name}
                          className="w-full h-full object-cover"
                          onError={handleCardImageError}
                        />
                      </div>
                    ))}
                </div>
                <span className="absolute bottom-0 left-0 right-0 text-center px-2 py-1 bg-white/80 rounded-b-2xl text-sm">
                  {allDecks[selectedDeckIndex].deck_name}
                </span>
              </div>
            )
          ) : (
            <button
              className="relative border-2 border-dashed border-gray-300 rounded-2xl w-96 h-56 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
              onClick={() => navigate('/deck')}
            >
              <span className="text-xl">请编辑你的卡组</span>
            </button>
          )}
        </div>

        {/* 右侧聊天区域 */}
        {chatPanel}
      </main>

      {/* 好友菜单 */}
      <FriendMenu
        isOpen={isFriendMenuOpen}
        onClose={() => setIsFriendMenuOpen(false)}
        position={friendButtonPosition}
        onStartChat={(friend) => {
          // 这里需要实现好友聊天的功能
        }}
      />

      {/* 底部菜单栏 */}
      <footer className="bg-white border-t border-gray-200">
        <BottomMenu onFriendClick={(position) => {
          onFriendClick(position);
        }} />
      </footer>
    </div>
  );
});

const Home: React.FC = () => {
  const [nickName, setNickName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);
  const [friendButtonPosition, setFriendButtonPosition] = useState<{ left: number; bottom: number } | null>(null);
  const navigate = useNavigate();
  const [wsService] = useState(() => new WebSocketService(WS_BASE_URL));
  const [chatMessages, setChatMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setNickName(user.nickname || '');
      // 优先使用临时 blob URL，如果不存在则使用服务器头像
      const tempAvatarUrl = localStorage.getItem('tempAvatarUrl');
      if (tempAvatarUrl) {
        setAvatar(tempAvatarUrl);
      } else if (user.avatar) {
        setAvatar(getAvatarUrl(user.avatar));
      } else {
        setAvatar('');
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      navigate('/login');
    }
  }, [navigate]);

  // 添加头像更新事件监听
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatar(event.detail.avatarUrl);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    // 加载所有卡组
    const loadDecks = async () => {
      try {
        const decks = await getDecks(true);
        // 将 preset=0 的卡组排在最前面
        const sortedDecks = decks.sort((a, b) => {
          if (a.preset === 0) return -1;
          if (b.preset === 0) return 1;
          return 0;
        });
        setAllDecks(sortedDecks);
      } catch (error) {
        console.error('加载卡组失败:', error);
      }
    };

    loadDecks();
  }, []);

  useEffect(() => {
    const checkUnauditedFiles = async () => {
      try {
        // 从 localStorage 获取用户信息
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // 检查用户权限
          if (user.level >= 5) {
            const files = await getUnauditedFiles();
            // 将未审核文件状态存储到 localStorage 中，供 AdminMenu 使用
            localStorage.setItem('hasUnauditedFiles', files.items.length > 0 ? 'true' : 'false');
          } else {
            // 如果权限不足，确保状态为 false
            localStorage.setItem('hasUnauditedFiles', 'false');
          }
        }
      } catch (error) {
        console.error('检查未审核文件失败:', error);
      }
    };

    const checkFriendRequests = async () => {
      try {
        const requests = await getFriendRequests();
        // 将好友请求状态存储到 localStorage 中，供 FriendMenu 使用
        localStorage.setItem('hasFriendRequests', requests.length > 0 ? 'true' : 'false');
      } catch (error) {
        console.error('获取好友请求失败:', error);
      }
    };

    checkUnauditedFiles();
    checkFriendRequests();
  }, []);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    // 处理不同类型的消息
    switch (message.type) {
      case 'chat':
        // 添加聊天消息到列表
        setChatMessages(prev => {
          // 检查消息是否已存在
          const exists = prev.some(msg => 
            msg.sender_name === message.sender_name && 
            msg.content === message.content &&
            msg.timestamp === message.timestamp
          );
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });
        break;
      case 'notification':
        // 处理通知消息
        break;
      case 'system_notification':
        // 处理系统通知
        break;
    }
  }, []);

  useEffect(() => {
    // 设置WebSocket回调
    wsService.setConnectionChangeCallback((connected) => {
      // WebSocket连接状态变化
    });

    wsService.setAuthChangeCallback((authenticated) => {
      // WebSocket认证状态变化
    });

    wsService.setMessageCallback(handleWebSocketMessage);

    wsService.setErrorCallback((error) => {
      console.error('WebSocket错误:', error);
    });

    // 连接WebSocket
    wsService.connect();

    // 清理函数
    return () => {
      wsService.disconnect();
    };
  }, [wsService, handleWebSocketMessage]);

  const handleDeckClick = (index: number) => {
    setSelectedDeckIndex(index);
  };

  const handleSelectedDeckClick = () => {
    if (allDecks[selectedDeckIndex]) {
      navigate('/deck', { state: { deck: allDecks[selectedDeckIndex] } });
    }
  };

  // 使用 useMemo 缓存 ChatPanel 组件
  const chatPanel = useMemo(() => {
    return (
      <ChatPanel
        wsService={wsService}
        chatMessages={chatMessages}
        isMobile={isMobile}
      />
    );
  }, [wsService, chatMessages, isMobile]);

  // 使用 useMemo 缓存布局组件
  const layout = useMemo(() => {
    if (isMobile) {
      return (
        <MobileLayout
          chatPanel={chatPanel}
          isChatOpen={isChatOpen}
          isFriendMenuOpen={isFriendMenuOpen}
          friendButtonPosition={friendButtonPosition}
          onFriendClick={(position) => {
            setFriendButtonPosition(position);
            setIsFriendMenuOpen(true);
          }}
          avatar={avatar}
          nickName={nickName}
          allDecks={allDecks}
          selectedDeckIndex={selectedDeckIndex}
          handleSelectedDeckClick={handleSelectedDeckClick}
          handleDeckClick={handleDeckClick}
          navigate={navigate}
          setIsChatOpen={setIsChatOpen}
          setIsFriendMenuOpen={setIsFriendMenuOpen}
        />
      );
    }
    return (
      <DesktopLayout
        chatPanel={chatPanel}
        isFriendMenuOpen={isFriendMenuOpen}
        friendButtonPosition={friendButtonPosition}
        onFriendClick={(position) => {
          setFriendButtonPosition(position);
          setIsFriendMenuOpen(true);
        }}
        avatar={avatar}
        nickName={nickName}
        allDecks={allDecks}
        selectedDeckIndex={selectedDeckIndex}
        handleSelectedDeckClick={handleSelectedDeckClick}
        handleDeckClick={handleDeckClick}
        navigate={navigate}
        setIsFriendMenuOpen={setIsFriendMenuOpen}
      />
    );
  }, [
    isMobile,
    chatPanel,
    isChatOpen,
    isFriendMenuOpen,
    friendButtonPosition,
    avatar,
    nickName,
    allDecks,
    selectedDeckIndex,
    handleSelectedDeckClick,
    handleDeckClick,
    navigate,
    setIsChatOpen,
    setIsFriendMenuOpen
  ]);

  return layout;
}

export default Home 