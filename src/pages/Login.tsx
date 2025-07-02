import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, loginByEmail, getCaptcha, clearLoginErrors, logout, getToken } from '../services/authService';
import { websocketManager } from '../services/websocketManager';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [error, setError] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const { blob } = await getCaptcha();
      const url = URL.createObjectURL(blob);
      setCaptchaImage(url);
    } catch (error) {
      console.error('获取验证码失败:', error);
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginByEmail(email, password, showCaptcha ? captcha : undefined);
      if (response.success) {
        // 保存 token 和用户信息
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // 登录成功后连接WebSocket
        console.log('登录成功，开始连接WebSocket...');
        websocketManager.connect();
        
        // 清除登录错误
        await handleClearErrors();
        // 获取来源页面，如果没有则跳转到主页
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError(response.message);
        setShowCaptcha(true);
        fetchCaptcha();
      }
    } catch (error: any) {
      if (error.status === 422 || error.status === 400) {
        const errorData = await error.response?.json();
        setError(errorData?.message || '用户名或密码错误');
        setShowCaptcha(true);
        fetchCaptcha();
      } else {
        setError('登录失败，请重试');
        setShowCaptcha(true);
        fetchCaptcha();
      }
    }
  };

  // 处理验证码刷新
  const handleRefreshCaptcha = () => {
    fetchCaptcha();
  };

  // 清除登录错误
  const handleClearErrors = async () => {
    try {
      await clearLoginErrors(email);
      setShowCaptcha(false);
      setCaptcha('');
    } catch (error) {
      console.error('清除登录错误失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {showCaptcha && (
              <div>
                <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">
                  验证码
                </label>
                <div className="mt-1 flex">
                  <input
                    id="captcha"
                    name="captcha"
                    type="text"
                    required
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <img
                    src={captchaImage}
                    alt="验证码"
                    className="h-10 cursor-pointer"
                    onClick={handleRefreshCaptcha}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                登录
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  还没有账号？
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/register')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                注册
              </button>
              <button
                onClick={() => navigate('/reset-password')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                忘记密码
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 