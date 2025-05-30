import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Skills: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户权限
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.level < 5) {
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">技能配置</h1>
        {/* 技能配置内容 */}
      </div>
    </div>
  );
};

export default Skills; 