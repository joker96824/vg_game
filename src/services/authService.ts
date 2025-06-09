import { API_ENDPOINTS } from '../constants/api';
import { createAuthenticatedRequest } from '../utils/request';

// Token 相关常量
const TOKEN_KEY = 'token';
const TOKEN_REFRESH_THRESHOLD = 20 * 60 * 1000; // 20分钟，转换为毫秒
const INITIAL_TOKEN_EXPIRY = 4 * 60 * 60 * 1000; // 4小时，转换为毫秒

// 获取存储的 token
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// 设置 token
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

// 移除 token
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// 检查 token 是否已过期
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // 转换为毫秒
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
};

// 获取 token 剩余时间（毫秒）
export const getTokenTimeLeft = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // 转换为毫秒
    return Math.max(0, expirationTime - Date.now());
  } catch {
    return 0;
  }
};

// 检查 token 是否需要刷新
export const shouldRefreshToken = (token: string): boolean => {
  try {
    const timeLeft = getTokenTimeLeft(token);
    return timeLeft < TOKEN_REFRESH_THRESHOLD;
  } catch {
    return false;
  }
};

// 获取图形验证码
export const getCaptcha = async (): Promise<{ blob: Blob; sessionId: string }> => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/captcha`, {
    credentials: 'include',
  });
  return {
    blob: await response.blob(),
    sessionId: document.cookie.split(';').find(c => c.trim().startsWith('session_id='))?.split('=')[1] || ''
  };
};

// 验证图形验证码
export const verifyCaptcha = async (captcha: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/verify-captcha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ captcha }),
  });
  return response.json();
};

// 发送短信验证码
export const sendSmsCode = async (mobile: string, captcha: string, scene: string = 'register') => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/send-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ mobile, captcha, scene }),
  });
  return response.json();
};

// 用户注册
export const register = async (mobile: string, smsCode: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile, sms_code: smsCode }),
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

// 发送邮箱验证码
export const sendEmailCode = async (email: string, captcha: string, scene: 'register' | 'change_email' | 'reset_password') => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, captcha, scene }),
  });
  return response.json();
};

// 邮箱注册
export const registerByEmail = async (email: string, emailCode: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/register-by-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, email_code: emailCode }),
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

// 邮箱登录
export const loginByEmail = async (email: string, password: string, captcha?: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/login-by-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, captcha }),
  });

  if (!response.ok) {
    const error: any = new Error('登录失败');
    error.status = response.status;
    error.response = response;
    throw error;
  }

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    logTokenInfo(data.data.token, '登录');
  }
  return data;
};

// 通过邮箱修改密码
export const resetPasswordByEmail = async (email: string, oldPassword: string, newPassword: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/reset-password-by-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, old_password: oldPassword, new_password: newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '修改密码失败');
  }

  if (!data.success) {
    throw new Error(data.message || '修改密码失败');
  }
  return data;
};

// 强制重置密码
export const forceResetPasswordByEmail = async (email: string, newPassword: string, emailCode: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/force-reset-password/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, new_password: newPassword, email_code: emailCode }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || '重置密码失败');
  }

  return data;
};

// 修改邮箱
export const updateEmail = async (newEmail: string, emailCode: string, captcha: string): Promise<void> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/update-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_email: newEmail, email_code: emailCode, captcha }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '修改邮箱失败');
    }
  } catch (error) {
    console.error('修改邮箱失败:', error);
    throw error;
  }
};

// 打印 token 信息
const logTokenInfo = (token: string, action: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // 转换为毫秒
    const timeLeft = Math.max(0, expirationTime - Date.now());
  } catch (error) {
    console.error(`[${action}] Token 解析失败:`, error);
  }
};

// 用户登录
export const login = async (mobile: string, password: string, captcha?: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ 
      mobile, 
      password, 
      captcha,
      expires_in: Math.floor(INITIAL_TOKEN_EXPIRY / 1000) // 转换为秒
    }),
  });

  if (!response.ok) {
    const error: any = new Error('登录失败');
    error.status = response.status;
    error.response = response;
    throw error;
  }

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    logTokenInfo(data.data.token, '登录');
  }
  return data;
};

// 用户登出
export const logout = async (): Promise<void> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('退出登录失败');
    }

    // 删除本地存储的token和用户信息
    removeToken();
    localStorage.removeItem('user');
  } catch (error) {
    console.error('退出登录失败:', error);
    // 即使API调用失败，也清除本地存储
    removeToken();
    localStorage.removeItem('user');
    throw error;
  }
};

// 修改密码
export const resetPassword = async (mobile: string, oldPassword: string, newPassword: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile,
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '修改密码失败');
  }
  
  if (!data.success) {
    throw new Error(data.message || '修改密码失败');
  }

  return data;
};

// 清除登录错误计数
export const clearLoginErrors = async (mobile: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/clear-login-errors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
  });
  return response.json();
};

// 检查会话状态
export const checkSession = async (token: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/check-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  });
  return response.json();
};

// 刷新令牌
export const refreshToken = async (): Promise<string | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_ENDPOINTS.AUTH}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();
    if (data.success && data.data?.token) {
      setToken(data.data.token);
      logTokenInfo(data.data.token, '刷新Token');
      return data.data.token;
    }
    return null;
  } catch (error) {
    console.error('刷新 token 失败:', error);
    return null;
  }
};

// 添加测试用的 token 生成函数
export const generateTestToken = (expiresIn: number = 30) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000),
    sub: 'test-user'
  }));
  const signature = 'test-signature';
  return `${header}.${payload}.${signature}`;
};

// 修改昵称
export const updateNickname = async (nickname: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/update-nickname`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || '修改昵称失败');
  }
  return data;
};

// 修改头像
export const updateAvatar = async (avatarUrl: string) => {
  const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/update-avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || '修改头像失败');
  }
  return data;
};

export const getUsers = async () => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/users`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
};

export const updateUserLevel = async (userId: string, newLevel: number) => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/users/level`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, new_level: newLevel }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '修改用户等级失败');
    }
    return data;
  } catch (error) {
    console.error('修改用户等级失败:', error);
    throw error;
  }
};

export interface FriendSearchResult {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  }

export const searchUsers = async (keyword: string) => {
    try {
      const response = await createAuthenticatedRequest(`${API_ENDPOINTS.AUTH}/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error('搜索好友失败');
      }
      return await response.json();
    } catch (error) {
      console.error('搜索好友失败:', error);
      throw error;
    }
  };