import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl, handleImageError } from '../utils/image/imageUtils';
import { getRoomList, joinRoom } from '../services/roomService';

interface Room {
  id: string;
  room_name: string;
  room_type: string;
  status: string;
  max_players: number;
  current_players: number;
  game_mode: string;
  game_settings: Record<string, any>;
  pass_word?: string;
  created_by: string;
  create_time: string;
  update_time: string;
  is_deleted: boolean;
  remark: string;
  room_players: any[];
}

interface RoomListResponse {
  total: number;
  items: Room[];
}

const RoomList: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFriendRooms, setShowFriendRooms] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // 获取房间列表
  const fetchRooms = async (page: number = 1, search: string = '', type: string = 'all', friendOnly: boolean = false) => {
    try {
      setIsLoading(true);
      
      const params: any = {
        page,
        page_size: pageSize
      };

      // 添加搜索关键词
      if (search.trim()) {
        params.key_word = search.trim();
      }

      // 添加好友房间过滤
      if (friendOnly) {
        params.friend_room = true;
      }

      const response = await getRoomList(params);
      setRooms(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('获取房间列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换好友房间过滤
  const handleFriendRoomsToggle = () => {
    setShowFriendRooms(!showFriendRooms);
  };

  // 搜索和过滤
  const handleSearch = () => {
    setCurrentPage(1);
    fetchRooms(1, searchTerm, filterType, showFriendRooms);
  };

  // 分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRooms(page, searchTerm, filterType, showFriendRooms);
  };

  // 加入房间
  const handleJoinRoom = async (room: Room) => {
    try {
      let pass_word: string | undefined;
      
      // 如果是私密房间，提示用户输入密码
      if (room.pass_word) {
        pass_word = prompt('请输入房间密码:') || undefined;
        if (!pass_word) return; // 用户取消输入
      }
      
      // 调用后端接口，密码验证完全由后端处理
      await joinRoom(room.id, pass_word);
      
      alert('加入房间成功');
      navigate(`/room/${room.id}`);
    } catch (error: any) {
      console.error('加入房间失败:', error);
      
      // 显示具体的错误信息
      const errorMessage = error.message || '加入房间失败';
      alert(errorMessage);
    }
  };

  // 过滤房间（客户端过滤，用于类型过滤）
  const filteredRooms = rooms.filter(room => {
    if (filterType === 'all') return true;
    return room.room_type === filterType;
  });

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    fetchRooms();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">加载中...</div>
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
        <div>房间列表</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和过滤 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索房间名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部房间</option>
                <option value="public">公开房间</option>
                <option value="private">私密房间</option>
              </select>
              <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md">
                <input
                  type="checkbox"
                  checked={showFriendRooms}
                  onChange={handleFriendRoomsToggle}
                  className="rounded"
                />
                <span className="text-sm whitespace-nowrap">好友房间</span>
              </label>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                搜索
              </button>
            </div>
          </div>
        </div>

        {/* 房间列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-3 border-b">
            <h2 className="text-base font-medium">房间列表</h2>
          </div>
          <div className="p-4">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                没有找到房间
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {/* 锁标志 */}
                      {room.pass_word && (
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      
                      {/* 房间信息 - 整合到一行 */}
                      <div className="flex items-center space-x-3 flex-1">
                        <h3 className="font-medium">{room.room_name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          room.status === 'waiting' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {room.status === 'waiting' ? '等待中' : room.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {room.current_players}/{room.max_players}
                        </span>
                        {room.remark && (
                          <span className="text-sm text-gray-400">| {room.remark}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleJoinRoom(room)}
                        disabled={room.current_players >= room.max_players}
                        className={`px-3 py-1 rounded text-xs ${
                          room.current_players >= room.max_players
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {room.current_players >= room.max_players ? '房间已满' : '加入'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`px-3 py-1 rounded ${
                    currentPage <= 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  上一页
                </button>
                
                <span className="px-3 py-1 text-sm">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage >= totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomList; 