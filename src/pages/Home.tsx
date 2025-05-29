import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomMenu from '../components/BottomMenu'
import GameButton from '../components/GameButton'
import swordsIcon from '../assets/swords.svg'
import houseIcon from '../assets/house.svg'
import cardsIcon from '../assets/cards.svg'

const [nickName, setNickName] = useState('');

const Home: React.FC = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const navigate = useNavigate();

  const handleClick = (buttonName: string) => {
    setActiveButton(buttonName)
    setTimeout(() => setActiveButton(null), 300)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* 顶部栏，占据整行 */}
      <header className="w-full h-20 flex items-center justify-center border-b border-gray-200">
        <span className="font-bold text-xl">卡牌战斗先导者图标</span>
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
            <GameButton 
              text="卡组" 
              icon={cardsIcon}
              isActive={activeButton === '卡组'}
              onClick={() => {
                handleClick('卡组');
                setTimeout(() => navigate('/deck'), 300);
              }}
              size="large"
            />
            {/* 预设卡组 */}
            <div className="flex flex-col ml-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl w-28 h-20 flex items-center justify-center mb-4 last:mb-0 hover:border-gray-300 transition-colors"
                >
                  预设卡组{i}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <BottomMenu />
      {/* 预留底部空间，避免内容被footer遮挡 */}
      <div className="h-24" />
    </div>
  )
}

export default Home 