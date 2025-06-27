import React from 'react';
import { getAvatarUrl, handleImageError } from '../utils/image/imageUtils';

interface MatchSuccessModalProps {
  isOpen: boolean;
  matchId: string;
  players: Array<{
    id: string;
    nickname: string;
    avatar: string;
  }>;
  onAccept: () => void;
  onReject: () => void;
}

const MatchSuccessModal: React.FC<MatchSuccessModalProps> = ({
  isOpen,
  matchId,
  players,
  onAccept,
  onReject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">匹配成功！</h3>
          <p className="text-gray-600">找到对手，是否进入游戏？</p>
        </div>

        {/* 玩家列表 */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">对战玩家</h4>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
          <button
            onClick={onReject}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            拒绝
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            进入游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSuccessModal; 