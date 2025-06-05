// API 基础 URL
export const API_BASE_URL = 'http://localhost:8000/api/v1';

// 图片服务器 URL
export const IMAGE_BASE_URL = 'http://118.25.45.131:3000/images';

// API 端点
export const API_ENDPOINTS = {
  CARDS: `${API_BASE_URL}/cards`,
  DECKS: `${API_BASE_URL}/decks`,
  AUTH: `${API_BASE_URL}/auth`,
  FRIEND: `${API_BASE_URL}/friends`,
} as const; 