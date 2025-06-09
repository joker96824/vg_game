import { API_ENDPOINTS } from '../constants/api';
import { createAuthenticatedRequest } from '../utils/request';

export const getFriends = async () => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.FRIEND}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || '获取好友列表失败');
  }
  
  return data;
};

export const getFriendRequests = async () => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.FRIEND}/requests`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || '获取好友请求失败');
  }
  
  return data;
};

export const acceptFriendRequest = async (requestId: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.FRIEND}/requests/accept`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || '接受好友请求失败');
  }
  
  return data;
};

export const rejectFriendRequest = async (requestId: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.FRIEND}/requests/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || '拒绝好友请求失败');
  }
  
  return data;
};

export const sendFriendRequest = async (receiverId: number, message: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.FRIEND}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receiver_id: receiverId,
      message
    })
  });
  
  const data = await response.json();
  console.log(data);
  
  if (!response.ok) {
    throw new Error(data.detail || '发送好友请求失败');
  }
  
  return data;
};

export const deleteFriend = async (friendId: number) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.FRIEND}/${friendId}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || '删除好友失败');
  }
  
  return data;
};

