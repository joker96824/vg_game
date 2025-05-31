import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JsonEditor from '../../components/JsonEditor';

const Skills: React.FC = () => {
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState<any>({
    id: "1"
  });

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
      return;
    }
  }, [navigate]);

  const handleJsonChange = (newData: any) => {
    setJsonData(newData);
    // TODO: 调用接口保存 JSON 数据
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-6">
          <button
            onClick={() => navigate('/')}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-center">技能配置</h1>
        </div>

        <div className="flex gap-6">
          {/* 左侧部分 */}
          <div className="w-1/3 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">技能列表</h2>
            {/* TODO: 添加技能列表 */}
          </div>

          {/* 右侧部分 */}
          <div className="flex-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">JSON 编辑器</h2>
            <JsonEditor
              data={jsonData}
              onChange={handleJsonChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills; 