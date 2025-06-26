import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUserLevel } from '../../services/authService';
import { success, error } from '../../utils/notification';
import Toast from '../../components/Toast';

interface User {
  id: string;
  nickname: string;
  email: string;
  level: number;
}

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (level: number) => void;
  currentLevel: number;
}

const LevelModal: React.FC<LevelModalProps> = ({ isOpen, onClose, onConfirm, currentLevel }) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 w-80">
        <h3 className="text-lg font-medium mb-4">修改用户等级</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择等级 (1-8)
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(selectedLevel)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            确定
          </button>
        </div>
      </div>
    </>
  );
};

const Permissions: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // 检查用户权限
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.level < 9) {
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      navigate('/login');
      return;
    }

    // 获取用户列表
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getUsers();
        setUsers(data.items);
        setError(null);
      } catch (error) {
        console.error('获取用户列表失败:', error);
        setError('获取用户列表失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleUpdateLevel = async (newLevel: number) => {
    if (!selectedUser) return;

    try {
      await updateUserLevel(selectedUser.id, newLevel);
      // 更新本地用户列表
      setUsers(users.map((user) => 
        user.id === selectedUser.id ? { ...user, level: newLevel } : user
      ));
      setIsModalOpen(false);
      success('用户等级修改成功');
    } catch (error: any) {
      console.error('修改用户等级失败:', error);
      error('修改用户等级失败');
      setToastMessage(error.message || '修改用户等级失败');
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-6">
          <button
            onClick={() => navigate('/')}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-center">权限配置</h1>
        </div>
        
        {isLoading ? (
          <div className="text-center text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    昵称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    等级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.nickname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.level < 9 ? (
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                        >
                          修改等级
                        </button>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed">不可修改</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleUpdateLevel}
        currentLevel={selectedUser?.level || 1}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default Permissions; 