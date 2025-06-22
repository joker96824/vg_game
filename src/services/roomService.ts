import { API_ENDPOINTS } from '../constants/api';
import { createAuthenticatedRequest } from '../utils/request';

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
}

interface RoomInfo {
  room_name: string;
  room_type?: string;
  game_settings?: Record<string, any>;
  pass_word?: string;
  remark?: string;
}

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

interface RoomDetail {
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

interface UserRoomStatus {
  in_room: boolean;
  room_id: string | null;
  room_name: string | null;
  player_order: number | null;
  status: string | null;
  join_time: string | null;
}

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

interface RoomListParams {
  key_word?: string;
  friend_room?: boolean;
  page?: number;
  page_size?: number;
}

interface RoomListResponse {
  total: number;
  items: Room[];
}

// 创建房间
export const createRoom = async (roomInfo: RoomInfo) => {
  try {
    const response = await createAuthenticatedRequest(API_ENDPOINTS.ROOMS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roomInfo)
    });

    const data: ApiResponse<any> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '创建房间失败');
    }

    return data.data;
  } catch (error) {
    console.error('创建房间失败:', error);
    throw error;
  }
};

// 获取房间信息
export const getRoomInfo = async (roomId: string): Promise<RoomDetail> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.ROOMS}/${roomId}`);
    const data: ApiResponse<RoomDetail> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取房间信息失败');
    }

    return data.data!;
  } catch (error) {
    console.error('获取房间信息失败:', error);
    throw error;
  }
};

// 获取房间用户列表
export const getRoomUsers = async (roomId: string): Promise<RoomPlayersResponse> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.ROOMS}/${roomId}/players`);
    const data: ApiResponse<RoomPlayersResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取房间用户列表失败');
    }

    return data.data!;
  } catch (error) {
    console.error('获取房间用户列表失败:', error);
    throw error;
  }
};

// 获取用户房间状态
export const getUserRoomStatus = async (): Promise<UserRoomStatus> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.ROOMS}/my-status`);
    const data: ApiResponse<UserRoomStatus> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取用户房间状态失败');
    }

    return data.data!;
  } catch (error) {
    console.error('获取用户房间状态失败:', error);
    throw error;
  }
};

// 获取房间列表
export const getRoomList = async (params?: RoomListParams): Promise<RoomListResponse> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params?.key_word) {
      queryParams.append('key_word', params.key_word);
    }
    if (params?.friend_room !== undefined) {
      queryParams.append('friend_room', params.friend_room.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }

    const url = queryParams.toString() ? `${API_ENDPOINTS.ROOMS}?${queryParams.toString()}` : API_ENDPOINTS.ROOMS;
    const response = await createAuthenticatedRequest(url);
    const data: ApiResponse<RoomListResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取房间列表失败');
    }

    return data.data!;
  } catch (error) {
    console.error('获取房间列表失败:', error);
    throw error;
  }
};

// 加入房间
export const joinRoom = async (roomId: string, pass_word?: string): Promise<void> => {
  try {
    const body: any = {};
    if (pass_word) {
      body.pass_word = pass_word;
    }

    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.ROOMS}/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '加入房间失败');
    }
  } catch (error) {
    console.error('加入房间失败:', error);
    throw error;
  }
};

// 解散房间
export const dissolveRoom = async (roomId: string): Promise<void> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.ROOMS}/${roomId}`, {
      method: 'DELETE'
    });

    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '解散房间失败');
    }
  } catch (error) {
    console.error('解散房间失败:', error);
    throw error;
  }
};

// 准备/取消准备
export const toggleReady = async (roomId: string): Promise<void> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.ROOMS}/${roomId}/ready`, {
      method: 'POST'
    });

    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '切换准备状态失败');
    }
  } catch (error) {
    console.error('切换准备状态失败:', error);
    throw error;
  }
};

// 开始游戏
export const startGame = async (roomId: string): Promise<void> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.ROOMS}/${roomId}/start`, {
      method: 'POST'
    });

    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '开始游戏失败');
    }
  } catch (error) {
    console.error('开始游戏失败:', error);
    throw error;
  }
}; 