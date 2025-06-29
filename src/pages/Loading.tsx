import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomUsers } from '../services/roomService';
import { getUserRoomStatus } from '../services/roomService';
import PlayerShape from '../components/PlayerShape';
import { error } from '../utils/notification';

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
      
      // 检查是否所有玩家都准备好了
      const allReady = response.players.every(player => player.status === 'ready');
      if (allReady && response.players.length >= 2) {
        // 如果所有玩家都准备好了，跳转到房间页面
        navigate(`/room/${roomId}`);
      }
    } catch (err) {
      console.error('获取房间用户列表失败:', err);
      error('获取房间信息失败');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, navigate]);

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
      // 设置定时器，定期检查房间状态
      const interval = setInterval(() => {
        fetchRoomUsers();
      }, 2000); // 每2秒检查一次

      return () => clearInterval(interval);
    }
  }, [roomId, fetchRoomUsers]);

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
      {/* 顶部环形加载动画 */}
      <div className="mb-12">
        <div className="relative">
          {/* 外圈 */}
          <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin">
            <div className="w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          {/* 内圈 */}
          <div className="absolute inset-2 w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}>
            <div className="w-full h-full border-4 border-transparent border-t-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          
          {/* 中心点 */}
          <div className="absolute inset-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 加载文字 */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">游戏加载中</h1>
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
      <div className="absolute top-[63%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
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