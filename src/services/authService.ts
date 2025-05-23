import { API_ENDPOINTS } from '../constants/api';

// 获取图形验证码
export const getCaptcha = async (): Promise<Blob> => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/captcha`);
  return response.blob();
};

// 发送短信验证码
export const sendSmsCode = async (mobile: string, captcha: string, scene: string = 'register') => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/send-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile, captcha, scene }),
  });
  return response.json();
};

// 用户注册
export const register = async (mobile: string, smsCode: string, password: string, nickname?: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile, sms_code: smsCode, password, nickname }),
  });
  return response.json();
};

// 用户登录
export const login = async (mobile: string, password: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile, password }),
  });
  return response.json();
};

// 用户登出
export const logout = async (token: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  });
  return response.json();
};

// 修改密码
export const resetPassword = async (mobile: string, oldPassword: string, newPassword: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/reset-password`, {
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
  return response.json();
};

// 清除登录错误计数
export const clearLoginErrors = async (mobile: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/clear-login-errors`, {
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
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/check-session`, {
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
export const refreshToken = async (token: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  });
  return response.json();
}; 