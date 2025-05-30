import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg z-50 w-48">
        <div className="py-1">
          {userLevel >= 9 && (
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => {
                navigate('/admin/permissions');
                onClose();
              }}
            >
              权限配置
            </button>
          )}
          {userLevel >= 5 && (
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => {
                navigate('/admin/skills');
                onClose();
              }}
            >
              技能配置
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminMenu; 