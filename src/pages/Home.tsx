import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomMenu from '../components/BottomMenu'
import GameButton from '../components/GameButton'
import swordsIcon from '../assets/swords.svg'
import houseIcon from '../assets/house.svg'
import cardsIcon from '../assets/cards.svg'
import { getDecks, setDeckPreset } from '../services/deckService'
import type { Deck } from '../types/deck'
import { IMAGE_BASE_URL } from '../constants/api'

const Home: React.FC = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [nickName, setNickName] = useState('');
  const [presetDecks, setPresetDecks] = useState<Deck[]>([]);
  const [defaultDeck, setDefaultDeck] = useState<Deck | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const navigate = useNavigate();

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

    // 加载预设卡组
    const loadPresetDecks = async () => {
      try {
        const decks = await getDecks(true);
        // 找到 preset=0 的卡组作为默认卡组
        const defaultDeck = decks.find(deck => deck.preset === 0);
        if (defaultDeck) {
          setDefaultDeck(defaultDeck);
        }
        // 其他预设卡组（preset=1）
        const otherPresetDecks = decks.filter(deck => deck.preset === 1);
        setPresetDecks(otherPresetDecks);
      } catch (error) {
        console.error('加载预设卡组失败:', error);
      }
    };

    loadPresetDecks();
  }, []);

  const handleClick = (buttonName: string) => {
    setActiveButton(buttonName)
    setTimeout(() => setActiveButton(null), 300)
  }

  const handlePresetDeckClick = (deck: Deck) => {
    setSelectedDeck(deck);
    setShowConfirmModal(true);
  };

  const handleConfirmChange = async () => {
    if (selectedDeck) {
      try {
        // 调用 setDeckPreset 将卡组的 preset 值设置为 0
        await setDeckPreset(selectedDeck.id, 0);
        // 重新加载卡组列表
        const decks = await getDecks(true);
        const newDefaultDeck = decks.find(d => d.preset === 0);
        if (newDefaultDeck) {
          setDefaultDeck(newDefaultDeck);
        }
        const otherPresetDecks = decks.filter(d => d.preset === 1);
        setPresetDecks(otherPresetDecks);
      } catch (error) {
        console.error('设置卡组预设失败:', error);
      }
    }
    setShowConfirmModal(false);
    setSelectedDeck(null);
  };

  const handleCancelChange = () => {
    setShowConfirmModal(false);
    setSelectedDeck(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* 顶部栏，占据整行 */}
      <header className="w-full h-20 flex items-center justify-center border-b border-gray-200">
        <span className="font-bold text-xl">欢迎你，{nickName}</span>
      </header>
      <div className="flex flex-1">
        {/* 左侧区域 */}
        <aside className="flex flex-col items-center justify-center w-1/2 relative">
          <div className="flex flex-col items-center justify-center h-full">
            <GameButton 
              text="匹配" 
              icon={swordsIcon}
              isActive={activeButton === '匹配'}
              onClick={() => handleClick('匹配')}
            />
            <div className="my-10" />
            <GameButton 
              text="房间" 
              icon={houseIcon}
              isActive={activeButton === '房间'}
              onClick={() => handleClick('房间')}
            />
          </div>
        </aside>
        {/* 右侧主区域 */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center">
            {/* 卡组大区域 */}
            <div 
              className="relative border border-gray-200 rounded-2xl w-56 h-40 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer overflow-hidden"
              onClick={() => {
                handleClick('卡组');
                if (defaultDeck) {
                  setTimeout(() => navigate('/deck', { state: { deck: defaultDeck } }), 300);
                } else {
                  setTimeout(() => navigate('/deck'), 300);
                }
              }}
            >
              {defaultDeck && (
                <div className="absolute inset-0 flex">
                  {defaultDeck.deck_cards
                    .filter(card => card.deck_zone === 'ride')
                    .slice(0, 4)
                    .map((card, index) => (
                      <div key={index} className="flex-1 relative">
                        <img 
                          src={`${IMAGE_BASE_URL}/${card.image}.jpg`}
                          alt={defaultDeck.deck_name}
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
              )}
              <span className="absolute bottom-0 left-0 right-0 text-center px-2 py-1 bg-white/80 rounded-b-2xl text-sm">
                {defaultDeck?.deck_name || "卡组"}
              </span>
            </div>
            {/* 预设卡组 */}
            <div className="flex flex-col ml-8">
              {presetDecks.slice(0, 4).map((deck) => {
                // 找到 ride 区域的所有卡片
                const rideCards = deck.deck_cards.filter(card => card.deck_zone === 'ride').slice(0, 4);
                return (
                  <div
                    key={deck.id}
                    className="border border-gray-200 rounded-2xl w-28 h-20 flex items-center justify-center mb-4 last:mb-0 hover:border-gray-300 transition-colors cursor-pointer relative overflow-hidden"
                    onClick={() => handlePresetDeckClick(deck)}
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
        </main>
      </div>

      {/* 确认弹窗 */}
      {showConfirmModal && selectedDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80">
            <h3 className="text-lg font-medium text-center mb-4">确认更改出战卡组</h3>
            <p className="text-gray-600 text-center mb-6">
              是否将 "{selectedDeck.deck_name}" 设置为出战卡组？
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                onClick={handleCancelChange}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                onClick={handleConfirmChange}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomMenu />
      {/* 预留底部空间，避免内容被footer遮挡 */}
      <div className="h-24" />
    </div>
  )
}

export default Home 