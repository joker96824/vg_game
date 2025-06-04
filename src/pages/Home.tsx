import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomMenu from '../components/BottomMenu'
import ChatPanel from '../components/ChatPanel'
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* 顶部栏 */}
      <header className="w-full h-14 flex items-center justify-between px-4 border-b border-gray-200">
        {/* 左侧按钮组 */}
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
        {/* 右侧用户信息 */}
        <span className="font-bold text-lg">欢迎你，{nickName}</span>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 flex min-h-0">
        {/* 左侧预设卡组 */}
        <div className="w-64 p-4 border-r border-gray-200 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {presetDecks.slice(0, 4).map((deck) => {
              const rideCards = deck.deck_cards.filter(card => card.deck_zone === 'ride').slice(0, 4);
              return (
                <div
                  key={deck.id}
                  className="border border-gray-200 rounded-2xl w-full h-24 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer relative overflow-hidden"
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

        {/* 中间卡组区域 */}
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="relative border border-gray-200 rounded-2xl w-96 h-56 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer overflow-hidden"
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
        </div>

        {/* 右侧聊天区域 */}
        <div className="w-80 flex flex-col border-l border-gray-200">
          {/* 聊天内容区域 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-gray-500 text-center">聊天内容</div>
          </div>
          
          {/* 聊天切换按钮 */}
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

      {/* 底部菜单栏 */}
      <footer className="bg-white border-t border-gray-200">
        <BottomMenu />
      </footer>
    </div>
  )
}

export default Home 