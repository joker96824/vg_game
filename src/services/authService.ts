import { API_ENDPOINTS } from '../constants/api';

// 获取存储的 token
const getToken = () => localStorage.getItem('token');

// 获取图形验证码
export const getCaptcha = async (): Promise<{ blob: Blob; sessionId: string }> => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/captcha`, {
    credentials: 'include',
  });
  console.log('Captcha response cookies:', document.cookie);
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
  console.log('Send SMS request cookies:', document.cookie);
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

// 用户登录
export const login = async (mobile: string, password: string, captcha?: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ mobile, password, captcha }),
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
  }
  return data;
};

// 用户登出
export const logout = async () => {
  const token = getToken();
  if (!token) {
    return;
  }

  const response = await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return response.json();
};

// 修改密码
export const resetPassword = async (mobile: string, oldPassword: string, newPassword: string) => {
  const token = getToken();
  if (!token) {
    throw new Error('未登录');
  }

  const response = await fetch(`${API_ENDPOINTS.AUTH}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
  
  // 检查返回的数据结构
  if (!data.success) {
    throw new Error(data.message || '修改密码失败');
  }

  return data;
};

// 清除登录错误计数
export const clearLoginErrors = async (mobile: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/clear-login-errors`, {
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
export const refreshToken = async (token: string) => {
  const response = await fetch(`${API_ENDPOINTS.AUTH}/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  });
  return response.json();
}; 