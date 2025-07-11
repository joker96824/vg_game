import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl, handleImageError } from '../utils/image/imageUtils';

interface MatchSuccessModalProps {
  isOpen: boolean;
  matchId: string;
  players: Array<{
    user_id: string;
    nickname: string;
    avatar: string;
  }>;
  onAccept: () => void;
  onReject: () => void;
  isConfirmed?: boolean; // 添加确认状态
}

const MatchSuccessModal: React.FC<MatchSuccessModalProps> = ({
  isOpen,
  matchId,
  players,
  onAccept,
  onReject,
  isConfirmed = false
}) => {
  const [countdown, setCountdown] = useState(20);
  const [isAutoRejected, setIsAutoRejected] = useState(false);
  const [localConfirmed, setLocalConfirmed] = useState(false);
  const [lastMatchId, setLastMatchId] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 当isConfirmed变为true时，设置本地确认状态
  useEffect(() => {
    if (isConfirmed) {
      setLocalConfirmed(true);
    }
  }, [isConfirmed]);

  // 倒计时效果
  useEffect(() => {
    if (isOpen && !isAutoRejected) {
      // 只有在新的匹配ID时才重置倒计时
      if (lastMatchId !== matchId) {
        setCountdown(20);
        setIsAutoRejected(false);
        setLocalConfirmed(false); // 重置本地确认状态
        setLastMatchId(matchId);
      }
      
      // 只有在没有计时器时才启动新的计时器
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              // 倒计时结束，自动拒绝
              setIsAutoRejected(true);
              onReject();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, onReject, isAutoRejected, matchId, lastMatchId]);

  // 手动操作时清除倒计时
  const handleManualAction = (action: () => void) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    action();
  };

  // 当弹窗关闭时清理状态
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setLastMatchId('');
      setLocalConfirmed(false);
      setIsAutoRejected(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercentage = ((20 - countdown) / 20) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">匹配成功！</h3>
          <p className="text-gray-600">找到对手，是否进入游戏？</p>
          
          {/* 倒计时显示 */}
          <div className="mt-3">
            {localConfirmed ? (
              // 已确认状态
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-green-600">等待其他玩家确认</span>
                <span className="text-lg font-bold text-blue-500">
                  {countdown}s
                </span>
              </div>
            ) : (
              // 未确认状态
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-gray-500">等待确认：</span>
                <span className={`text-lg font-bold ${countdown <= 5 ? 'text-red-500' : 'text-blue-500'}`}>
                  {countdown}s
                </span>
              </div>
            )}
            
            {/* 进度条 */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  countdown <= 5 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 玩家列表 */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">对战玩家</h4>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={player.user_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative">
                  <img
                    src={getAvatarUrl(player.avatar)}
                    alt={player.nickname}
                    className="w-10 h-10 rounded-full"
                    onError={handleImageError}
                  />
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">主</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{player.nickname}</p>
                  <p className="text-sm text-gray-500">
                    {index === 0 ? '房主' : '玩家'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3">
          {localConfirmed ? (
            // 已确认状态
            <div className="flex items-center space-x-2">
              <span className="text-green-600 font-medium">已确认</span>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                进入游戏
              </button>
            </div>
          ) : (
            // 未确认状态
            <>
              <button
                onClick={() => handleManualAction(onReject)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                拒绝
              </button>
              <button
                onClick={() => handleManualAction(onAccept)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                进入游戏
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchSuccessModal; 