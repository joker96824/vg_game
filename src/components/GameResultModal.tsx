import React from 'react';

interface GameResultModalProps {
  isOpen: boolean;
  result: 'win' | 'lose' | 'draw';
  onFirstAttack: () => void;
  onSecondAttack: () => void;
  onClose: () => void;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  result,
  onFirstAttack,
  onSecondAttack,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-2xl pointer-events-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {result === 'win' ? '恭喜获胜！' :
             result === 'lose' ? '很遗憾，你输了' :
             '平局！'}
          </h3>
          
          {result === 'win' ? (
            // 胜者选择先后攻
            <div>
              <p className="text-gray-600 mb-6">请选择你的先后攻顺序：</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={onFirstAttack}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  先攻
                </button>
                <button
                  onClick={onSecondAttack}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  后攻
                </button>
              </div>
            </div>
          ) : result === 'lose' ? (
            // 败者等待提示
            <div>
              <p className="text-gray-600 mb-6">等待对方选择先后攻顺序...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : (
            // 平局情况
            <div>
              <p className="text-gray-600 mb-6">双方选择相同，需要重新选择。</p>
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameResultModal; 