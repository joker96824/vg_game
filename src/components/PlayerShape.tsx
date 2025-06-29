import React from 'react';
import { getAvatarUrl, handleImageError } from '../utils/image/imageUtils';

interface PlayerShapeProps {
  avatar: string;
  nickname: string;
  size?: number;
  className?: string;
  isCurrentUser?: boolean; // 是否为当前用户
}

const PlayerShape: React.FC<PlayerShapeProps> = ({ 
  avatar, 
  nickname, 
  size = 120,
  className = '',
  isCurrentUser = false
}) => {
  const strokeWidth = Math.max(2, size / 30);
  const padding = size * 0.1;
  const shapeSize = size - padding * 2;
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* SVG 形状背景 - 使用fixed定位脱离父级限制 */}
      <svg
        width={size}
        height={size}
        viewBox={`-${size/2} -${size/2} ${size} ${size}`}
        className="absolute inset-0"
        style={{ 
          position: 'absolute',
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        {isCurrentUser ? (
          /* 当前用户 - 使用第一个SVG路径 */
          <path
            d="M -3 4 L 1.5 -2 L 20 -2 C 21 -2 21 -2 21 -0.5 L 21 2.5 C 21 4 21 4 20 4 Z"
            fill="#3B82F6"
            stroke="#1E40AF"
            strokeWidth={strokeWidth}
            transform={`scale(${shapeSize/20}) translate(-10, 1)`}
          />
        ) : (
          /* 对方玩家 - 使用第二个SVG路径 */
          <path
            d="M 3 -4 L -1.5 2 L -20 2 C -21 2 -21 2 -21 0.5 L -21 -2.5 C -21 -4 -21 -4 -20 -4 Z"
            fill="#6B7280"
            stroke="#4B5563"
            strokeWidth={strokeWidth}
            transform={`scale(${shapeSize/20}) translate(10, -1)`}
          />
        )}
      </svg>
      
      {/* 头像 - 在SVG之上，根据SVG的translate调整位置 */}
      <div 
        className="absolute flex items-center justify-center z-20"
        style={{ 
          width: size * 0.4, 
          height: size * 0.4,
          top: '30%',
          transform: `${isCurrentUser ? 'translateY(20px)' : 'translateY(-20px)'}`,
          left: isCurrentUser ? 'auto' : size * 0.01,
          right: isCurrentUser ? size * 0.01 : 'auto'
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg">
          <img
            src={getAvatarUrl(avatar)}
            alt={nickname}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      </div>
      
      {/* 昵称 - 在父级中居中 */}
      <div 
        className="absolute flex items-center z-20"
        style={{ 
          top: '50%',
          transform: `translateY(-50%) ${isCurrentUser ? 'translateY(-10px) translateX(70px)' : 'translateY(-60px) translateX(-70px)'}`,
          left: isCurrentUser ? size * 0.1 : 'auto',
          right: isCurrentUser ? 'auto' : size * 0.1
        }}
      >
        <div className="bg-black/50 px-2 py-1 rounded-full shadow-sm">
          <span className="text-xs font-medium text-white whitespace-nowrap">
            {nickname}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlayerShape; 