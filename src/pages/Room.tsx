import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvatarUrl, handleImageError } from '../utils/image/imageUtils';
import { websocketManager } from '../services/websocketManager';
import { WebSocketMessage } from '../services/websocketService';
import { getRoomInfo, getRoomUsers, dissolveRoom, toggleReady, startGame, kickPlayer, leaveRoom, updatePlayerStatus } from '../services/roomService';
import { getDecks, setDeckPreset } from '../services/deckService';
import { Deck } from '../types/deck';
import { getCardImageUrl, handleCardImageError } from '../utils/image/imageUtils';
import { success, error, confirm, alert } from '../utils/notification';

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
  
  // 卡组相关状态
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [isDeckLoading, setIsDeckLoading] = useState(false);

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

  // 获取卡组列表
  const fetchDecks = useCallback(async () => {
    try {
      setIsDeckLoading(true);
      const decksList = await getDecks(true); // 只获取合格卡组
      
      // 将 preset=0 的卡组排在最前面
      const sortedDecks = decksList.sort((a, b) => {
        if (a.preset === 0) return -1;
        if (b.preset === 0) return 1;
        return 0;
      });
      
      setDecks(sortedDecks);
      
      // 如果有卡组，默认选择第一个有效的卡组
      if (sortedDecks.length > 0) {
        const validDeckIndex = sortedDecks.findIndex(deck => deck.is_valid);
        if (validDeckIndex !== -1) {
          setSelectedDeckIndex(validDeckIndex);
          setSelectedDeck(sortedDecks[validDeckIndex]);
        }
      }
    } catch (error) {
      console.error('获取卡组列表失败:', error);
    } finally {
      setIsDeckLoading(false);
    }
  }, []);

  // 处理卡组点击
  const handleDeckClick = useCallback((index: number) => {
    if (isHost) return; // 房主不能选择卡组
    
    const currentPlayer = roomPlayers?.players.find(p => p.user_id === currentUser?.id);
    if (currentPlayer?.status === 'ready') {
      error('请取消准备后再切换卡组');
      return; // 准备后不能切换卡组
    }
    
    setSelectedDeckIndex(index);
    setSelectedDeck(decks[index]);
  }, [isHost, roomPlayers, currentUser, decks]);

  // 处理选中卡组点击
  const handleSelectedDeckClick = useCallback(() => {
    if (isHost) return; // 房主不能选择卡组
    
    const currentPlayer = roomPlayers?.players.find(p => p.user_id === currentUser?.id);
    if (currentPlayer?.status === 'ready') {
      error('请取消准备后再切换卡组');
      return; // 准备后不能切换卡组
    }
    
    // 可以在这里添加卡组详情查看功能
    console.log('查看卡组详情:', selectedDeck);
  }, [isHost, roomPlayers, currentUser, selectedDeck]);

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
      fetchDecks();
    }
  }, [currentUser, fetchRoomInfo, fetchRoomUsers, fetchDecks]);

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
        alert('房间状态', '房间已被解散');
        navigate('/');
        break;
      case 'room_kicked':
        // 被踢出房间
        alert('房间状态', '您已被踢出房间');
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
    
    const confirmed = await confirm('解散房间', '确定要解散房间吗？', { type: 'danger' });
    if (!confirmed) return;
    
    try {
      await dissolveRoom(roomId);
      success('房间已解散');
      navigate('/');
    } catch (err) {
      console.error('解散房间失败:', err);
      error('解散房间失败');
    }
  };

  // 设置房间
  const handleRoomSettings = () => {
    // TODO: 实现房间设置功能
    alert('功能提示', '房间设置功能待实现');
  };

  // 准备/取消准备
  const handleToggleReady = async () => {
    if (!roomId) return;
    
    try {
      // 获取当前用户的准备状态
      const currentPlayer = roomPlayers?.players.find(p => p.user_id === currentUser?.id);
      const currentStatus = currentPlayer?.status || 'waiting';
      const newStatus = currentStatus === 'ready' ? 'waiting' : 'ready';
      
      // 如果是准备状态，设置卡组预设
      if (newStatus === 'ready' && selectedDeck) {
        try {
          await setDeckPreset(selectedDeck.id, 0);
          console.log('设置准备卡组成功');
        } catch (err) {
          console.error('设置准备卡组失败:', err);
        }
      }
      
      await updatePlayerStatus(roomId, newStatus);
      // 重新获取用户列表以更新准备状态
      fetchRoomUsers();
    } catch (err) {
      console.error('切换准备状态失败:', err);
      error('切换准备状态失败');
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    if (!isHost || !roomId) return;
    
    try {
      // 设置房主的卡组预设
      if (selectedDeck) {
        try {
          await setDeckPreset(selectedDeck.id, 0);
          console.log('设置房主卡组成功');
        } catch (err) {
          console.error('设置房主卡组失败:', err);
        }
      }
      
      await startGame(roomId);
      success('游戏开始');
      // TODO: 跳转到游戏页面
    } catch (err) {
      console.error('开始游戏失败:', err);
      error('开始游戏失败');
    }
  };

  // 踢出玩家
  const handleKickPlayer = async (targetUserId: string, targetUserName: string) => {
    if (!isHost || !roomId) return;
    
    const confirmed = await confirm('踢出玩家', `确定要踢出玩家 "${targetUserName}" 吗？`, { type: 'danger' });
    if (!confirmed) return;
    
    try {
      await kickPlayer(roomId, targetUserId);
      success(`已踢出玩家 "${targetUserName}"`);
      // 重新获取用户列表以更新显示
      fetchRoomUsers();
    } catch (error: any) {
      console.error('踢出玩家失败:', error);
      const errorMessage = error.message || '踢出玩家失败';
      error(errorMessage);
    }
  };

  // 退出房间
  const handleLeaveRoom = async () => {
    if (!roomId) return;
    
    const confirmed = await confirm('退出房间', '确定要退出房间吗？', { type: 'warning' });
    if (!confirmed) return;
    
    try {
      await leaveRoom(roomId);
      success('已退出房间');
      navigate('/');
    } catch (error: any) {
      console.error('退出房间失败:', error);
      const errorMessage = error.message || '退出房间失败';
      error(errorMessage);
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
          {isHost ? (
            // 房主按钮
            <>
              <button
                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                onClick={handleRoomSettings}
              >
                设置
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                onClick={handleDissolveRoom}
              >
                解散房间
              </button>
            </>
          ) : (
            // 普通用户按钮
            <button
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              onClick={handleLeaveRoom}
            >
              退出房间
            </button>
          )}
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
                      {player.player_order !== 1 && player.status === 'ready' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{player.user_info.nickname}</p>
                      {player.player_order !== 1 && (
                        <p className="text-sm text-gray-500">
                          {player.status === 'ready' ? '已准备' : '未准备'}
                        </p>
                      )}
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

        {/* 卡组展示区域 - 只有非房主时显示 */}
        {!isHost && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">选择卡组</h3>
            </div>
            
            <div className="h-[300px] flex flex-col">
              {/* 选中卡组展示区域 - 80%高度 */}
              <div className="h-[80%] mb-4">
                {decks.length > 0 && decks[selectedDeckIndex] ? (
                  <div 
                    className="w-full h-full border-2 border-blue-500 rounded-2xl overflow-hidden cursor-pointer"
                    onClick={handleSelectedDeckClick}
                  >
                    <div className="w-full h-full relative flex">
                      {/* 卡组图片展示 */}
                      <div className="absolute inset-0 flex">
                        {decks[selectedDeckIndex].deck_cards
                          .filter(card => card.deck_zone === 'ride')
                          .slice(0, 4)
                          .map((card, index) => (
                            <div 
                              key={index} 
                              className="flex-1 relative"
                            >
                              <img 
                                src={getCardImageUrl(card.image)}
                                alt={decks[selectedDeckIndex].deck_name}
                                className="w-full h-full object-cover"
                                onError={handleCardImageError}
                              />
                            </div>
                          ))}
                      </div>
                      {/* 卡组名称 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-center px-2 py-1 text-sm">
                        {decks[selectedDeckIndex].deck_name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400">
                    <span className="text-xl">暂无卡组</span>
                  </div>
                )}
              </div>

              {/* 卡组列表区域 - 20%高度 */}
              <div className="h-[20%] overflow-x-auto">
                <div className="flex gap-3 h-full pb-2 px-2">
                  {decks.map((deck, index) => {
                    const isSelected = index === selectedDeckIndex;
                    const rideCards = deck.deck_cards.filter(card => card.deck_zone === 'ride').slice(0, 4);
                    
                    return (
                      <div
                        key={deck.id}
                        className={`shrink-0 transition-all duration-300 h-full w-[calc(25%-12px)] min-w-[200px] cursor-pointer`}
                        onClick={() => handleDeckClick(index)}
                      >
                        <div className={`h-full relative border rounded-2xl overflow-hidden ${
                          isSelected ? 'border-blue-500 border-2 scale-100' : 'border-gray-200 scale-90'
                        } transition-all duration-300`}>
                          <div className="absolute inset-0 flex">
                            {rideCards.map((card, cardIndex) => (
                              <div key={cardIndex} className="flex-1 relative">
                                <img 
                                  src={getCardImageUrl(card.image)}
                                  alt={deck.deck_name}
                                  className="w-full h-full object-cover"
                                  onError={handleCardImageError}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-center px-2 py-1 text-sm">
                            {deck.deck_name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 右下角固定按钮 */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {/* 准备/开始对局按钮 */}
          {isHost ? (
            // 房主显示开始对局按钮
            <button
              onClick={handleStartGame}
              disabled={!roomPlayers?.players || roomPlayers.players.length <= 1 || roomPlayers.players.filter(p => p.player_order !== 1).some(p => p.status !== 'ready')}
              className={`px-6 py-3 rounded-lg text-white shadow-lg ${
                !roomPlayers?.players || roomPlayers.players.length <= 1 || roomPlayers.players.filter(p => p.player_order !== 1).some(p => p.status !== 'ready')
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              开始对局
            </button>
          ) : (
            // 普通用户显示准备按钮
            <button
              onClick={handleToggleReady}
              disabled={decks.length === 0}
              className={`px-6 py-3 rounded-lg text-white shadow-lg ${
                decks.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : roomPlayers?.players.find(p => p.user_id === currentUser?.id)?.status === 'ready'
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {decks.length === 0 
                ? '无可用卡组' 
                : roomPlayers?.players.find(p => p.user_id === currentUser?.id)?.status === 'ready' 
                  ? '取消准备' 
                  : '准备'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Room; 