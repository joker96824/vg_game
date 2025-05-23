import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InitAccount: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 生成随机数字
  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  };

  // 初始化账号信息
  useEffect(() => {
    const initAccount = async () => {
      try {
        // TODO: 调用保存账号接口
        // const response = await saveAccount({
        //   nickname: `用户${generateRandomNumber()}`,
        //   password: 'SealJump'
        // });
        // if (response.success) {
        //   setNickname(response.data.nickname);
        //   setPassword(response.data.password);
        // }
      } catch (error) {
        setError('初始化账号失败，请重试');
      }
    };

    initAccount();
  }, []);

  // 处理确认
  const handleConfirm = async () => {
    try {
      // TODO: 调用修改密码接口
      // const response = await changePassword(password);
      // if (response.success) {
      //   navigate('/');
      // } else {
      //   setError('修改密码失败，请重试');
      // }
    } catch (error) {
      setError('修改密码失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          初始化账号
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                昵称
              </label>
              <div className="mt-1">
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
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

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitAccount; 