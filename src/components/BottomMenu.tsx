import React, { useState } from 'react'
import bagIcon from '../assets/bag.svg'
import friendIcon from '../assets/friend.svg'
import historyIcon from '../assets/history.svg'
import infoIcon from '../assets/info.svg'
import settingsIcon from '../assets/settings.svg'

const menuItems = [
  { icon: bagIcon, label: '背包' },
  { icon: friendIcon, label: '好友' },
  { icon: historyIcon, label: '对战记录' },
  { icon: infoIcon, label: '关于' },
  { icon: settingsIcon, label: '设置' }
]

const BottomMenu: React.FC = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null)

  const handleClick = (label: string) => {
    console.log(`Button clicked: ${label}`)
    setActiveButton(label)
    // 300ms 后重置状态
    setTimeout(() => setActiveButton(null), 300)
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 flex items-center px-8 border-t border-gray-200 bg-white">
      <span className="text-xs text-gray-400">版本号</span>
      <div className="flex flex-1 justify-end">
        <div className="flex space-x-6">
          {menuItems.map(({ icon, label }) => (
            <div
              key={label}
              className="relative w-16 h-16 group"
              onClick={() => handleClick(label)}
            >
              {/* 图标容器 */}
              <div 
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center 
                  transition-all duration-100 ease-in-out
                  ${activeButton === label 
                    ? 'scale-75 border-blue-500 bg-blue-50 shadow-inner' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md'
                  }
                  cursor-pointer select-none transform-gpu`}
              >
                <img 
                  src={icon} 
                  alt={label} 
                  className={`w-10 h-10 transition-transform duration-100
                    ${activeButton === label ? 'scale-75' : 'group-hover:scale-110'}`}
                />
              </div>
              {/* 文字标签 */}
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                <span className={`font-game text-sm whitespace-nowrap transition-colors
                  ${activeButton === label ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {label}
                </span>
              </div>
              {/* 调试信息 */}
              <div className="absolute -top-6 left-0 text-xs text-red-500">
                {activeButton === label ? 'Active!' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default BottomMenu 