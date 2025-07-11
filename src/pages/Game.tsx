import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBattleState, surrender, selectCoinNumber, selectFirstPlayer } from '../services/battleService';
import { error, success, alert } from '../utils/notification';
import { websocketManager } from '../services/websocketManager';
import { WebSocketMessage } from '../services/websocketService';
import defaultCard from '../assets/default-card.png';

// 卡牌位置类型定义
interface CardPosition {
  id: string;
  x: string;
  y: string;
  transform: string;
  visible: boolean;
  selectable?: boolean;
  choice?: number;
  isOwner?: boolean;
}

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [battleState, setBattleState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);

  // 猜拳游戏相关状态
  const [isHost, setIsHost] = useState(false);
  const [ownerChoice, setOwnerChoice] = useState<number | null>(null);
  const [guestChoice, setGuestChoice] = useState<number | null>(null);
  const [mapping, setMapping] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showCardContent, setShowCardContent] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  
  // 胜负结果弹窗状态
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalResult, setResultModalResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  // 动画状态管理
  const [cardAnimations, setCardAnimations] = useState<{[key: string]: any}>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // 获取当前用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // 处理先攻选择
  const handleFirstAttack = async () => {
    try {
      console.log('选择先攻');
      await selectFirstPlayer(true);
      setShowResultModal(false);
      success('已选择先攻');
      // 等待后端发送state_update消息来刷新状态
    } catch (err) {
      console.error('选择先攻失败:', err);
      error('选择先攻失败');
    }
  };

  // 处理后攻选择
  const handleSecondAttack = async () => {
    try {
      console.log('选择后攻');
      await selectFirstPlayer(false);
      setShowResultModal(false);
      success('已选择后攻');
      // 等待后端发送state_update消息来刷新状态
    } catch (err) {
      console.error('选择后攻失败:', err);
      error('选择后攻失败');
    }
  };

  // 重置游戏状态
  const resetGameState = useCallback(() => {
    setOwnerChoice(null);
    setGuestChoice(null);
    setMapping(null);
    setIsSelecting(false);
    setShowCardContent(false);
    setGameResult(null);
    setCardAnimations({});
    setIsAnimating(false);
    setShowResultModal(false);
    setResultModalResult(null);
  }, []);

  // 判断游戏胜负
  const determineGameResult = useCallback((ownerChoice: number, guestChoice: number, mapping: any, isUserHost: boolean) => {
    // 根据mapping获取实际的石头剪刀布选择
    const ownerActualChoice = mapping[ownerChoice];
    const guestActualChoice = mapping[guestChoice];
    
    console.log('胜负判断:', {
      ownerChoice,
      guestChoice,
      ownerActualChoice,
      guestActualChoice,
      isUserHost
    });
    
    // 石头剪刀布胜负关系：石头 > 剪刀 > 布 > 石头
    if (ownerActualChoice === guestActualChoice) {
      return 'draw'; // 平局
    }
    
    // 判断胜负
    let ownerWins = false;
    if (ownerActualChoice === '石头' && guestActualChoice === '剪刀') { // 石头 vs 剪刀
      ownerWins = true;
    } else if (ownerActualChoice === '剪刀' && guestActualChoice === '布') { // 剪刀 vs 布
      ownerWins = true;
    } else if (ownerActualChoice === '布' && guestActualChoice === '石头') { // 布 vs 石头
      ownerWins = true;
    }
    
    // 根据用户是否为房主返回结果
    return isUserHost ? (ownerWins ? 'win' : 'lose') : (ownerWins ? 'lose' : 'win');
  }, []);

  // 处理coin状态
  const handleCoinState = useCallback((state: any) => {
    console.log('处理coin状态，当前用户:', currentUser);
    console.log('Battle状态:', state);
    
    const coinGame = state.coin_game;
    if (!coinGame) {
      console.log('没有coin_game数据');
      return;
    }
    
    const isUserHost = coinGame.is_owner || false;
    const newOwnerChoice = coinGame.owner_choice;
    const newGuestChoice = coinGame.guest_choice;
    const newMapping = coinGame.mapping;
    
    console.log('coin_game数据:', {
      isUserHost,
      newOwnerChoice,
      newGuestChoice,
      newMapping,
      currentOwnerChoice: ownerChoice,
      currentGuestChoice: guestChoice
    });
    
    // 检测位置变化并触发动画
    const animations: {[key: string]: any} = {};
    
    // 检查房主选择变化
    if (newOwnerChoice && newOwnerChoice !== ownerChoice) {
      const cardId = `choice-${newOwnerChoice}`;
      const targetPosition = isUserHost 
        ? { x: '50%', y: '90%', transform: 'translate(-50%, -50%)' }  // 房主视角：移动到下方
        : { x: '50%', y: '10%', transform: 'translate(-50%, -50%)' }; // 非房主视角：移动到上方
      
      animations[cardId] = {
        isAnimating: true,
        targetPosition
      };
      console.log(`房主选择变化: ${newOwnerChoice} -> 移动到 ${targetPosition.x}, ${targetPosition.y}`);
    }
    
    // 检查玩家选择变化
    if (newGuestChoice && newGuestChoice !== guestChoice) {
      const cardId = `choice-${newGuestChoice}`;
      const targetPosition = isUserHost 
        ? { x: '50%', y: '10%', transform: 'translate(-50%, -50%)' }  // 房主视角：移动到上方
        : { x: '50%', y: '90%', transform: 'translate(-50%, -50%)' }; // 非房主视角：移动到下方
      
      animations[cardId] = {
        isAnimating: true,
        targetPosition
      };
      console.log(`玩家选择变化: ${newGuestChoice} -> 移动到 ${targetPosition.x}, ${targetPosition.y}`);
    }
    
    // 如果有动画，先设置动画状态
    if (Object.keys(animations).length > 0) {
      console.log('设置卡牌移动动画:', animations);
      setCardAnimations(prev => ({
        ...prev,
        ...animations
      }));
      setIsAnimating(true);
      
      // 等待动画完成后更新状态
      setTimeout(() => {
        // 清除动画状态
        setCardAnimations({});
        setIsAnimating(false);
        
        // 延迟一帧再更新状态，避免闪烁
        requestAnimationFrame(() => {
          setIsHost(isUserHost);
          setOwnerChoice(newOwnerChoice);
          setGuestChoice(newGuestChoice);
          setMapping(newMapping);
          
          // 判断是否可以选择
          if (isUserHost) {
            setIsSelecting(!newOwnerChoice);
          } else {
            setIsSelecting(Boolean(newOwnerChoice && !newGuestChoice));
          }
          
          // 检查是否需要显示卡牌内容和判断胜负
          if (newOwnerChoice && newGuestChoice && newMapping) {
            // 等待一小段时间后显示卡牌内容
            setTimeout(() => {
              setShowCardContent(true);
              // 判断胜负
              const result = determineGameResult(newOwnerChoice, newGuestChoice, newMapping, isUserHost);
              setGameResult(result);
              
              // 显示结果弹窗
              setResultModalResult(result);
              setShowResultModal(true);
            }, 1000); // 等待1秒后显示结果
          }
        });
      }, 700); // 动画持续时间
    } else {
      // 没有动画，直接更新状态
      console.log('没有位置变化，直接更新状态');
      setIsHost(isUserHost);
      setOwnerChoice(newOwnerChoice);
      setGuestChoice(newGuestChoice);
      setMapping(newMapping);
      
      // 判断是否可以选择
      if (isUserHost) {
        setIsSelecting(!newOwnerChoice);
      } else {
        setIsSelecting(Boolean(newOwnerChoice && !newGuestChoice));
      }
      
      // 检查是否需要显示卡牌内容和判断胜负
      if (newOwnerChoice && newGuestChoice && newMapping) {
        // 等待一小段时间后显示卡牌内容
        setTimeout(() => {
          setShowCardContent(true);
          // 判断胜负
          const result = determineGameResult(newOwnerChoice, newGuestChoice, newMapping, isUserHost);
          setGameResult(result);
          
          // 显示结果弹窗
          setResultModalResult(result);
          setShowResultModal(true);
        }, 1000); // 等待1秒后显示结果
      }
    }
  }, [currentUser, ownerChoice, guestChoice, determineGameResult]);

  // 获取battle状态
  useEffect(() => {
    const fetchBattleState = async () => {
      try {
        console.log('获取battle状态');
        const state = await getBattleState();
        setBattleState(state);
        console.log('battle状态:', state);
        
        // 处理coin状态
        if (state.status === 'coin') {
          handleCoinState(state);
        }
        
      } catch (err) {
        console.error('获取battle状态失败:', err);
        error('获取battle状态失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchBattleState();
    }
  }, [currentUser, handleCoinState]);

  // 处理投降
  const handleSurrender = async () => {
    try {
      await surrender();
      success('投降成功');
      navigate('/');
    } catch (err) {
      console.error('投降失败:', err);
      error('投降失败');
    }
  };

  // 处理猜拳选择
  const handleCoinChoice = async (choice: number) => {
    try {
      setIsSelecting(false);
      await selectCoinNumber(choice);
      success('选择已提交，等待对手...');
    } catch (err) {
      console.error('选择猜拳数字失败:', err);
      error('选择失败');
      // 选择失败时恢复选择状态
      setIsSelecting(true);
    }
  };

  // 处理状态更新
  const handleUpdateState = useCallback(async (data: any) => {
    try {
      console.log('处理状态更新:', data);
      
      // 重新获取新的game_state
      const state = await getBattleState();
      console.log('更新后的battle状态:', state);
      
      // 更新battle状态
      setBattleState(state);
      
      // 根据状态类型进行相应处理
      if (state.status === 'coin') {
        handleCoinState(state);
      } else {
        // 如果不是coin状态，重置游戏相关状态
        console.log('游戏状态已改变，重置游戏状态');
        resetGameState();
      }
    } catch (err) {
      console.error('处理状态更新失败:', err);
    }
  }, [handleCoinState, resetGameState]);

  // WebSocket消息处理
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'room_dissolved':
        // 房间被解散，跳转到首页
        alert('房间状态', '房间已被解散');
        navigate('/');
        break;
      case 'room_kicked':
        // 被踢出房间，跳转到首页
        alert('房间状态', '您已被踢出房间');
        navigate('/');
        break;
      case 'state_update':
        // 处理状态更新
        console.log('收到状态更新消息:', message);
        handleUpdateState(message.data);
        break;
      default:
        break;
    }
  }, [navigate, handleUpdateState]);

  // 设置WebSocket监听
  useEffect(() => {
    websocketManager.addMessageListener(handleWebSocketMessage);
    
    return () => {
      websocketManager.removeMessageListener(handleWebSocketMessage);
    };
  }, [handleWebSocketMessage]);

  // 计算卡牌位置
  const getCardPositions = () => {
    const positions: CardPosition[] = [
      { id: 'top', x: '50%', y: '10%', transform: 'translate(-50%, -50%)', visible: false },       // 上方
      { id: 'center-left', x: '25%', y: '50%', transform: 'translate(-50%, -50%)', visible: false }, // 中左
      { id: 'center', x: '50%', y: '50%', transform: 'translate(-50%, -50%)', visible: false },     // 中央
      { id: 'center-right', x: '75%', y: '50%', transform: 'translate(-50%, -50%)', visible: false }, // 中右
      { id: 'bottom', x: '50%', y: '90%', transform: 'translate(-50%, -50%)', visible: false }      // 下方
    ];

    // 初始状态：三张卡牌在中间一排
    if (!ownerChoice && !guestChoice) {
      return [
        { ...positions[0], visible: false },
        { ...positions[1], visible: true, selectable: isSelecting, choice: 1 },
        { ...positions[2], visible: true, selectable: isSelecting, choice: 2 },
        { ...positions[3], visible: true, selectable: isSelecting, choice: 3 },
        { ...positions[4], visible: false }
      ];
    }

    // 房主已选择，玩家未选择
    if (ownerChoice && !guestChoice) {
      if (isHost) {
        // 房主视角：已选择的卡牌在下方，剩余两张保持在原位置
        return [
          { ...positions[0], visible: false },
          { ...positions[1], visible: ownerChoice !== 1, selectable: ownerChoice !== 1 && isSelecting, choice: 1 },
          { ...positions[2], visible: ownerChoice !== 2, selectable: ownerChoice !== 2 && isSelecting, choice: 2 },
          { ...positions[3], visible: ownerChoice !== 3, selectable: ownerChoice !== 3 && isSelecting, choice: 3 },
          { ...positions[4], visible: true, isOwner: true, choice: ownerChoice }
        ];
      } else {
        // 非房主视角：房主选择的卡牌在上方，剩余两张保持在原位置
        return [
          { ...positions[0], visible: true, isOwner: true, choice: ownerChoice },
          { ...positions[1], visible: ownerChoice !== 1, selectable: ownerChoice !== 1 && isSelecting, choice: 1 },
          { ...positions[2], visible: ownerChoice !== 2, selectable: ownerChoice !== 2 && isSelecting, choice: 2 },
          { ...positions[3], visible: ownerChoice !== 3, selectable: ownerChoice !== 3 && isSelecting, choice: 3 },
          { ...positions[4], visible: false }
        ];
      }
    }

    // 双方都已选择
    if (ownerChoice && guestChoice) {
      if (isHost) {
        // 房主视角：房主在下方，玩家在上方
        return [
          { ...positions[0], visible: true, isOwner: false, choice: guestChoice },
          { ...positions[1], visible: false },
          { ...positions[2], visible: false },
          { ...positions[3], visible: false },
          { ...positions[4], visible: true, isOwner: true, choice: ownerChoice }
        ];
      } else {
        // 非房主视角：房主在上方，玩家在下方
        return [
          { ...positions[0], visible: true, isOwner: true, choice: ownerChoice },
          { ...positions[1], visible: false },
          { ...positions[2], visible: false },
          { ...positions[3], visible: false },
          { ...positions[4], visible: true, isOwner: false, choice: guestChoice }
        ];
      }
    }

    return positions.map(p => ({ ...p, visible: false }));
  };

  // 渲染猜拳游戏UI
  const renderCoinGame = () => {
    const cardPositions = getCardPositions();

    return (
      <div className="relative w-full max-w-4xl mx-auto h-[600px]">
        {/* 卡牌容器 */}
        <div className="relative w-full h-full">
          {cardPositions.map((position, index) => {
            // 检查是否有动画状态
            const animationState = cardAnimations[`choice-${position.choice}`] || { isAnimating: false, targetPosition: null };
            
            // 获取实际位置（考虑动画状态）
            const actualPosition = animationState.isAnimating && animationState.targetPosition 
              ? animationState.targetPosition 
              : { x: position.x, y: position.y, transform: position.transform };
            
            // 动画期间保持可见性，避免闪烁
            const isVisible = position.visible || animationState.isAnimating;
            
            return (
              <div
                key={position.id}
                className={`absolute w-32 h-48 transition-all duration-700 ease-out ${
                  position.selectable ? 'cursor-pointer hover:scale-105' : ''
                }`}
                style={{
                  left: actualPosition.x,
                  top: actualPosition.y,
                  transform: `${actualPosition.transform} ${
                    animationState.isAnimating ? 'rotate(2deg)' : ''
                  }`,
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: position.selectable && !isAnimating ? 'auto' : 'none',
                  zIndex: position.selectable ? 20 : 10,
                  transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {position.selectable ? (
                  <button
                    onClick={() => handleCoinChoice(position.choice!)}
                    className="w-full h-full transition-all duration-200 hover:shadow-xl"
                  >
                    <div className="w-full h-full rounded-lg shadow-lg overflow-hidden">
                      <img 
                        src={defaultCard} 
                        alt="卡牌背面" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                ) : isVisible ? (
                  <div className="w-full h-full rounded-lg shadow-lg overflow-hidden">
                    {showCardContent && mapping && position.choice ? (
                      // 显示卡牌正面（石头剪刀布）
                      <div className="w-full h-full bg-white flex items-center justify-center text-4xl font-bold">
                        {(() => {
                          const actualChoice = mapping[position.choice];
                          switch (actualChoice) {
                            case '石头': return '✊'; // 石头
                            case '剪刀': return '✌️'; // 剪刀
                            case '布': return '✋'; // 布
                            default: return '?';
                          }
                        })()}
                      </div>
                    ) : (
                      // 显示卡牌背面
                      <img 
                        src={defaultCard} 
                        alt="卡牌背面" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4 relative">
      {/* 投降按钮 */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowSurrenderConfirm(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          投降
        </button>
      </div>

      {/* 选择阶段提示 - 居中显示 */}
      {!gameResult && battleState?.status === 'coin' && (
        <div className="absolute top-4 left-0 right-0 text-center z-50">
          <h2 className="text-xl font-bold text-gray-700">
            {!ownerChoice && !guestChoice 
              ? (isHost ? '通过猜拳决定先后攻顺序...' : '通过猜拳决定先后攻顺序，等待房主选择...')
              : ownerChoice && !guestChoice
              ? (isHost ? '等待对手选择...' : '房主已选择，轮到你选择...')
              : '双方已选择，等待结果...'
            }
          </h2>
        </div>
      )}

      {/* 结果阶段提示 - 页面正中间，纯文字 */}
      {gameResult && (
        <h2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700 z-20">
          {gameResult === 'win' ? '恭喜！你赢了！' :
           gameResult === 'lose' ? '很遗憾，你输了！' :
           '平局！'}
        </h2>
      )}

      {/* 胜负选择弹窗 - 只有胜者显示 */}
      {showResultModal && resultModalResult === 'win' && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-2xl pointer-events-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">恭喜获胜！</h3>
              <p className="text-gray-600 mb-6">请选择你的先后攻顺序：</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleFirstAttack}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  先攻
                </button>
                <button
                  onClick={handleSecondAttack}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  后攻
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 投降确认弹窗 */}
      {showSurrenderConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">确认投降</h3>
            <p className="text-gray-600 mb-6">确定要投降吗？此操作不可撤销。</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSurrenderConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSurrender}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确认投降
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center w-full max-w-6xl mx-auto">
        {/* 显示battle状态信息 */}
        {battleState ? (
          <>
            {/* 检查状态是否为coin，如果是则显示猜拳游戏 */}
            {battleState.status === 'coin' ? (
              <div className="mb-8 w-full">
                {renderCoinGame()}
              </div>
            ) : (
              <p className="text-gray-600 mb-8">游戏页面开发中...</p>
            )}
          </>
        ) : (
          <div className="mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">正在获取游戏状态...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game; 