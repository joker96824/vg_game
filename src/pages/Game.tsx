import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);

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

  // 获取从Loading页面传递的游戏状态消息
  useEffect(() => {
    const gameStateMessage = location.state?.gameStateMessage;
    if (gameStateMessage) {
      console.log('接收到游戏状态消息:', gameStateMessage);
      setGameState(gameStateMessage);
    } else {
      console.warn('未接收到游戏状态消息，可能需要重新进入游戏');
      // 如果没有接收到游戏状态消息，可以选择跳转回首页或显示错误信息
      // navigate('/');
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">游戏进行中</h1>
        <p className="text-gray-600 mb-8">游戏页面开发中...</p>
        
        {/* 显示游戏状态信息 */}
        {gameState && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">游戏状态信息</h2>
            <pre className="text-sm text-gray-600 text-left overflow-auto max-h-40">
              {JSON.stringify(gameState, null, 2)}
            </pre>
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