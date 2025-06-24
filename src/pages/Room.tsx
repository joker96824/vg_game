import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvatarUrl, handleImageError } from '../utils/image/imageUtils';
import { websocketManager } from '../services/websocketManager';
import { WebSocketMessage } from '../services/websocketService';
import { getRoomInfo, getRoomUsers, dissolveRoom, toggleReady, startGame, kickPlayer } from '../services/roomService';

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

interface RoomInfo {
  id: string;
  room_name: string;
  room_type: string;
  game_settings: Record<string, any>;
  pass_word?: string;
  remark?: string;
  host_id: string;
  status: string;
  create_time: string;
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);

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

  // 获取房间信息
  const fetchRoomInfo = useCallback(async () => {
    if (!roomId) return;
    
    try {
      const response = await getRoomInfo(roomId);
      setRoomInfo(response);
    } catch (error) {
      console.error('获取房间信息失败:', error);
      // 如果房间不存在，跳转回首页
      navigate('/');
    }
  }, [roomId, navigate]);

  // 获取房间用户列表
  const fetchRoomUsers = useCallback(async () => {
    if (!roomId) return;
    
    try {
      const response = await getRoomUsers(roomId);
      setRoomPlayers(response);
    } catch (error) {
      console.error('获取房间用户列表失败:', error);
      setRoomPlayers(null);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // 检查是否为房主
  useEffect(() => {
    if (roomPlayers && currentUser) {
      // 从 players 数组中找到 player_order 为 1 的用户作为房主
      const hostPlayer = roomPlayers.players.find(player => player.player_order === 1);
      const hostId = hostPlayer?.user_id;
      const isUserHost = hostId === currentUser.id;
      setIsHost(isUserHost);
    }
  }, [roomPlayers, currentUser]);

  // 初始化数据
  useEffect(() => {
    if (currentUser) {
      fetchRoomInfo();
      fetchRoomUsers();
    }
  }, [currentUser, fetchRoomInfo, fetchRoomUsers]);

  // WebSocket 消息处理
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'room_user_update':
        // 房间用户更新，重新获取用户列表
        fetchRoomUsers();
        console.log('房间用户更新', message);
        break;
      case 'room_info_update':
        // 房间信息更新，重新获取房间信息
        fetchRoomInfo();
        console.log('房间信息更新', message);
        break;
      case 'room_dissolved':
        // 房间被解散
        alert('房间已被解散');
        navigate('/');
        break;
      case 'room_kicked':
        // 被踢出房间
        alert('您已被踢出房间');
        navigate('/');
        break;
      default:
        break;
    }
  }, [fetchRoomUsers, fetchRoomInfo, navigate]);

  // 设置 WebSocket 监听
  useEffect(() => {
    websocketManager.addMessageListener(handleWebSocketMessage);
    
    return () => {
      websocketManager.removeMessageListener(handleWebSocketMessage);
    };
  }, [handleWebSocketMessage]);

  // 解散房间
  const handleDissolveRoom = async () => {
    if (!isHost || !roomId) return;
    
    if (!confirm('确定要解散房间吗？')) return;
    
    try {
      await dissolveRoom(roomId);
      alert('房间已解散');
      navigate('/');
    } catch (error) {
      console.error('解散房间失败:', error);
      alert('解散房间失败');
    }
  };

  // 设置房间
  const handleRoomSettings = () => {
    // TODO: 实现房间设置功能
    alert('房间设置功能待实现');
  };

  // 准备/取消准备
  const handleToggleReady = async () => {
    if (!roomId) return;
    
    try {
      await toggleReady(roomId);
      // 重新获取用户列表以更新准备状态
      fetchRoomUsers();
    } catch (error) {
      console.error('切换准备状态失败:', error);
      alert('切换准备状态失败');
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    if (!isHost || !roomId) return;
    
    try {
      await startGame(roomId);
      alert('游戏开始');
      // TODO: 跳转到游戏页面
    } catch (error) {
      console.error('开始游戏失败:', error);
      alert('开始游戏失败');
    }
  };

  // 踢出玩家
  const handleKickPlayer = async (targetUserId: string, targetUserName: string) => {
    if (!isHost || !roomId) return;
    
    if (!confirm(`确定要踢出玩家 "${targetUserName}" 吗？`)) return;
    
    try {
      await kickPlayer(roomId, targetUserId);
      alert(`已踢出玩家 "${targetUserName}"`);
      // 重新获取用户列表以更新显示
      fetchRoomUsers();
    } catch (error: any) {
      console.error('踢出玩家失败:', error);
      const errorMessage = error.message || '踢出玩家失败';
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">房间不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部栏 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center relative bg-white">
        <button
          className="absolute left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
          onClick={() => navigate('/')}
        >
          返回
        </button>
        <div>{roomInfo.room_name}</div>
        
        <div className="absolute right-4 flex gap-2">
          {isHost && (
            <button
              className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              onClick={handleRoomSettings}
            >
              设置
            </button>
          )}
          {isHost && (
            <button
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              onClick={handleDissolveRoom}
            >
              解散房间
            </button>
          )}
          <button
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            onClick={handleStartGame}
          >
            开始对局
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">
              房间成员 ({roomPlayers?.total_players || 0}/{roomPlayers?.max_players || 0})
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {roomPlayers?.players && roomPlayers.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={getAvatarUrl(player.user_info.avatar)}
                        alt={player.user_info.nickname}
                        className="w-10 h-10 rounded-full"
                        onError={handleImageError}
                      />
                      {player.player_order === 1 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">主</span>
                        </div>
                      )}
                      {player.status === 'ready' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{player.user_info.nickname}</p>
                      <p className="text-sm text-gray-500">
                        {player.status === 'ready' ? '已准备' : '未准备'}
                      </p>
                    </div>
                  </div>
                  
                  {/* 如果是房主且不是自己，显示踢出按钮 */}
                  {isHost && player.user_id !== currentUser?.id && (
                    <button
                      onClick={() => handleKickPlayer(player.user_id, player.user_info.nickname)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      踢出
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleToggleReady}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              准备
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room; 