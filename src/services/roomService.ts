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
  password?: string;
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
  password?: string;
  remark?: string;
  host_id: string;
  status: string;
  create_time: string;
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