import React from 'react'
import { useNavigate } from 'react-router-dom'
import bagIcon from '../assets/bag.svg'
import friendIcon from '../assets/friend.svg'
import historyIcon from '../assets/history.svg'
import infoIcon from '../assets/info.svg'
import settingsIcon from '../assets/settings.svg'

const menuItems = [
  { icon: bagIcon, label: '背包', route: '/cards' },
  { icon: friendIcon, label: '好友' },
  { icon: historyIcon, label: '对战记录' },
  { icon: infoIcon, label: '关于' },
  { icon: settingsIcon, label: '设置' },
]

const BottomMenu: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 flex items-center px-8 border-t border-gray-200 bg-white">
      <span className="text-xs text-gray-400">版本号</span>
      <div className="flex flex-1 justify-end">
        <div className="flex space-x-6">
          {menuItems.map(({ icon, label, route }) => (
            <div
              key={label}
              className="relative w-16 h-16 group"
              onClick={() => route && navigate(route)}
              style={{ cursor: route ? 'pointer' : 'default' }}
            >
              <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 active:scale-85 active:bg-gray-200 cursor-pointer transition-all duration-100 ease-in-out hover:shadow-md active:shadow-inner select-none transform-gpu">
                <img src={icon} alt={label} className="w-10 h-10 transition-transform duration-100 group-hover:scale-110 group-active:scale-85" />
              </div>
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                <span className="font-game text-sm whitespace-nowrap text-gray-700 group-hover:text-gray-900 transition-colors">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default BottomMenu 