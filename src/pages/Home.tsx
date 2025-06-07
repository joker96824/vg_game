import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomMenu from '../components/BottomMenu'
import { getDecks } from '../services/deckService'
import type { Deck } from '../types/deck'
import { IMAGE_BASE_URL } from '../constants/api'

const Home: React.FC = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [nickName, setNickName] = useState('');
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
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
        setNickName(user.nickname || '');
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

  const handleClick = (buttonName: string) => {
    setActiveButton(buttonName)
    setTimeout(() => setActiveButton(null), 300)
  }

  const handleDeckClick = (index: number) => {
    setSelectedDeckIndex(index);
  };

  const handleSelectedDeckClick = () => {
    if (allDecks[selectedDeckIndex]) {
      navigate('/deck', { state: { deck: allDecks[selectedDeckIndex] } });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0 && selectedDeckIndex < allDecks.length - 1) {
      // Swiped left
      setSelectedDeckIndex(prev => prev + 1);
    }

    if (distance < 0 && selectedDeckIndex > 0) {
      // Swiped right
      setSelectedDeckIndex(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const MobileLayout = () => (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 移动端顶部栏 - 只显示欢迎文字 */}
      <header className="w-full h-14 flex items-center justify-center px-4 border-b border-gray-200">
        <span className="font-bold text-lg">欢迎你，{nickName}</span>
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
            {allDecks[selectedDeckIndex] && (
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
                            src={`${IMAGE_BASE_URL}/${card.image}.jpg`}
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
                              src={`${IMAGE_BASE_URL}/${card.image}.jpg`}
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

      {/* 底部菜单栏 */}
      <footer className="bg-white border-t border-gray-200">
        <BottomMenu />
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
        <span className="font-bold text-lg">欢迎你，{nickName}</span>
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
                          src={`${IMAGE_BASE_URL}/${card.image}.jpg`}
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
          {allDecks[selectedDeckIndex] && (
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
                        src={`${IMAGE_BASE_URL}/${card.image}.jpg`}
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
          )}
        </div>

        {/* 右侧聊天区域 */}
        <div className="w-80 flex flex-col border-l border-gray-200">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-gray-500 text-center">聊天内容</div>
          </div>
          <div className="flex border-t border-gray-200 bg-white">
            <button className="flex-1 py-2 text-center transition-colors text-sm bg-blue-50 text-blue-600">
              世界聊天
            </button>
            <button className="flex-1 py-2 text-center transition-colors text-sm text-gray-600 hover:bg-gray-50">
              好友聊天
            </button>
          </div>
        </div>
      </main>

      {/* 底部菜单栏 */}
      <footer className="bg-white border-t border-gray-200">
        <BottomMenu />
      </footer>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

export default Home 