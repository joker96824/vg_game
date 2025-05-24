import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, updateNickname, updateAvatar } from '../services/authService';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // 个人信息状态
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 从 localStorage 获取用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setNickname(user.nickname || '');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 处理昵称修改
  const handleUpdateNickname = async () => {
    if (!nickname.trim()) {
      setError('昵称不能为空');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await updateNickname(nickname);
      // 更新本地存储的用户信息
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.nickname = response.data.nickname;
        localStorage.setItem('user', JSON.stringify(user));
      }
      setShowProfile(false);
    } catch (error: any) {
      setError(error.message || '修改昵称失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg z-50 w-48">
        <div className="py-1">
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => setShowProfile(true)}
          >
            个人信息
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => setShowPassword(true)}
          >
            修改密码
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => setShowAbout(true)}
          >
            关于
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
            onClick={handleLogout}
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 个人信息弹窗 */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">个人信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入昵称"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setShowProfile(false)}
                  disabled={isLoading}
                >
                  取消
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  onClick={handleUpdateNickname}
                  disabled={isLoading}
                >
                  {isLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {showPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">修改密码</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">原密码</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入原密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">新密码</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入新密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">确认新密码</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请再次输入新密码"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => setShowPassword(false)}
                >
                  取消
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  确认修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 关于弹窗 */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">关于</h2>
            <div className="space-y-4">
              <div className="text-gray-600">
                <p>版本：1.0.0</p>
                <p>开发者：Your Name</p>
                <p>联系方式：your.email@example.com</p>
                {/* 预留更多文本位置 */}
              </div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setShowAbout(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsMenu; 