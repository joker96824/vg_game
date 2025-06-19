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