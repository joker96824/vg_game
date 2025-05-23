import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, getCaptcha, verifyCaptcha, sendSmsCode } from '../services/authService';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

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

  // 页面加载时获取验证码
  useEffect(() => {
    fetchCaptcha();
  }, []);

  // 发送短信验证码
  const handleSendSms = async () => {
    if (!mobile || !captcha) {
      setError('请先输入手机号和图形验证码');
      return;
    }

    try {
      const response = await sendSmsCode(mobile, captcha);
      if (response.success) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message);
        fetchCaptcha();
      }
    } catch (error) {
      setError('发送验证码失败，请重试');
      fetchCaptcha();
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await register(mobile, smsCode);
      if (response.success) {
        navigate('/init-account', { state: { mobile } });
      } else {
        setError(response.message);
        fetchCaptcha();
      }
    } catch (error) {
      setError('注册失败，请重试');
      fetchCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          注册账号
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                手机号
              </label>
              <div className="mt-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">
                图形验证码
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
                  onClick={fetchCaptcha}
                />
              </div>
            </div>

            <div>
              <label htmlFor="smsCode" className="block text-sm font-medium text-gray-700">
                短信验证码
              </label>
              <div className="mt-1 flex">
                <input
                  id="smsCode"
                  name="smsCode"
                  type="text"
                  required
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="appearance-none block w-[70%] px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={countdown > 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                </button>
              </div>
            </div>

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
                注册
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
                  已有账号？
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 