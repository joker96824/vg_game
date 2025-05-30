import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import bagIcon from '../assets/bag.svg'
import friendIcon from '../assets/friend.svg'
import historyIcon from '../assets/history.svg'
import adminIcon from '../assets/admin.svg'
import infoIcon from '../assets/info.svg'
import settingsIcon from '../assets/settings.svg'
import SettingsMenu from './SettingsMenu'

interface MenuItem {
  label: string;
  route?: string;
  icon: string;
  onClick?: () => void;
  requiredLevel?: number;
}

const BottomMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [userLevel, setUserLevel] = useState<number>(0);

  // 从 localStorage 获取用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserLevel(user.level || 0);
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  const menuItems: MenuItem[] = [
    { 
      label: '背包',
      icon: bagIcon
    },
    { 
      label: '好友',
      icon: friendIcon
    },
    { 
      label: '对战记录',
      icon: historyIcon
    },
    { 
      label: '管理员',
      icon: adminIcon,
      onClick: () => setIsAdminOpen(true),
      requiredLevel: 5
    },
    { 
      label: '设置',
      icon: settingsIcon,
      onClick: () => setIsSettingsOpen(true)
    }
  ]

  // 过滤菜单项，根据用户等级显示
  const filteredMenuItems = menuItems.filter(item => 
    !item.requiredLevel || item.requiredLevel <= userLevel
  );

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 h-24 flex items-center px-8 border-t border-gray-200 bg-white">
        <span className="text-xs text-gray-400">版本号</span>
        <div className="flex flex-1 justify-end">
          <div className="flex space-x-6">
            {filteredMenuItems.map(({ icon, label, route, onClick }) => (
              <button
                key={label}
                className="group relative w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all duration-100 ease-in-out"
                onClick={() => {
                  if (route) {
                    navigate(route);
                  } else if (onClick) {
                    onClick();
                  }
                }}
                style={{ cursor: route || onClick ? 'pointer' : 'default' }}
              >
                <img src={icon} alt={label} className="w-6 h-6" />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* 设置菜单 */}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 管理员菜单 */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 max-w-[90vw] relative">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-game mb-6">管理员面板</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-game">用户管理</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  进入
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-game">系统设置</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  进入
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-game">数据统计</span>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  进入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BottomMenu 