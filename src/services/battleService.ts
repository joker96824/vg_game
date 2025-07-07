import { API_ENDPOINTS } from '../constants/api';
import { createAuthenticatedRequest } from '../utils/request';

// 获取battle状态
export const getBattleState = async () => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.BATTLES}/current/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('获取battle状态失败');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取battle状态失败:', error);
    throw error;
  }
};

// 投降
export const surrender = async () => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.BATTLES}/surrender`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('投降失败');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('投降失败:', error);
    throw error;
  }
}; 