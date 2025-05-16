import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import starIcon from '../assets/star.svg';
import editIcon from '../assets/edit.svg';
import settingIcon from '../assets/setting.svg';
import axios from 'axios';
import { IMAGE_BASE_URL } from '../constants/api';

interface DeckCard {
  card_rarity_id: string;
  image: string;
  quantity: number;
  deck_zone: string;
}

interface Deck {
  deck_name: string;
  deck_cards: DeckCard[];
}

const Deck: React.FC = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'ride' | 'main' | 'g' | 'token'>('main');

  // 新增导航栏tab配置
  const tabs = [
    { id: 'ride', label: '骑升' },
    { id: 'main', label: '主卡组' },
    { id: 'g', label: 'G区' },
    { id: 'token', label: '衍生' }
  ] as const;

  // 获取卡组列表
  const fetchDecks = async () => {
    try {
      setIsLoadingDecks(true);
      const response = await axios.get('http://118.25.45.131:8000/api/v1/decks', {
        params: {
          user_id: '97e9924a-97b1-41d4-b152-fc45a74bbc17'
        }
      });
      setDecks(response.data);
      // 自动选择第一个卡组
      if (response.data.length > 0) {
        setSelectedDeck(response.data[0]);
      }
    } catch (error) {
      console.error('获取卡组列表失败:', error);
    } finally {
      setIsLoadingDecks(false);
    }
  };

  // 创建新卡组
  const createNewDeck = async () => {
    try {
      const response = await axios.post('http://118.25.45.131:8000/api/v1/decks', {
        deck_name: newDeckName,
        deck_description: newDeckDescription,
        user_id: '97e9924a-97b1-41d4-b152-fc45a74bbc17'
      });
      
      // 刷新卡组列表
      await fetchDecks();
      
      // 重置表单并关闭弹窗
      setNewDeckName('');
      setNewDeckDescription('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('创建卡组失败:', error);
      alert('创建卡组失败，请重试');
    }
  };

  // 获取当前区域的卡片
  const getCurrentZoneCards = (deck: Deck) => {
    if (!deck.deck_cards) return [];
    return deck.deck_cards.filter(card => card.deck_zone === activeTab);
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden h-screen flex flex-col">
      {/* 顶部栏 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center relative">
        <button
          className="absolute left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
          onClick={() => navigate('/')}
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
              <div 
                className="w-36 h-52 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-3xl font-bold cursor-pointer hover:bg-gray-100"
                onClick={() => setIsModalOpen(true)}
              >
                +
              </div>
              {/* 后续为卡组格子 */}
              {isLoadingDecks ? (
                <div className="text-center text-gray-500">加载中...</div>
              ) : (
                decks.map((deck, index) => (
                  <div 
                    key={index}
                    className={`w-36 h-52 border rounded-lg flex items-center justify-center text-gray-700 text-base bg-white shadow ${
                      selectedDeck?.deck_name === deck.deck_name
                        ? 'bg-blue-100 text-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedDeck(deck)}
                  >
                    {deck.deck_name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧卡牌区 - 占30%宽度 */}
        <div className="flex-[3_3_0%] h-full border-l flex flex-col items-center justify-start pt-4 bg-gray-50">
          <div className="h-12 w-full flex items-center justify-between px-4 border-b">
            <div className="flex items-center">
              <button className="p-1 hover:bg-gray-200 rounded">
                <img src={starIcon} alt="star" className="w-5 h-5" />
              </button>
            </div>
            <div className="font-medium text-center flex-1">{selectedDeck?.deck_name || '未选择卡组'}</div>
            <div className="flex gap-2">
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => {
                  if (selectedDeck) {
                    navigate('/cards', { state: { deck: selectedDeck } });
                  } else {
                    alert('请先选择一个卡组');
                  }
                }}
              >
                <img src={editIcon} alt="edit" className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <img src={settingIcon} alt="setting" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 新增：导航栏 */}
          <div className="flex border-b h-8 w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex-1 py-1 text-center text-xs font-medium transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 卡片展示区域 */}
          <div className="grid grid-cols-4 gap-2 w-full px-4 overflow-y-auto">
            {selectedDeck && getCurrentZoneCards(selectedDeck).map((card, index) => (
              <div 
                key={index} 
                className="relative w-16 h-24 border rounded flex items-center justify-center text-gray-500 text-xs bg-white shadow"
              >
                <img
                  src={`${IMAGE_BASE_URL}/${card.image}.jpg`}
                  alt={`Card ${card.card_rarity_id}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('text-center');
                    target.parentElement!.textContent = card.card_rarity_id;
                  }}
                />
                {/* 白色半透明数量条 */}
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 py-0.5">
                  <div className="text-center text-xs font-bold">
                    {card.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 创建卡组弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">创建新卡组</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">卡组名称</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入卡组名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注信息</label>
                <textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={createNewDeck}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deck;