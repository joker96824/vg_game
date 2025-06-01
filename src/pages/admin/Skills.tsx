import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import JsonEditor from '../../components/JsonEditor';
import { getCardsList, saveCardAbility } from '../../services/cardService';
import { Card } from '../../types/card';

interface AbilityInfo {
  id: string;
  ability_desc: string;
  ability: Record<string, any>;
}

interface CardWithAbilities extends Card {
  ability_infos: AbilityInfo[];
}

const Skills: React.FC = () => {
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState<any>({
    id: "1"
  });
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [cards, setCards] = useState<CardWithAbilities[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardWithAbilities[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSpecialSkills, setShowSpecialSkills] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCardElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      console.log('Intersection observed:', entries[0].isIntersecting);
      console.log('Has more:', hasMore);
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCards();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const loadMoreCards = async () => {
    if (isLoading || !hasMore) {
      console.log('Skipping load more:', { isLoading, hasMore });
      return;
    }
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      console.log('Loading page:', nextPage);
      const response = await getCardsList({ page: nextPage, pageSize: 100 });
      if (response && response.cards) {
        const newCards = response.cards as CardWithAbilities[];
        console.log('New cards loaded:', newCards.length);
        // 根据总数和当前加载的总数量判断是否还有更多
        const total = response.total || 0;
        const currentTotal = cards.length + newCards.length;
        setHasMore(currentTotal < total);
        
        if (newCards.length > 0) {
          setCards(prev => {
            const updatedCards = [...prev, ...newCards];
            filterCards(updatedCards, searchText, showSpecialSkills);
            return updatedCards;
          });
          setPage(nextPage);
        }
      }
    } catch (error) {
      console.error('加载更多卡片失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await getCardsList({ page: 1, pageSize: 100 });
      if (response && response.cards) {
        const cardsWithAbilities = response.cards as CardWithAbilities[];
        setCards(cardsWithAbilities);
        // 根据总数和当前加载的数量判断是否还有更多
        const total = response.total || 0;
        setHasMore(cardsWithAbilities.length < total);
        setPage(1);
        filterCards(cardsWithAbilities, searchText, showSpecialSkills);
      }
    } catch (error) {
      console.error('获取技能列表失败:', error);
    }
  };

  const filterCards = (cardsToFilter: CardWithAbilities[], search: string, showSpecial: boolean) => {
    let filtered = cardsToFilter;
    
    // 根据搜索文本过滤
    if (search.trim()) {
      filtered = filtered.filter(card => 
        card.name_cn.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 根据特殊技能开关过滤
    if (!showSpecial) {
      filtered = filtered.filter(card => 
        !card.ability_infos.some(ability => 
          ability.ability && Object.keys(ability.ability).length > 0
        )
      );
    }

    setFilteredCards(filtered);
  };

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

    fetchCards();
  }, [navigate]);

  useEffect(() => {
    if (cards.length > 0) {
      filterCards(cards, searchText, showSpecialSkills);
    }
  }, [searchText, showSpecialSkills, cards]);

  const handleSearch = () => {
    filterCards(cards, searchText, showSpecialSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchText('');
  };

  const toggleCard = (cardName: string) => {
    setExpandedCard(expandedCard === cardName ? null : cardName);
  };

  const handleAbilityClick = (ability: AbilityInfo) => {
    if (ability.ability) {
      setJsonData(ability.ability);
      setSelectedCardId(ability.id);
    }
  };

  const handleJsonChange = (newData: any) => {
    setJsonData(newData);
  };

  const handleSave = async () => {
    if (!selectedCardId) {
      alert('请先选择一个技能');
      return;
    }

    setIsSaving(true);
    try {
      await saveCardAbility(selectedCardId, jsonData);
      alert('保存成功');
      // 重新加载数据
      fetchCards();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-6">
          <button
            onClick={() => navigate('/')}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-center">技能配置</h1>
          <button
            onClick={() => setShowSpecialSkills(!showSpecialSkills)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 rounded text-sm ${
              showSpecialSkills 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600' 
            }`}
          >
            {showSpecialSkills ? '显示已完成技能' : '隐藏已完成技能'}
          </button>
        </div>

        <div className="flex gap-6">
          {/* 左侧部分 */}
          <div className="w-2/5 bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-medium mb-4">技能列表</h2>
            
            {/* 搜索部分 */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="搜索技能名称"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
                {searchText && (
                  <button
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? '搜索中...' : '搜索'}
              </button>
            </div>

            {/* 技能列表 */}
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {filteredCards.map((card, index) => (
                <div 
                  key={card.name_cn} 
                  className="border border-gray-200 rounded"
                  ref={index === filteredCards.length - 1 ? lastCardElementRef : undefined}
                >
                  <div
                    onClick={() => toggleCard(card.name_cn)}
                    className="p-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm"
                  >
                    <span className="truncate flex-1 mr-2">{card.name_cn}</span>
                    <span className="text-gray-500 flex-shrink-0">
                      {expandedCard === card.name_cn ? '▼' : '▶'}
                    </span>
                  </div>
                  {expandedCard === card.name_cn && card.ability_infos && (
                    <div className="border-t border-gray-200">
                      {card.ability_infos.map((ability, index) => (
                        <div
                          key={index}
                          onClick={() => handleAbilityClick(ability)}
                          className={`p-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer ${
                            ability.ability ? 'text-blue-600' : ''
                          }`}
                        >
                          {ability.ability_desc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧部分 */}
          <div className="flex-1 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">JSON 编辑器</h2>
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedCardId}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
            <JsonEditor
              data={jsonData}
              onChange={handleJsonChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills; 