import { createAuthenticatedRequest } from '../utils/request';
import { API_ENDPOINTS } from '../constants/api';

// 匹配相关类型定义
export interface MatchedUser {
  id: string;
  nickname: string;
  avatar: string;
}

export interface MatchStatus {
  in_queue: boolean;
  queue_size: number;
  position: number;
  estimated_wait_time: number;
}

export interface JoinMatchResponse {
  match_id: string;
  room_id: string | null;
  matched_users: MatchedUser[];
}

export interface ConfirmMatchRequest {
  match_id: string;
  confirm: boolean;
}

export interface ConfirmMatchResponse {
  room_id: string;
  room_name: string;
}

// WebSocket消息类型
export interface MatchConfirmationMessage {
  type: 'match_confirmation';
  data: {
    match_id: string;
    matched_users: MatchedUser[];
  };
  timestamp: string;
}

export interface MatchSuccessMessage {
  type: 'match_success';
  data: {
    room_id: string;
    room_name: string;
    matched_users: MatchedUser[];
  };
  timestamp: string;
}

/**
 * 获取匹配状态
 * @returns Promise<MatchStatus>
 */
export const getMatchStatus = async (): Promise<MatchStatus> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.MATCH}/status`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取匹配状态失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('获取匹配状态失败:', error);
    throw error;
  }
};

/**
 * 加入匹配队列
 * @returns Promise<JoinMatchResponse>
 */
export const joinMatch = async (): Promise<JoinMatchResponse> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.MATCH}/join`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '加入匹配失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('加入匹配失败:', error);
    throw error;
  }
};

/**
 * 确认或拒绝匹配
 * @param matchId 匹配ID
 * @param confirm 是否确认 (true=确认, false=拒绝)
 * @returns Promise<ConfirmMatchResponse>
 */
export const confirmMatch = async (matchId: string, confirm: boolean): Promise<ConfirmMatchResponse> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.MATCH}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        match_id: matchId,
        confirm: confirm,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '匹配确认失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('匹配确认失败:', error);
    throw error;
  }
};

/**
 * 退出匹配队列
 * @returns Promise<void>
 */
export const leaveMatch = async (): Promise<void> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.MATCH}/leave`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '退出匹配失败');
    }
  } catch (error) {
    console.error('退出匹配失败:', error);
    throw error;
  }
}; 