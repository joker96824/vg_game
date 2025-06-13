import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, updateNickname, updateAvatar, resetPassword, resetPasswordByEmail, uploadAvatar } from '../services/authService';
import { IMAGE_BASE_URL } from '../constants/api';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  
  // 个人信息状态
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 修改密码状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 头像上传状态
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // 从 localStorage 获取用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setNickname(user.nickname || '');
      // 优先使用临时 blob URL，如果不存在则使用服务器头像
      const tempAvatarUrl = localStorage.getItem('tempAvatarUrl');
      setPreviewUrl(tempAvatarUrl || (user.avatar ? `${IMAGE_BASE_URL}/avatars/${user.avatar}` : null));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // 清除临时头像 URL
      localStorage.removeItem('tempAvatarUrl');
      onClose(); // 关闭菜单
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
      // 重新加载页面以更新显示
      window.location.reload();
    } catch (error: any) {
      setError(error.message || '修改昵称失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理密码修改
  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setIsPasswordLoading(true);
    setPasswordError('');

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('未找到用户信息');
      }
      const user = JSON.parse(userStr);
      
      await resetPasswordByEmail(user.email, oldPassword, newPassword);
      setShowPassword(false);
      // 清空密码字段
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message || '修改密码失败');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileSelect 被调用');
    const file = event.target.files?.[0];
    console.log('选择的文件:', file);
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        console.log('文件类型检查失败:', file.type);
        setToastMessage({ type: 'error', message: '请选择图片文件' });
        return;
      }
      // 检查文件大小（限制为2MB）
      if (file.size > 2 * 1024 * 1024) {
        console.log('文件大小检查失败:', file.size);
        setToastMessage({ type: 'error', message: '图片大小不能超过2MB' });
        return;
      }
      // 创建预览URL
      const url = URL.createObjectURL(file);
      console.log('创建的预览URL:', url);
      setPreviewUrl(url);
      // 保存临时 blob URL 到 localStorage
      localStorage.setItem('tempAvatarUrl', url);
      console.log('保存临时头像URL到localStorage:', url);
    }
  };

  const handleUpload = async () => {
    console.log('handleUpload 被调用');
    const file = fileInputRef.current?.files?.[0];
    console.log('准备上传的文件:', file);
    if (!file) {
      setToastMessage({ type: 'error', message: '请先选择图片' });
      return;
    }

    setIsUploading(true);
    try {
      console.log('开始上传头像');
      const response = await uploadAvatar(file);
      console.log('上传响应:', response);
      setToastMessage({ type: 'success', message: '头像上传成功' });
      // 更新本地存储中的用户信息
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // 使用服务器返回的文件名
        user.avatar = response.data.filename;
        localStorage.setItem('user', JSON.stringify(user));
        // 保持 blob URL 不变
        // 触发头像更新事件，传递 blob URL
        const tempAvatarUrl = localStorage.getItem('tempAvatarUrl');
        window.dispatchEvent(new CustomEvent('avatarUpdated', {
          detail: { avatarUrl: tempAvatarUrl }
        }));
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowAvatar(false);
    } catch (error) {
      console.error('上传头像失败:', error);
      setToastMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '上传头像失败'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 自动关闭提示消息
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
            onClick={() => setShowAvatar(true)}
          >
            更换头像
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
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入原密码"
                  disabled={isPasswordLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请输入新密码"
                  disabled={isPasswordLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="请再次输入新密码"
                  disabled={isPasswordLoading}
                />
              </div>
              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => {
                    setShowPassword(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  disabled={isPasswordLoading}
                >
                  取消
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  onClick={handleUpdatePassword}
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? '修改中...' : '确认修改'}
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

      {/* 头像上传弹窗 */}
      {showAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">更换头像</h2>
            <div className="space-y-4">
              {/* 头像预览 */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="头像预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">暂无头像</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 文件选择和上传按钮 */}
              <div className="flex flex-col items-center space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  选择图片
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!previewUrl || isUploading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                >
                  {isUploading ? '上传中...' : '上传头像'}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowAvatar(false);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提示消息 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60]">
          <div className={`px-4 py-2 rounded-lg shadow-lg ${
            toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {toastMessage.message}
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsMenu; 