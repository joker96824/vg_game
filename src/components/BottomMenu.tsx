import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import bagIcon from '../assets/bag.svg'
import friendIcon from '../assets/friend.svg'
import historyIcon from '../assets/history.svg'
import adminIcon from '../assets/admin.svg'
import settingsIcon from '../assets/settings.svg'
import SettingsMenu from './SettingsMenu'
import AdminMenu from './AdminMenu'
import FriendMenu from './FriendMenu'
import { APP_VERSION } from '../constants/version'

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
  const [isFriendOpen, setIsFriendOpen] = useState(false);
  const [userLevel, setUserLevel] = useState<number>(0);
  const [friendButtonPosition, setFriendButtonPosition] = useState<{ left: number; bottom: number } | null>(null);
  const friendButtonRef = useRef<HTMLButtonElement>(null);

  // 从 localStorage 获取用户信息
  React.useEffect(() => {
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
      icon: friendIcon,
      onClick: () => {
        if (friendButtonRef.current) {
          const rect = friendButtonRef.current.getBoundingClientRect();
          setFriendButtonPosition({
            left: rect.left,
            bottom: window.innerHeight - rect.top
          });
        }
        setIsFriendOpen(true);
      }
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
      <div className="h-20 flex items-center px-8 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-600">v{APP_VERSION}</span>
        </div>
        <div className="flex flex-1 justify-end">
          <div className="flex space-x-6">
            {filteredMenuItems.map(({ icon, label, route, onClick }) => (
              <button
                key={label}
                ref={label === '好友' ? friendButtonRef : undefined}
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
      </div>

      {/* 设置菜单 */}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 管理员菜单 */}
      <AdminMenu
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* 好友菜单 */}
      <FriendMenu
        isOpen={isFriendOpen}
        onClose={() => setIsFriendOpen(false)}
        position={friendButtonPosition}
      />
    </>
  )
}

export default BottomMenu 