import React from 'react';

interface PreloadProgressProps {
  total: number;
  loaded: number;
  failed: number;
  currentItem?: string;
  className?: string;
}

const PreloadProgress: React.FC<PreloadProgressProps> = ({
  total,
  loaded,
  failed,
  currentItem,
  className = ''
}) => {
  const progress = total > 0 ? (loaded / total) * 100 : 0;
  const successRate = total > 0 ? ((loaded + failed) / total) * 100 : 0;

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>资源加载中...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <div>已加载: {loaded} / {total}</div>
        {failed > 0 && <div className="text-red-500">失败: {failed}</div>}
        {currentItem && (
          <div className="text-xs text-gray-400 truncate">
            当前: {currentItem}
          </div>
        )}
      </div>

      {/* 加载动画 */}
      {successRate < 100 && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreloadProgress; 