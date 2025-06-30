import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnauditedFiles, updateFileStatus } from '../../services/authService';
import { success, error } from '../../utils/notification';
import { IMAGE_BASE_URL } from '../../constants/api';

interface UnauditedFile {
  filename: string;
  size: number;
  create_time: string;
  modify_time: string;
}

interface ProcessedFile extends UnauditedFile {
  userId: string;
  timestamp: number;
  fileExt: string;
}

const AvatarAudit: React.FC = () => {
  const navigate = useNavigate();
  const [unauditedFiles, setUnauditedFiles] = useState<ProcessedFile[]>([]);

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

    fetchUnauditedFiles();
  }, [navigate]);

  const fetchUnauditedFiles = async () => {
    try {
      const files = await getUnauditedFiles();
      
      // 处理文件名，提取用户ID和时间戳
      const processedFiles = files.items.map((file: UnauditedFile) => {
        const fileName = file.filename.split('/').pop() || '';
        const [nameWithoutExt, fileExt] = fileName.split('.');
        const parts = nameWithoutExt.split('_');
        
        if (parts.length === 4 && parts[0] === 'avatar' && parts[3] === 'Unaudited') {
          const [, userId, timestamp] = parts;
          return {
            ...file,
            userId,
            timestamp: parseInt(timestamp),
            fileExt
          };
        }
        console.error('文件名格式不匹配:', fileName);
        return null;
      }).filter((file: UnauditedFile | null): file is ProcessedFile => file !== null);

      // 按用户ID分组，只保留每个用户最新的文件
      const latestFiles = processedFiles.reduce((acc: ProcessedFile[], file: ProcessedFile) => {
        const existingFile = acc.find((f: ProcessedFile) => f.userId === file.userId);
        if (!existingFile || file.timestamp > existingFile.timestamp) {
          // 如果存在旧文件，将其标记为无效
          if (existingFile) {
            updateFileStatus(existingFile.filename, 'Unvalid').catch(err => {
              console.error('自动标记旧头像为无效失败:', err);
            });
          }
          return [...acc.filter((f: ProcessedFile) => f.userId !== file.userId), file];
        }
        // 如果当前文件不是最新的，将其标记为无效
        updateFileStatus(file.filename, 'Unvalid').catch(err => {
          console.error('自动标记旧头像为无效失败:', err);
        });
        return acc;
      }, [] as ProcessedFile[]);

      setUnauditedFiles(latestFiles);
    } catch (err) {
      console.error('获取未审核文件失败:', err);
      error('获取未审核文件失败');
    }
  };

  const handleApprove = async (file: ProcessedFile) => {
    try {
      await updateFileStatus(file.filename, 'Valid');
      success('审核通过成功');
      // 刷新文件列表
      fetchUnauditedFiles();
    } catch (err) {
      console.error('审核通过失败:', err);
      error('审核通过失败');
    }
  };

  const handleReject = async (file: ProcessedFile) => {
    try {
      await updateFileStatus(file.filename, 'Unvalid');
      success('审核拒绝成功');
      // 刷新文件列表
      fetchUnauditedFiles();
    } catch (err) {
      console.error('审核拒绝失败:', err);
      error('审核拒绝失败');
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-6">
          <button
            onClick={() => navigate('/')}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-center">头像审核</h1>
        </div>

        <div className="space-y-4">
          {unauditedFiles.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              暂无待审核的头像
            </div>
          ) : (
            unauditedFiles.map((file) => (
              <div key={`${file.userId}_${file.timestamp}`} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={`${IMAGE_BASE_URL}/avatars/${file.filename}`}
                    alt={`用户 ${file.userId} 的头像`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error('图片加载失败:', {
                        url: target.src,
                        filename: file.filename,
                        userId: file.userId
                      });
                      target.style.display = 'none';
                      target.parentElement?.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center');
                      target.parentElement!.textContent = '加载失败';
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log('图片加载成功:', {
                        url: target.src,
                        filename: file.filename,
                        userId: file.userId
                      });
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">
                    用户ID: {file.userId}
                  </div>
                  <div className="text-xs text-gray-500">
                    上传时间: {file.timestamp.toString().replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6')}
                  </div>
                  <div className="text-xs text-gray-500">
                    文件大小: {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(file)}
                    className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    通过
                  </button>
                  <button
                    onClick={() => handleReject(file)}
                    className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    拒绝
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarAudit; 