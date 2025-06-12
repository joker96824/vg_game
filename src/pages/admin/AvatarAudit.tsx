import React, { useState, useEffect } from 'react';

interface UnauditedFile {
  id: string;
  url: string;
  userId: string;
  createdAt: string;
}

const AvatarAudit: React.FC = () => {
  const [unauditedFiles, setUnauditedFiles] = useState<UnauditedFile[]>([]);

  useEffect(() => {
    fetchUnauditedFiles();
  }, []);

  const fetchUnauditedFiles = async () => {
    try {
      const response = await fetch('/api/v1/auth/files/unaudited');
      const data = await response.json();
      setUnauditedFiles(data);
    } catch (error) {
      console.error('获取未审核文件失败:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">头像审核</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unauditedFiles.map((file) => (
          <div key={file.id} className="border rounded-lg p-4">
            <img src={file.url} alt="待审核头像" className="w-full h-48 object-cover rounded-lg" />
            <div className="mt-4 flex justify-between">
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                通过
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                拒绝
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarAudit; 