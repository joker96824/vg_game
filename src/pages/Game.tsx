import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBattleState } from '../services/battleService';
import { error } from '../utils/notification';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [battleState, setBattleState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取当前用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // 获取battle状态
  useEffect(() => {
    const fetchBattleState = async () => {
      try {
        console.log('获取battle状态');
        const state = await getBattleState();
        setBattleState(state);
        console.log('battle状态:', state);
        
      } catch (err) {
        console.error('获取battle状态失败:', err);
        error('获取battle状态失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchBattleState();
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">游戏进行中</h1>
        
        {/* 显示battle状态信息 */}
        {battleState ? (
          <>
            <p className="text-gray-600 mb-8">游戏页面开发中...</p>
            <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Battle状态</h2>
              <pre className="text-sm text-gray-600 text-left overflow-auto max-h-40">
                {JSON.stringify(battleState, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <div className="mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">正在获取游戏状态...</p>
          </div>
        )}
        
        {/* 临时返回按钮 */}
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
};

export default Game; 