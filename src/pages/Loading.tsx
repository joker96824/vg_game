import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomUsers } from '../services/roomService';
import { getUserRoomStatus } from '../services/roomService';
import { getDeckById } from '../services/deckService';
import PlayerShape from '../components/PlayerShape';
import { resourceLoader } from '../services/resourceLoader';
import { error } from '../utils/notification';
import { IMAGE_BASE_URL } from '../constants/api';
import { imageCache } from '../utils/image/imageCache';

interface RoomUser {
  id: string;
  room_id: string;
  user_id: string;
  player_order: number;
  status: string;
  deck_id: string | null;
  join_time: string;
  leave_time: string | null;
  remark: string;
  user_info: {
    id: string;
    nickname: string;
    avatar: string;
    level: number;
  };
  deck_info: any | null;
}

interface RoomPlayersResponse {
  room_id: string;
  room_name: string;
  total_players: number;
  max_players: number;
  players: RoomUser[];
}

const Loading: React.FC = () => {
  const navigate = useNavigate();
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  // 预加载相关状态
  const [preloadProgress, setPreloadProgress] = useState({
    total: 0,
    loaded: 0,
    failed: 0,
    currentItem: ''
  });
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);
  
  // 添加标记确保只执行一次
  const [hasStartedPreload, setHasStartedPreload] = useState(false);

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

  // 获取用户房间状态
  const fetchUserRoomStatus = useCallback(async () => {
    try {
      const status = await getUserRoomStatus();
      if (status.in_room && status.room_id) {
        setRoomId(status.room_id);
        // 如果状态不是loading，跳转到房间页面
        if (status.status !== 'loading') {
          navigate(`/room/${status.room_id}`);
          return;
        }
      } else {
        // 如果不在房间中，跳转到首页
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('获取用户房间状态失败:', error);
      navigate('/');
    }
  }, [navigate]);

  // 获取房间用户列表
  const fetchRoomUsers = useCallback(async () => {
    if (!roomId) return;
    
    try {
      const response = await getRoomUsers(roomId);
      setRoomPlayers(response);
      
      // 移除自动跳转逻辑，因为不再持续检查状态
    } catch (err) {
      console.error('获取房间用户列表失败:', err);
      error('获取房间信息失败');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // 开始资源预加载
  const startResourcePreload = useCallback(async () => {
    if (isPreloading || preloadComplete || hasStartedPreload) return;
    
    setIsPreloading(true);
    setHasStartedPreload(true);
    
    try {
      // 收集所有卡牌图片 - 只预加载当前用户的卡组，避免信息泄漏
      const allCards: Array<{ id: string; image: string }> = [];
      const playerAvatars: Array<{ id: string; image: string }> = [];
      
      if (roomPlayers?.players && currentUser) {
        // 找到当前用户的玩家信息
        const currentPlayer = roomPlayers.players.find(player => player.user_id === currentUser.id);
        
        if (currentPlayer?.deck_id) {
          try {
            // 只获取当前用户的卡组
            const currentUserDeck = await getDeckById(currentPlayer.deck_id);
            
            // 收集当前用户卡组中的卡牌图片
            currentUserDeck.deck_cards.forEach(card => {
              if (card.image && !allCards.find(c => c.id === card.id)) {
                allCards.push({ id: card.id, image: card.image });
              }
            });
            
            console.log(`预加载当前用户卡组: ${currentUserDeck.deck_name}, 包含 ${allCards.length} 张卡牌`);
          } catch (err) {
            console.error('获取当前用户卡组失败:', err);
          }
        }
        
        // 收集所有玩家的头像（头像信息是公开的）
        roomPlayers.players.forEach(player => {
          if (player.user_info.avatar && !playerAvatars.find(p => p.id === player.user_id)) {
            playerAvatars.push({ 
              id: `avatar_${player.user_id}`, 
              image: player.user_info.avatar 
            });
          }
        });
      }
      
      // 添加卡牌图片到预加载队列（使用与其他页面一致的URL格式）
      allCards.forEach(card => {
        resourceLoader.addToQueue({
          id: card.id,
          url: `${IMAGE_BASE_URL}/vg_image/${card.image}.jpg`,
          type: 'image',
          priority: 1
        });
      });
      
      // 添加头像图片到预加载队列
      playerAvatars.forEach(avatar => {
        resourceLoader.addToQueue({
          id: avatar.id,
          url: `${IMAGE_BASE_URL}/avatars/${avatar.image}`,
          type: 'image',
          priority: 2
        });
      });
      
      // 设置进度回调
      resourceLoader.onProgressCallback((progress) => {
        setPreloadProgress({
          total: progress.total,
          loaded: progress.loaded,
          failed: progress.failed,
          currentItem: progress.currentItem || ''
        });
      });
      
      // 设置完成回调
      resourceLoader.onCompleteCallback(() => {
        setPreloadComplete(true);
        setIsPreloading(false);
        console.log('资源预加载完成');
      });
      
      // 开始预加载
      await resourceLoader.startPreload();
      
    } catch (err) {
      console.error('资源预加载失败:', err);
      setIsPreloading(false);
    }
  }, [isPreloading, preloadComplete, hasStartedPreload, roomPlayers, currentUser]);

  // 初始化数据
  useEffect(() => {
    if (currentUser) {
      fetchUserRoomStatus();
    }
  }, [currentUser, fetchUserRoomStatus]);

  // 当roomId获取到后，开始获取房间用户信息
  useEffect(() => {
    if (roomId) {
      fetchRoomUsers();
    }
  }, [roomId, fetchRoomUsers]);

  // 当房间用户信息获取到后，开始资源预加载
  useEffect(() => {
    if (roomPlayers && !hasStartedPreload) {
      startResourcePreload();
    }
  }, [roomPlayers, hasStartedPreload, startResourcePreload]);

  // 获取前两位玩家信息
  const getFirstTwoPlayers = () => {
    if (!roomPlayers?.players) return [];
    
    return roomPlayers.players
      .sort((b, a) => a.player_order - b.player_order)
      .slice(0, 2);
  };

  const players = getFirstTwoPlayers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* 顶部环形进度条 */}
      <div className="mb-12">
        <div className="relative">
          {/* 外圈进度条 */}
          <div className="w-24 h-24 relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* 背景圆环 */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* 进度圆环 */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (preloadProgress.loaded / Math.max(preloadProgress.total, 1)))}`}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            
            {/* 中心进度文字 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {Math.round((preloadProgress.loaded / Math.max(preloadProgress.total, 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-500">loading</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 玩家信息展示 */}
      <div className="flex items-center justify-center space-x-8 mb-8 relative">
        {players.map((player, index) => (
          <div key={player.id} className="text-center">
            <PlayerShape
              avatar={player.user_info.avatar}
              nickname={player.user_info.nickname}
              size={260}
              className="mb-4"
              isCurrentUser={player.user_id === currentUser?.id}
            />
          </div>
        ))}
      </div>
      
      {/* VS 图片 - 独立在最上层，位于两个SVG正中间 */}
      <div className="absolute top-[56%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="relative">
          {/* 外圈装饰 */}
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            {/* 内圈 */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              {/* VS 文字 */}
              <span className="text-lg font-bold text-gray-800">VS</span>
            </div>
          </div>
          {/* 装饰性光点 */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading; 