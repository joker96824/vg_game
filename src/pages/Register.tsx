import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 刷新验证码
  const refreshCaptcha = () => {
    // TODO: 调用获取验证码接口
    setCaptchaImage('验证码图片URL');
  };

  // 获取短信验证码
  const handleGetSmsCode = async () => {
    if (countdown > 0) return;
    
    try {
      // TODO: 调用发送短信验证码接口
      // const response = await sendSmsCode(phone, captcha);
      // if (response.success) {
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
      // } else {
      //   setError('获取验证码失败，请重试');
      //   refreshCaptcha();
      // }
    } catch (error) {
      setError('获取验证码失败，请重试');
      refreshCaptcha();
    }
  };

  // 处理注册
  const handleRegister = async () => {
    try {
      // TODO: 调用注册接口
      // const response = await register(phone, smsCode);
      // if (response.success) {
      //   navigate('/init-account');
      // } else {
      //   setError('注册失败，请重试');
      //   refreshCaptcha();
      // }
    } catch (error) {
      setError('注册失败，请重试');
      refreshCaptcha();
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
          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手机号
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">
                图片验证码
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
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  刷新
                </button>
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleGetSmsCode}
                  disabled={countdown > 0}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                    countdown > 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
                type="button"
                onClick={handleRegister}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                注册
              </button>
            </div>
          </div>

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
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                返回登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 