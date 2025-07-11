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
    return data.data;
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

// 选择猜拳数字
export const selectCoinNumber = async (choice: number) => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.BATTLES}/coin/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        choice: choice
      }),
    });

    if (!response.ok) {
      throw new Error('选择猜拳数字失败');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('选择猜拳数字失败:', error);
    throw error;
  }
};

// 选择先后攻
export const selectFirstPlayer = async (first: boolean) => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.BATTLES}/coin/first_player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first: first
      }),
    });

    if (!response.ok) {
      throw new Error('选择先后攻失败');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('选择先后攻失败:', error);
    throw error;
  }
}; 