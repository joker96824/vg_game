import React from 'react';
import { useNavigate } from 'react-router-dom';
import starIcon from '../assets/star.svg';
import editIcon from '../assets/edit.svg';
import settingIcon from '../assets/setting.svg';

const Deck: React.FC = () => {
  const navigate = useNavigate();
  // 假设有13个卡组
  const decks = Array(13).fill(0).map((_, i) => ({ id: i, name: `卡组${i + 1}` }));
  // 假设当前卡组有12张卡
  const cards = Array(12).fill(0).map((_, i) => ({ id: i, name: `卡牌${i + 1}` }));
  const currentDeckName = "我的卡组1"; // 当前卡组名

  return (
    <div className="relative min-h-screen bg-white overflow-hidden h-screen flex flex-col">
      {/* 顶部栏 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center relative">
        <button
          className="absolute left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
          onClick={() => navigate(-1)}
        >
          返回
        </button>
        <div>我的卡组</div>
      </div>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧卡组区 - 占70%宽度 */}
        <div className="flex-[7_7_0%] h-full flex flex-col items-center justify-center bg-white">
          <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* 第一个为添加卡组按钮 */}
              <div className="w-36 h-52 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-3xl font-bold cursor-pointer hover:bg-gray-100">
                +
              </div>
              {/* 后续为卡组格子 */}
              {decks.slice(0, 8).map(deck => (
                <div 
                  key={deck.id} 
                  className="w-36 h-52 border rounded-lg flex items-center justify-center text-gray-700 text-base bg-white shadow"
                >
                  {deck.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧卡牌区 - 占30%宽度 */}
        <div className="flex-[3_3_0%] h-full border-l flex flex-col items-center justify-start pt-4 bg-gray-50">
          <div className="h-12 flex items-center justify-between px-4 border-b">
            <button className="p-1 hover:bg-gray-200 rounded">
              <img src={starIcon} alt="star" className="w-5 h-5" />
            </button>
            <div className="font-medium text-center flex-1">{currentDeckName}</div>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-gray-200 rounded">
                <img src={editIcon} alt="edit" className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <img src={settingIcon} alt="setting" className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full px-4">
            {cards.map(card => (
              <div 
                key={card.id} 
                className="w-16 h-24 border rounded flex items-center justify-center text-gray-500 text-xs bg-white shadow"
              >
                {card.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deck;