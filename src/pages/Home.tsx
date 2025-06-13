import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomMenu from '../components/BottomMenu'
import { getDecks } from '../services/deckService'
import type { Deck } from '../types/deck'
import { IMAGE_BASE_URL } from '../constants/api'
import FriendMenu from '../components/FriendMenu'
import { getUnauditedFiles } from '../services/authService'
import { getFriendRequests } from '../services/friendService'

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

const Home: React.FC = () => {
  const [nickName, setNickName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatType, setChatType] = useState<'world' | 'friend'>('world');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);
  const [friendButtonPosition, setFriendButtonPosition] = useState<{ left: number; bottom: number } | null>(null);
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([{ type: 'world' }]);
  const [activeChatTab, setActiveChatTab] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log(user);
        setNickName(user.nickname || '');
        setAvatar(user.avatar || '');
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }

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

  const handleDeckClick = (index: number) => {
    setSelectedDeckIndex(index);
  };

  const handleSelectedDeckClick = () => {
    if (allDecks[selectedDeckIndex]) {
      navigate('/deck', { state: { deck: allDecks[selectedDeckIndex] } });
    }
  };

  const handleStartChat = (friend: Friend) => {
    // 检查是否已经存在该好友的聊天标签
    const existingTabIndex = chatTabs.findIndex(
      tab => tab.type === 'friend' && tab.friend?.friend_id === friend.friend_id
    );

    if (existingTabIndex === -1) {
      // 如果不存在，添加新的聊天标签
      setChatTabs(prev => [...prev, { type: 'friend', friend }]);
      setActiveChatTab(chatTabs.length);
    } else {
      // 如果已存在，切换到该标签
      setActiveChatTab(existingTabIndex);
    }
    setIsChatOpen(true);
  };

  const handleCloseChatTab = (index: number) => {
    setChatTabs(prev => prev.filter((_, i) => i !== index));
    if (activeChatTab >= index) {
      setActiveChatTab(Math.max(0, activeChatTab - 1));
    }
  };

  const MobileLayout = () => (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* 移动端顶部栏 - 只显示欢迎文字 */}
      <header className="w-full h-14 flex items-center justify-center px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={`${IMAGE_BASE_URL}/avatars/${avatar}`}
              alt="用户头像"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-gray-200');
              }}
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
                              src={`${IMAGE_BASE_URL}/vg_image/${card.image}.jpg`}
                              alt={allDecks[selectedDeckIndex].deck_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement?.classList.add('text-center', 'bg-gray-100');
                              }}
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
                              src={`${IMAGE_BASE_URL}/vg_image/${card.image}.jpg`}
                              alt={deck.deck_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement?.classList.add('text-center', 'bg-gray-100');
                              }}
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
            setSelectedFriend(null);
          }}
        />
      )}

      {/* 聊天框 */}
      <div 
        className={`fixed top-0 right-0 h-full w-[70%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* 聊天框头部 */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
            <span className="font-bold">聊天</span>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => {
                setIsChatOpen(false);
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
            <div className="text-gray-500 text-center">
              {chatTabs[activeChatTab]?.type === 'world' 
                ? '世界聊天内容' 
                : `与 ${chatTabs[activeChatTab]?.friend?.friend_nickname} 的聊天内容`}
            </div>
          </div>

          {/* 聊天输入区域 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="输入消息..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

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
          setFriendButtonPosition(position);
          setIsFriendMenuOpen(true);
        }} />
      </footer>
    </div>
  );

  const DesktopLayout = () => (
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
              src={`${IMAGE_BASE_URL}/avatars/${avatar}`}
              alt="用户头像"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-gray-200');
              }}
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
                          src={`${IMAGE_BASE_URL}/vg_image/${card.image}.jpg`}
                          alt={deck.deck_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement?.classList.add('text-center');
                          }}
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
                          src={`${IMAGE_BASE_URL}/vg_image/${card.image}.jpg`}
                          alt={allDecks[selectedDeckIndex].deck_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement?.classList.add('text-center');
                          }}
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
            <div className="text-gray-500 text-center">
              {chatTabs[activeChatTab]?.type === 'world' 
                ? '世界聊天内容' 
                : `与 ${chatTabs[activeChatTab]?.friend?.friend_nickname} 的聊天内容`}
            </div>
          </div>

          {/* 聊天输入区域 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="输入消息..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
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
          setFriendButtonPosition(position);
          setIsFriendMenuOpen(true);
        }} />
      </footer>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

export default Home 