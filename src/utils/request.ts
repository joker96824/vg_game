import { getToken, isTokenExpired, shouldRefreshToken, refreshToken, removeToken } from '../services/authService';

// 请求拦截器
const requestInterceptor = (config: RequestInit): RequestInit => {
  const token = getToken();
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      }
    };
  }
  return config;
};

// 响应拦截器
const responseInterceptor = async (response: Response): Promise<Response> => {
  if (response.status === 401) {
    removeToken();
    throw new Error('登录已过期，请重新登录');
  }
  return response;
};

/**
 * 创建带有认证信息的请求
 * @param url 请求URL
 * @param options 请求选项
 * @returns Promise<Response>
 */
export const createAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = getToken();
  
  // 如果没有 token，直接返回未认证错误
  if (!token) {
    throw new Error('未登录');
  }

  // 首先检查 token 是否已过期
  if (isTokenExpired(token)) {
    removeToken();
    throw new Error('登录已过期，请重新登录');
  }

  // 如果 token 未过期，检查是否需要刷新
  if (shouldRefreshToken(token)) {
    // 尝试刷新 token，但不影响当前请求
    refreshToken().catch(error => {
      console.error('刷新 token 失败:', error);
    });
  }

  // 应用请求拦截器
  const interceptedOptions = requestInterceptor(options);

  // 发送请求
  const response = await fetch(url, interceptedOptions);
  
  // 应用响应拦截器
  return responseInterceptor(response);
}; 