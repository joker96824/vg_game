import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomMenu from '../components/BottomMenu'
import { getDecks, setDeckPreset } from '../services/deckService'
import type { Deck } from '../types/deck'
import FriendMenu from '../components/FriendMenu'
import { getUnauditedFiles } from '../services/authService'
import { getFriendRequests } from '../services/friendService'
import { getAvatarUrl, handleImageError, getCardImageUrl, handleCardImageError } from '../utils/image/imageUtils'
import { WebSocketMessage } from '../services/websocketService'
import ChatPanel from '../components/ChatPanel'
import { websocketManager } from '../services/websocketManager'
import { createRoom, getUserRoomStatus } from '../services/roomService'
import CreateRoomModal from '../components/CreateRoomModal'
import MatchSuccessModal from '../components/MatchSuccessModal'
import { error, success } from '../utils/notification'
import { joinMatch, confirmMatch, leaveMatch, getMatchStatus } from '../services/matchService'

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
  handleStartChat: (friend: Friend) => void;
  onOpenCreateRoomModal: () => void;
  userRoomStatus: {
    in_room: boolean;
    room_id: string | null;
    room_name: string | null;
    player_order: number | null;
    status: string | null;
    join_time: string | null;
  } | null;
  onEnterRoom: () => void;
  onJoinRoom: () => void;
  onMatchGame: () => void;
  isMatching: boolean;
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
  setIsFriendMenuOpen,
  handleStartChat,
  onOpenCreateRoomModal,
  userRoomStatus,
  onEnterRoom,
  onJoinRoom,
  onMatchGame,
  isMatching
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
          {userRoomStatus?.in_room ? (
            <button 
              className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              onClick={onEnterRoom}
            >
              进入房间
          </button>
          ) : (
            <button 
              className={`w-full py-3 rounded-xl transition-colors ${
                isMatching 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              onClick={onMatchGame}
            >
              {isMatching ? '取消匹配' : '匹配对战'}
            </button>
          )}
          <button 
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
            onClick={onJoinRoom}
          >
            加入房间
          </button>
          <button 
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
            onClick={onOpenCreateRoomModal}
          >
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
        onStartChat={handleStartChat}
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
  setIsFriendMenuOpen,
  handleStartChat,
  onOpenCreateRoomModal,
  userRoomStatus,
  onEnterRoom,
  onJoinRoom,
  onMatchGame,
  isMatching
}: Omit<LayoutProps, 'isChatOpen' | 'setIsChatOpen'>) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 桌面版顶部栏 */}
      <header className="w-full h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex space-x-4">
          {userRoomStatus?.in_room ? (
            <button 
              className="px-4 py-1.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-sm"
              onClick={onEnterRoom}
            >
              进入房间
          </button>
          ) : (
            <button 
              className={`px-4 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm ${
                isMatching 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              onClick={onMatchGame}
            >
              {isMatching ? '取消匹配' : '匹配对战'}
            </button>
          )}
          <button 
            className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors text-sm"
            onClick={onJoinRoom}
          >
            加入房间
          </button>
          <button 
            className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors text-sm"
            onClick={onOpenCreateRoomModal}
          >
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
        onStartChat={handleStartChat}
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
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [userRoomStatus, setUserRoomStatus] = useState<{
    in_room: boolean;
    room_id: string | null;
    room_name: string | null;
    player_order: number | null;
    status: string | null;
    join_time: string | null;
  } | null>(null);
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<WebSocketMessage[]>([]);
  const [chatTabs, setChatTabs] = useState<{ type: 'world' | 'friend'; friend?: Friend }[]>([{ type: 'world' }]);
  const [activeChatTab, setActiveChatTab] = useState<number>(0);
  const [unreadTabs, setUnreadTabs] = useState<Set<number>>(new Set());
  
  // 匹配相关状态
  const [isMatching, setIsMatching] = useState(false);
  const [matchSuccessModal, setMatchSuccessModal] = useState<{
    isOpen: boolean;
    matchId: string;
    players: Array<{
      user_id: string;
      nickname: string;
      avatar: string;
    }>;
  }>({
    isOpen: false,
    matchId: '',
    players: []
  });

  // 添加匹配确认状态跟踪
  const [matchConfirmationState, setMatchConfirmationState] = useState<{
    isProcessing: boolean;
    currentMatchId: string | null;
    confirmedAt: string | null;
  }>({
    isProcessing: false,
    currentMatchId: null,
    confirmedAt: null
  });

  // 使用 useRef 存储最新的状态，避免闭包问题
  const chatTabsRef = useRef(chatTabs);
  const activeChatTabRef = useRef(activeChatTab);
  const setIsChatOpenRef = useRef(setIsChatOpen);
  const matchConfirmationStateRef = useRef(matchConfirmationState);
  const isMatchingRef = useRef(isMatching);
  const userRoomStatusRef = useRef(userRoomStatus);

  // 更新 ref 值
  useEffect(() => {
    chatTabsRef.current = chatTabs;
  }, [chatTabs]);

  useEffect(() => {
    activeChatTabRef.current = activeChatTab;
  }, [activeChatTab]);

  useEffect(() => {
    setIsChatOpenRef.current = setIsChatOpen;
  }, [setIsChatOpen]);

  useEffect(() => {
    matchConfirmationStateRef.current = matchConfirmationState;
  }, [matchConfirmationState]);

  useEffect(() => {
    isMatchingRef.current = isMatching;
  }, [isMatching]);

  useEffect(() => {
    userRoomStatusRef.current = userRoomStatus;
  }, [userRoomStatus]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
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
    } else {
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

  // 获取用户房间状态
  const fetchUserRoomStatus = useCallback(async () => {
    try {
      const status = await getUserRoomStatus();
      setUserRoomStatus(status);
      
      // 如果用户在房间中且状态为loading，跳转到loading页面
      if (status.in_room && status.room_id && status.status === 'loading') {
        navigate('/loading');
      }
      // 如果用户在房间中且状态为gaming，跳转到game页面
      else if (status.in_room && status.room_id && status.status === 'gaming') {
        navigate('/game');
      }
    } catch (error) {
      console.error('获取用户房间状态失败:', error);
    }
  }, [navigate]);

  // 获取匹配状态
  const fetchMatchStatus = useCallback(async () => {
    try {
      const matchStatus = await getMatchStatus();
      setIsMatching(matchStatus.in_queue);
      console.log('获取匹配状态成功:', matchStatus);
    } catch (error) {
      console.error('获取匹配状态失败:', error);
      // 如果获取失败，默认不在匹配状态
      setIsMatching(false);
    }
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
    fetchUserRoomStatus(); // 添加获取用户房间状态
    fetchMatchStatus();    // 添加获取匹配状态
  }, [fetchUserRoomStatus, fetchMatchStatus]);

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

  // 当切换标签页时，清除未读标记
  const handleTabChange = useCallback((index: number) => {
    setActiveChatTab(index);
    setUnreadTabs(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []); // 空依赖数组

  const handleStartChat = useCallback((friend: Friend) => {
    // 检查是否已经存在与该好友的聊天标签页
    const existingTabIndex = chatTabsRef.current.findIndex(
      tab => tab.type === 'friend' && tab.friend?.friend_id === friend.friend_id
    );

    if (existingTabIndex !== -1) {
      // 如果已存在，切换到该标签页
      setActiveChatTab(existingTabIndex);
    } else {
      // 如果不存在，添加新的标签页
      setChatTabs(prev => [...prev, { type: 'friend', friend }]);
      setActiveChatTab(chatTabsRef.current.length);
    }

    // 打开聊天面板
    setIsChatOpenRef.current(true);
    
    // 关闭好友菜单 - 同时重置位置
    setIsFriendMenuOpen(false);
    setFriendButtonPosition(null);
  }, [friendButtonPosition]); // 添加 friendButtonPosition 依赖

  // 将handleWebSocketMessage移回外部，使用useCallback包装
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    // 处理不同类型的消息
    switch (message.type) {
      case 'chat':
        // 获取当前用户信息
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const isCurrentUserMessage = currentUser && message.sender_id === currentUser.id;

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

        // 如果是私聊消息（有receiver_id），自动打开聊天面板
        if (!isCurrentUserMessage && message.sender_id && message.receiver_id) {
          // 检查是否已经存在与该好友的聊天标签页
          const existingTabIndex = chatTabsRef.current.findIndex(
            tab => tab.type === 'friend' && tab.friend?.friend_id === message.sender_id
          );

          if (existingTabIndex !== -1) {
            // 如果已存在，切换到该标签页
            setActiveChatTab(existingTabIndex);
          } else {
            // 如果不存在，创建新的标签页
            // 使用 sender_id 作为 friend_id 来创建好友对象
            const newFriend: Friend = {
              id: message.sender_id || '',
              username: message.sender_name || '',
              nickname: message.sender_name || '',
              avatar: message.sender_avatar || '',
              is_blocked: false,
              friend_id: message.sender_id || '',
              friend_username: message.sender_name || '',
              friend_nickname: message.sender_name || '',
              friend_avatar: message.sender_avatar || ''
            };
            
            setChatTabs(prev => [...prev, { type: 'friend', friend: newFriend }]);
            const newTabIndex = chatTabsRef.current.length;
            // 新创建的标签页自动添加未读标记
            setUnreadTabs(prev => new Set(prev).add(newTabIndex));
          }

          // 打开聊天面板
          setIsChatOpenRef.current(true);
        }
        break;
      case 'match_confirmation':
        // 处理匹配确认消息
        const matchId = message.data?.match_id || '';
        const matchedUsers = message.data?.matched_users || [];
        
        // 检查用户是否已经在房间中
        if (userRoomStatusRef.current?.in_room) {
          return;
        }
        
        // 检查是否已经在处理这个匹配
        if (matchConfirmationStateRef.current.isProcessing && matchConfirmationStateRef.current.currentMatchId === matchId) {
          return;
        }
        
        // 检查是否已经确认过这个匹配
        if (matchConfirmationStateRef.current.confirmedAt && matchConfirmationStateRef.current.currentMatchId === matchId) {
          return;
        }
        
        // 检查匹配用户信息是否完整
        if (!matchedUsers || matchedUsers.length === 0) {
          return;
        }
        
        // 检查用户信息是否完整
        const hasIncompleteUserInfoConfirmation = matchedUsers.some(user => 
          !user.user_id || !user.nickname || !user.avatar
        );
        
        if (hasIncompleteUserInfoConfirmation) {
          return;
        }
        
        // 设置匹配确认状态（不设置isProcessing为true，让用户点击按钮时设置）
        setMatchConfirmationState(prev => ({
          ...prev,
          currentMatchId: matchId,
          confirmedAt: null
        }));
        
        setMatchSuccessModal({
          isOpen: true,
          matchId: matchId,
          players: matchedUsers
        });
        
        // 停止匹配状态
        setIsMatching(false);
        break;
      case 'match_success':
        // 处理匹配成功消息
        const successMatchId = message.data?.match_id || '';
        const successRoomId = message.data?.room_id || '';
        const successRoomName = message.data?.room_name || '';
        const successMatchedUsers = message.data?.matched_users || [];
        
        // 检查用户是否已经在房间中
        if (userRoomStatusRef.current?.in_room) {
          return;
        }
        
        // 如果match_success消息的match_id为空，使用当前处理的匹配ID
        const effectiveMatchId = successMatchId || matchConfirmationStateRef.current.currentMatchId || '';
        
        // 如果已经确认过这个匹配，忽略消息
        if (matchConfirmationStateRef.current.confirmedAt && matchConfirmationStateRef.current.currentMatchId === effectiveMatchId) {
          return;
        }
        
        // 检查房间信息是否完整
        if (!successRoomId) {
          return;
        }
        
        // 清理匹配确认状态
        setMatchConfirmationState(prev => ({
          isProcessing: false,
          currentMatchId: null,
          confirmedAt: null
        }));
        
        // 关闭匹配成功弹窗（如果还在显示）
        setMatchSuccessModal(prev => ({ ...prev, isOpen: false }));
        
        // 停止匹配状态
        setIsMatching(false);
        
        // 跳转到loading页面而不是房间页面
        navigate('/loading');
        break;
      case 'game_loading':
        // 处理游戏加载消息
        // 直接跳转到loading页面
        navigate('/loading');
        break;
      case 'notification':
        // 处理通知消息
        break;
      case 'system_notification':
        // 处理系统通知
        break;
      case 'room_dissolved':
        // 处理房间解散消息
        // 如果用户当前在房间中，更新状态为不在房间
        if (userRoomStatusRef.current?.in_room) {
          setUserRoomStatus({
            in_room: false,
            room_id: null,
            room_name: null,
            player_order: null,
            status: null,
            join_time: null
          });
        }
        break;
      case 'room_kicked':
        // 处理被踢出房间消息
        // 如果用户当前在房间中，更新状态为不在房间
        if (userRoomStatusRef.current?.in_room) {
          setUserRoomStatus({
            in_room: false,
            room_id: null,
            room_name: null,
            player_order: null,
            status: null,
            join_time: null
          });
        }
        break;
    }
  }, []); // 空依赖数组，使用ref访问最新状态

  useEffect(() => {
    // 设置WebSocket回调
    const connectionListener = (connected: boolean) => {
      // WebSocket连接状态变化
    };
    const authListener = (authenticated: boolean) => {
      // WebSocket认证状态变化
    };
    const errorListener = (error: string) => {
      console.error('WebSocket错误:', error);
    };

    websocketManager.addConnectionListener(connectionListener);
    websocketManager.addAuthListener(authListener);
    websocketManager.addMessageListener(handleWebSocketMessage);
    websocketManager.addErrorListener(errorListener);

    // 清理函数 - 只移除监听器，不断开连接
    return () => {
      websocketManager.removeConnectionListener(connectionListener);
      websocketManager.removeAuthListener(authListener);
      websocketManager.removeMessageListener(handleWebSocketMessage);
      websocketManager.removeErrorListener(errorListener);
      
      // 清理匹配确认状态
      setMatchConfirmationState(prev => ({
        isProcessing: false,
        currentMatchId: null,
        confirmedAt: null
      }));
      
      // 移除 websocketManager.disconnect() 调用，保持连接持久
    };
  }, [handleWebSocketMessage]); // 依赖handleWebSocketMessage

  const handleDeckClick = (index: number) => {
    setSelectedDeckIndex(index);
  };

  const handleSelectedDeckClick = () => {
    if (allDecks[selectedDeckIndex]) {
      navigate('/deck', { state: { deck: allDecks[selectedDeckIndex] } });
    }
  };

  // 处理进入房间
  const handleEnterRoom = () => {
    if (userRoomStatus?.in_room && userRoomStatus?.room_id) {
      navigate(`/room/${userRoomStatus.room_id}`);
    }
  };

  // 处理加入房间
  const handleJoinRoom = () => {
    navigate('/room-list');
  };

  // 处理匹配对战
  const handleMatchGame = async () => {
    if (isMatching) {
      // 如果正在匹配，则取消匹配
      try {
        await leaveMatch();
        setIsMatching(false);
        success('已取消匹配');
      } catch (err) {
        console.error('取消匹配失败:', err);
        error('取消匹配失败');
      }
    } else {
      // 如果未在匹配，则开始匹配
      if (allDecks.length > 0 && allDecks[selectedDeckIndex]) {
        try {
          await setDeckPreset(allDecks[selectedDeckIndex].id, 0);
          console.log('设置匹配对战卡组成功');
          
          // 调用加入匹配API
          const matchResult = await joinMatch();
          console.log('加入匹配成功:', matchResult);
          
          setIsMatching(true);
          success('已开始匹配，请等待...');
        } catch (err) {
          console.error('开始匹配失败:', err);
          error('开始匹配失败');
        }
      } else {
        error('请先选择卡组');
      }
    }
  };

  // 使用 useMemo 缓存 ChatPanel 组件
  const chatPanel = useMemo(() => {
    return (
      <ChatPanel
        wsService={websocketManager}
        chatMessages={chatMessages}
        isMobile={isMobile}
        chatTabs={chatTabs}
        activeChatTab={activeChatTab}
        onTabChange={handleTabChange}
        onCloseTab={(index) => {
          setChatTabs(prev => prev.filter((_, i) => i !== index));
          if (activeChatTab >= index) {
            setActiveChatTab(Math.max(0, activeChatTab - 1));
          }
          // 清除被关闭标签页的未读标记
          setUnreadTabs(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        }}
        unreadTabs={unreadTabs}
        onClose={() => setIsChatOpen(false)}
      />
    );
  }, [websocketManager, chatMessages, isMobile, chatTabs, activeChatTab, handleTabChange, unreadTabs, setIsChatOpen]);

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
          handleStartChat={handleStartChat}
          onOpenCreateRoomModal={() => setIsCreateRoomModalOpen(true)}
          userRoomStatus={userRoomStatus}
          onEnterRoom={handleEnterRoom}
          onJoinRoom={handleJoinRoom}
          onMatchGame={handleMatchGame}
          isMatching={isMatching}
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
        handleStartChat={handleStartChat}
        onOpenCreateRoomModal={() => setIsCreateRoomModalOpen(true)}
        userRoomStatus={userRoomStatus}
        onEnterRoom={handleEnterRoom}
        onJoinRoom={handleJoinRoom}
        onMatchGame={handleMatchGame}
        isMatching={isMatching}
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
    setIsFriendMenuOpen,
    handleStartChat,
    userRoomStatus,
    handleEnterRoom,
    handleJoinRoom,
    handleMatchGame,
    isMatching
  ]);

  // 处理匹配成功弹窗的接受
  const handleMatchAccept = async () => {
    try {
      // 设置处理状态，防止重复点击
      setMatchConfirmationState(prev => ({
        ...prev,
        isProcessing: true
      }));
      
      // 调用确认匹配API
      const result = await confirmMatch(matchSuccessModal.matchId, true);
      
      // 立即清理匹配确认状态，防止后续消息干扰
      setMatchConfirmationState(prev => ({
        isProcessing: false,
        currentMatchId: null,
        confirmedAt: null
      }));
      
      setMatchSuccessModal(prev => ({ ...prev, isOpen: false }));
      setIsMatching(false); // 确认匹配后不再处于匹配状态
      success('已接受匹配，正在进入游戏...');
      
      // 跳转到房间页面
      if (result.room_id) {
        navigate(`/room/${result.room_id}`);
      }
    } catch (err) {
      console.error('确认匹配失败:', err);
      error('确认匹配失败');
      
      // 重置处理状态
      setMatchConfirmationState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  };

  // 处理匹配成功弹窗的拒绝
  const handleMatchReject = async () => {
    try {
      // 设置处理状态，防止重复点击
      setMatchConfirmationState(prev => ({
        ...prev,
        isProcessing: true
      }));
      
      // 调用拒绝匹配API
      await confirmMatch(matchSuccessModal.matchId, false);
      
      // 立即清理匹配确认状态，防止后续消息干扰
      setMatchConfirmationState(prev => ({
        isProcessing: false,
        currentMatchId: null,
        confirmedAt: null
      }));
      
      setMatchSuccessModal(prev => ({ ...prev, isOpen: false }));
      setIsMatching(false); // 拒绝匹配后不再处于匹配状态
      success('已拒绝匹配');
      
      // TODO: 可以选择是否重新进入匹配队列
    } catch (err) {
      console.error('拒绝匹配失败:', err);
      error('拒绝匹配失败');
      
      // 重置处理状态
      setMatchConfirmationState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  };

  // 处理创建房间
  const handleCreateRoom = async (roomInfo: {
    room_name: string;
    room_type: string;
    game_settings: Record<string, any>;
    pass_word: string;
    remark: string;
  }) => {
    try {
      const room = await createRoom(roomInfo);
      console.log('房间创建成功:', room);
      // 跳转到房间页面
      if (room && room.id) {
        navigate(`/room/${room.id}`);
      }
    } catch (err) {
      console.error('创建房间失败:', err);
      error('创建房间失败');
    }
  };

  return (
    <>
      {layout}

      {/* 好友菜单 */}
      <FriendMenu
        isOpen={isFriendMenuOpen}
        onClose={() => setIsFriendMenuOpen(false)}
        position={friendButtonPosition}
        onStartChat={handleStartChat}
      />

      {/* 创建房间弹窗 */}
      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      {/* 匹配成功弹窗 */}
      <MatchSuccessModal
        isOpen={matchSuccessModal.isOpen}
        matchId={matchSuccessModal.matchId}
        players={matchSuccessModal.players}
        onAccept={handleMatchAccept}
        onReject={handleMatchReject}
      />
    </>
  );
}

export default Home 