import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Card, Deck, ShowCard, DeckCard } from '../types/card';
import axios from 'axios';
import MinusIcon from '../assets/minus.svg';
import PlusIcon from '../assets/plus.svg';
import { API_ENDPOINTS, IMAGE_BASE_URL } from '../constants/api';
import CardFilter from '../components/CardFilter';
import CardList from '../components/CardList';
import DeckView from '../components/DeckView';
import { useImageCache } from '../hooks/useImageCache';

// 声明 Cache API 类型
declare global {
  interface Window {
    caches?: CacheStorage;
  }
}

const CardBrowser: React.FC = () => {
  const { getCachedImage, handleImageLoad } = useImageCache();
  const [keyword, setKeyword] = useState('');
  const [nation, setNation] = useState<any>(null);
  const [clan, setClan] = useState<any>(null);
  const [grade, setGrade] = useState<any>(null);
  const [skill, setSkill] = useState<any>(null);
  const [cardPowerRange, setCardPowerRange] = useState<number[]>([0, 20000]);
  const [shield, setShield] = useState<any>(null);
  const [cardType, setCardType] = useState<any>(null);
  const [triggerType, setTriggerType] = useState<any>(null);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const deckData = location.state?.deck as Deck | undefined;
  const [cachedUrls] = useState<Set<string>>(new Set());
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [modalCardIndex, setModalCardIndex] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'left' | 'right' | null>(null); // 区分左右
  const [modalRarityIndex, setModalRarityIndex] = useState<number>(0); // 当前卡片的稀有度索引
  const [localDeckCards, setLocalDeckCards] = useState(deckData?.deck_cards ? JSON.parse(JSON.stringify(deckData.deck_cards)) : []);
  const [showCards, setShowCards] = useState<ShowCard[]>([]);
  const [saving, setSaving] = useState(false);

  // 获取卡牌数据
  const fetchCards = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.CARDS, {
        params: {
          page: pageNum,
          page_size: 20,
          keyword,
          nation: nation?.value,
          clan: clan?.value,
          grade: grade?.value,
          skill: skill?.value,
          card_power_min: cardPowerRange[0],
          card_power_max: cardPowerRange[1],
          shield: shield?.value,
          card_type: cardType?.value,
          trigger_type: triggerType?.value,
          package: selectedPack?.value
        }
      });
      
      if (pageNum === 1) {
        setCards(response.data);
      } else {
        setCards(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('获取卡牌数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchCards(1);
  }, []);

  // 筛选条件清空
  const handleClear = () => {
    setKeyword('');
    setNation(null);
    setClan(null);
    setGrade(null);
    setSkill(null);
    setCardPowerRange([0, 20000]);
    setShield(null);
    setCardType(null);
    setTriggerType(null);
    setSelectedPack(null);
    setPage(1);
    fetchCards(1);
  };

  // 筛选条件搜索
  const handleSearch = () => {
    setPage(1);
    fetchCards(1);
  };

  // 无限滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCards(nextPage);
    }
  };

  // 在组件卸载时清理URL对象
  useEffect(() => {
    return () => {
      // 清理所有创建的URL对象
      cachedUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [cachedUrls]);

  // 切换卡片函数
  const handlePrev = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! - 1 + cards.length) % cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    } else if (modalType === 'right' && modalCardIndex !== null && deckData?.deck_cards) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! - 1 + deckData.deck_cards.length) % deckData.deck_cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    }
  };
  const handleNext = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! + 1) % cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    } else if (modalType === 'right' && modalCardIndex !== null && deckData?.deck_cards) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! + 1) % deckData.deck_cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    }
  };

  // 切换稀有度图片
  const handleRarityDotClick = (idx: number) => {
    setModalRarityIndex(idx);
  };

  // 当modalType为right且modalCardIndex变化时，确保localDeckCards同步
  useEffect(() => {
    if (modalType === 'right' && deckData?.deck_cards) {
      setLocalDeckCards(JSON.parse(JSON.stringify(deckData.deck_cards)));
    }
  }, [modalType, deckData, isCardModalOpen]);

  // 处理左侧卡片数量变更
  const handleLeftCardQuantityChange = (val: number) => {
    if (modalType === 'left' && modalCardIndex !== null) {
      const card = cards[modalCardIndex];
      const rarity = card.rarity_infos?.[modalRarityIndex];
      if (!rarity) return;

      // 确保数量不小于0
      if (val < 0) val = 0;

      // 在cardsData中查找是否存在该卡片
      const existingCardIndex = cardsData.findIndex(c => c.id === rarity.card_id);
      
      if (existingCardIndex === -1) {
        // 如果不存在，添加新卡片到cardsData
        const newCard = {
          ...card,
          rarity_infos: card.rarity_infos?.map((r, i) => 
            i === modalRarityIndex ? { ...r, quantity: val } : r
          )
        };
        setCardsData(prev => {
          const newCardsData = [...prev, newCard];
          // 同步更新showCards
          const processedCards = newCardsData.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);
          return newCardsData;
        });
      } else {
        // 如果存在，更新对应卡片的quantity
        setCardsData(prev => {
          const next = [...prev];
          const cardRarityIndex = next[existingCardIndex].rarity_infos?.findIndex(
            r => r.card_number === rarity.card_number
          );
          
          if (cardRarityIndex !== undefined && cardRarityIndex !== -1) {
            // 计算当前卡片所有稀有度的数量总和
            const totalQuantity = next[existingCardIndex].rarity_infos?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;
            const currentQuantity = next[existingCardIndex].rarity_infos?.[cardRarityIndex]?.quantity || 0;
            
            // 如果新数量会导致总和超过4，则不允许更新
            if (totalQuantity - currentQuantity + val > 4) {
              alert('一张卡的所有稀有度数量之和不能超过4');
              return next;
            }

            next[existingCardIndex] = {
              ...next[existingCardIndex],
              rarity_infos: next[existingCardIndex].rarity_infos?.map((r, i) => 
                i === cardRarityIndex ? { ...r, quantity: val } : r
              )
            };

            // 如果所有稀有度的数量都为0，则从cardsData中删除该卡片
            const allZero = next[existingCardIndex].rarity_infos?.every(r => (r.quantity || 0) === 0);
            if (allZero) {
              next.splice(existingCardIndex, 1);
            } else if (val === 0) {
              // 如果当前稀有度数量变为0，查找其他非0稀有度并切换
              const newRarityIndex = next[existingCardIndex].rarity_infos?.findIndex(r => (r.quantity || 0) > 0);
              if (newRarityIndex !== undefined && newRarityIndex !== -1) {
                setModalRarityIndex(newRarityIndex);
              }
            }
          }

          // 同步更新showCards
          const processedCards = next.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);

          // 如果cardsData为空，关闭窗口
          if (next.length === 0) {
            setIsCardModalOpen(false);
          }

          return next;
        });
      }
    }
  };

  // 获取第一个quantity不为0的card_rarity索引
  const getFirstNonZeroRarityIndex = (card: ShowCard) => {
    const index = card.card_rarity.findIndex(r => (r.quantity || 0) > 0);
    return index !== -1 ? index : 0;
  };

  // 处理右侧卡片数量变更
  const handleRightCardQuantityChange = (val: number) => {
    if (modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex]) {
      const card = showCards[modalCardIndex];
      const rarity = card.card_rarity[modalRarityIndex];
      
      // 确保数量不小于0
      if (val < 0) val = 0;

      // 在cardsData中查找是否存在该卡片
      const existingCardIndex = cardsData.findIndex(c => c.id === card.id);
      
      if (existingCardIndex === -1) {
        // 如果不存在，添加新卡片到cardsData
        const newCard = {
          ...card,
          rarity_infos: card.rarity_infos?.map((r, i) => 
            i === modalRarityIndex ? { ...r, quantity: val } : r
          )
        };
        setCardsData(prev => {
          const newCardsData = [...prev, newCard];
          // 同步更新showCards
          const processedCards = newCardsData.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);
          return newCardsData;
        });
      } else {
        // 如果存在，更新对应卡片的quantity
        setCardsData(prev => {
          const next = [...prev];
          const cardRarityIndex = next[existingCardIndex].rarity_infos?.findIndex(
            r => r.card_number === rarity.card_number
          );
          
          if (cardRarityIndex !== undefined && cardRarityIndex !== -1) {
            // 计算当前卡片所有稀有度的数量总和
            const totalQuantity = next[existingCardIndex].rarity_infos?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;
            const currentQuantity = next[existingCardIndex].rarity_infos?.[cardRarityIndex]?.quantity || 0;
            
            // 如果新数量会导致总和超过4，则不允许更新
            if (totalQuantity - currentQuantity + val > 4) {
              alert('一张卡的所有稀有度数量之和不能超过4');
              return next;
            }

            next[existingCardIndex] = {
              ...next[existingCardIndex],
              rarity_infos: next[existingCardIndex].rarity_infos?.map((r, i) => 
                i === cardRarityIndex ? { ...r, quantity: val } : r
              )
            };

            // 如果所有稀有度的数量都为0，则从cardsData中删除该卡片
            const allZero = next[existingCardIndex].rarity_infos?.every(r => (r.quantity || 0) === 0);
            if (allZero) {
              next.splice(existingCardIndex, 1);
            } else if (val === 0) {
              // 如果当前稀有度数量变为0，查找其他非0稀有度并切换
              const newRarityIndex = next[existingCardIndex].rarity_infos?.findIndex(r => (r.quantity || 0) > 0);
              if (newRarityIndex !== undefined && newRarityIndex !== -1) {
                setModalRarityIndex(newRarityIndex);
              }
            }
          }

          // 同步更新showCards
          const processedCards = next.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);

          // 如果cardsData为空，关闭窗口
          if (next.length === 0) {
            setIsCardModalOpen(false);
          }

          return next;
        });
      }
    }
  };

  const handleMinus = () => {
    if (modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex]) {
      const cur = showCards[modalCardIndex].card_rarity[modalRarityIndex]?.quantity || 0;
      if (cur > 0) handleRightCardQuantityChange(cur - 1);
    }
  };

  const handlePlus = () => {
    if (modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex]) {
      const cur = showCards[modalCardIndex].card_rarity[modalRarityIndex]?.quantity || 0;
      handleRightCardQuantityChange(cur + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    handleRightCardQuantityChange(val);
  };

  // 获取左侧卡片在cardsData中的数量
  const getLeftCardQuantity = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      const card = cards[modalCardIndex];
      const rarity = card.rarity_infos?.[modalRarityIndex];
      if (!rarity) return 0;
      
      const existingCard = cardsData.find(c => c.id === rarity.card_id);
      if (existingCard) {
        const cardRarity = existingCard.rarity_infos?.find(r => r.card_number === rarity.card_number);
        return cardRarity?.quantity || 0;
      }
    }
    return 0;
  };

  const handleLeftCardMinus = () => {
    const cur = getLeftCardQuantity();
    console.log('点击减号按钮时的cardsData:', {
      currentQuantity: cur,
      cards: cards,
      cardsData: cardsData,
      deckData: deckData
    });
    if (cur > 0) handleLeftCardQuantityChange(cur - 1);
  };

  const handleLeftCardPlus = () => {
    const cur = getLeftCardQuantity();
    console.log('点击加号按钮时的cardsData:', {
      currentQuantity: cur,
      cards: cards,
      cardsData: cardsData,
      deckData: deckData
    });
    handleLeftCardQuantityChange(cur + 1);
  };

  const handleLeftCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    console.log('输入框改变时的cardsData:', {
      inputValue: val,
      cards: cards,
      cardsData: cardsData,
      deckData: deckData
    });
    handleLeftCardQuantityChange(val);
  };

  // 获取并整理卡片数据
  const fetchAndProcessCards = async () => {
    if (!deckData?.deck_cards || deckData.deck_cards.length === 0) {
      setCardsData([]);
      setShowCards([]);
      return;
    }
    
    try {
      // 获取所有唯一的card_id
      const uniqueCardIds = [...new Set(deckData.deck_cards.map((dc: DeckCard) => dc.card_id))];
      
      if (uniqueCardIds.length === 0) {
        setCardsData([]);
        setShowCards([]);
        return;
      }

      // 调用API获取卡片数据
      const response = await axios.get(`${API_ENDPOINTS.CARDS}/${uniqueCardIds.join(',')}`);
      
      const newCardsData = response.data;
      
      // 处理卡片数据，添加quantity属性
      const processedCards = newCardsData.map((card: Card) => {
        // 找到所有相同card_id的deck_cards
        const deckCards = deckData.deck_cards.filter((dc: DeckCard) => dc.card_id === card.id);
        
        // 为每个rarity添加quantity
        const processedRarities = card.rarity_infos?.map(rarity => {
          const deckCard = deckCards.find((dc: DeckCard) => dc.image === rarity.card_number);
          return {
            ...rarity,
            quantity: deckCard?.quantity || 0
          };
        }) || [];

        return {
          ...card,
          card_rarity: processedRarities
        };
      });

      // 设置cardsData，保持原有的quantity信息
      setCardsData(newCardsData.map((card: Card) => {
        const processedCard = processedCards.find((pc: ShowCard) => pc.id === card.id);
        if (processedCard) {
          return {
            ...card,
            rarity_infos: card.rarity_infos?.map((rarity: any) => {
              const processedRarity = processedCard.card_rarity.find((pr: { card_number: string }) => pr.card_number === rarity.card_number);
              return {
                ...rarity,
                quantity: processedRarity?.quantity || 0
              };
            })
          };
        }
        return card;
      }));

      // 设置showCards
      setShowCards(processedCards);
    } catch (error) {
      console.error('获取卡片数据失败:', error);
      setCardsData([]);
      setShowCards([]);
    }
  };

  // 当deckData变化时重新获取数据
  useEffect(() => {
    fetchAndProcessCards();
  }, [deckData]);

  // 保存卡组数据
  const handleSaveDeck = async () => {
    if (!deckData?.id) {
      alert('卡组ID不存在');
      return;
    }

    try {
      setSaving(true);
      
      // 从cardsData中获取deck_cards数据
      const deckCards = cardsData.flatMap(card => 
        card.rarity_infos?.filter(rarity => (rarity.quantity || 0) > 0).map((rarity, index) => ({
          card_id: card.id,
          image: rarity.card_number,
          quantity: rarity.quantity || 0,
          deck_zone: 'main',
          position: index,
          remark: '',
          deck_id: deckData.id
        })) || []
      );

      // 添加调试信息
      console.log('保存卡组时的数据:', {
        deckData: {
          id: deckData.id,
          deck_name: deckData.deck_name,
          deck_version: deckData.deck_version,
          deck_cards_count: deckData.deck_cards?.length
        },
        cardsData: {
          total_cards: cardsData.length,
          cards_with_quantity: cardsData.filter(card => 
            card.rarity_infos?.some(rarity => (rarity.quantity || 0) > 0)
          ).length
        },
        processedDeckCards: {
          total: deckCards.length,
          by_card_id: deckCards.reduce((acc, card) => {
            acc[card.card_id] = (acc[card.card_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          details: deckCards.map(card => ({
            card_id: card.card_id,
            image: card.image,
            quantity: card.quantity,
            deck_zone: card.deck_zone
          }))
        }
      });

      // 准备请求数据
      const requestData = {
        deck_name: deckData.deck_name,
        deck_description: deckData.deck_description || '',
        is_public: deckData.is_public || false,
        is_official: deckData.is_official || false,
        preset: deckData.preset || -1,
        deck_version: (deckData.deck_version || 0) + 1,
        remark: deckData.remark || '',
        deck_cards: deckCards
      };

      // 调用保存接口
      await axios.put(`${API_ENDPOINTS.DECKS}/${deckData.id}`, requestData);
      
      alert('保存成功');
      navigate('/deck');
    } catch (error) {
      console.error('保存卡组失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden h-screen flex flex-col">
      {/* 顶部卡组名 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center">
        {deckData?.deck_name || '卡组名预留'}
      </div>

      {/* 返回按钮 */}
      <button
        className="absolute top-3 left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
        onClick={() => navigate('/deck')}
      >返回</button>

      {/* 筛选条件 */}
      <CardFilter
        keyword={keyword}
        setKeyword={setKeyword}
        nation={nation}
        setNation={setNation}
        clan={clan}
        setClan={setClan}
        grade={grade}
        setGrade={setGrade}
        skill={skill}
        setSkill={setSkill}
        cardPowerRange={cardPowerRange}
        setCardPowerRange={setCardPowerRange}
        shield={shield}
        setShield={setShield}
        cardType={cardType}
        setCardType={setCardType}
        triggerType={triggerType}
        setTriggerType={setTriggerType}
        selectedPack={selectedPack}
        setSelectedPack={setSelectedPack}
        onClear={handleClear}
        onSearch={handleSearch}
        onSave={handleSaveDeck}
        saving={saving}
      />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧卡牌列表 */}
        <CardList
          cards={cards}
          loading={loading}
          hasMore={hasMore}
          onScroll={handleScroll}
          onCardClick={(idx) => {
            setModalCardIndex(idx);
            setModalType('left');
            setIsCardModalOpen(true);
          }}
          getCachedImage={getCachedImage}
        />

        {/* 右侧卡组展示 */}
        <DeckView
          showCards={showCards}
          onCardClick={(idx) => {
            setModalCardIndex(idx);
            setModalType('right');
            setIsCardModalOpen(true);
            // 设置初始稀有度索引为第一个非0稀有度
            setModalRarityIndex(getFirstNonZeroRarityIndex(showCards[idx]));
          }}
        />
      </div>

      {/* 弹窗 */}
      {isCardModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsCardModalOpen(false)}
        >
          <div
            className="relative flex flex-col items-center"
            style={{ minWidth: 400, minHeight: 400 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 左箭头SVG，极窄宽度，贴边 */}
            <button
              className="fixed left-2 top-1/2 -translate-y-1/2 z-50 p-0 bg-transparent border-none outline-none flex items-center justify-center"
              style={{width:'40px',height:'80px'}}
              onClick={handlePrev}
            >
              <svg width="32" height="80" viewBox="0 0 32 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="28,8 4,40 28,72" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* 中间大卡片 */}
            <div
              className="flex flex-col items-center justify-center relative select-none bg-white rounded-lg border border-gray-200"
              style={{width:'420px',minHeight:'600px'}}
            >
              <div
                className="flex items-center justify-center relative select-none p-4"
                style={{width:'420px',height:'540px'}}
              >
                {/* 展示卡片内容 */}
                {modalType === 'left' && modalCardIndex !== null && cards[modalCardIndex] && (
                  cards[modalCardIndex].rarity_infos?.length > 0 ? (
                    <div className="relative w-full h-full">
                      {/* 稀有度切换按钮 - 左 */}
                      {cards[modalCardIndex].rarity_infos.length > 1 && (
                        <button
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-r-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                          onClick={() => setModalRarityIndex((prev) => (prev - 1 + cards[modalCardIndex].rarity_infos.length) % cards[modalCardIndex].rarity_infos.length)}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      <img
                        src={`${IMAGE_BASE_URL}/${cards[modalCardIndex].rarity_infos[modalRarityIndex]?.card_number}.jpg`}
                        alt={cards[modalCardIndex].name_cn}
                        className="w-full h-full object-contain"
                        style={{boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}
                        onLoad={handleImageLoad}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.classList.add('text-center');
                        }}
                      />
                      {/* 稀有度切换按钮 - 右 */}
                      {cards[modalCardIndex].rarity_infos.length > 1 && (
                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-l-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                          onClick={() => setModalRarityIndex((prev) => (prev + 1) % cards[modalCardIndex].rarity_infos.length)}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {/* 分页点放在图片底部 */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {cards[modalCardIndex].rarity_infos.map((_, i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full inline-block cursor-pointer ${i === modalRarityIndex ? 'bg-black' : 'bg-gray-300'}`}
                            onClick={() => handleRarityDotClick(i)}
                          ></span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="font-bold">{cards[modalCardIndex].name_cn}</div>
                      <div className="text-xs mt-1">{cards[modalCardIndex].card_type}</div>
                      <div className="text-xs mt-1">{cards[modalCardIndex].card_power}</div>
                    </div>
                  )
                )}
                {modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex] && (
                  <div className="relative w-full h-full">
                    {/* 稀有度切换按钮 - 左 */}
                    {showCards[modalCardIndex].card_rarity.length > 1 && (
                      <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-r-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                        onClick={() => setModalRarityIndex((prev) => (prev - 1 + showCards[modalCardIndex].card_rarity.length) % showCards[modalCardIndex].card_rarity.length)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    <img
                      src={`${IMAGE_BASE_URL}/${showCards[modalCardIndex].card_rarity[modalRarityIndex]?.card_number}.jpg`}
                      alt={showCards[modalCardIndex].name_cn}
                      className="w-full h-full object-contain"
                      style={{boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.classList.add('text-center');
                      }}
                    />
                    {/* 稀有度切换按钮 - 右 */}
                    {showCards[modalCardIndex].card_rarity.length > 1 && (
                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-l-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                        onClick={() => setModalRarityIndex((prev) => (prev + 1) % showCards[modalCardIndex].card_rarity.length)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    {/* 分页点放在图片底部 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {showCards[modalCardIndex].card_rarity.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full inline-block cursor-pointer ${i === modalRarityIndex ? 'bg-black' : 'bg-gray-300'}`}
                          onClick={() => handleRarityDotClick(i)}
                        ></span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* 底部按钮 */}
              <div className="flex items-center justify-center py-4 gap-8">
                {/* 左侧卡牌弹窗底部按钮 */}
                {modalType === 'left' && (
                  <>
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleLeftCardMinus}>
                      <img src={MinusIcon} alt="minus" className="w-8 h-8" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={getLeftCardQuantity()}
                      onChange={handleLeftCardInputChange}
                      className="w-10 text-center border rounded mx-2"
                      style={{fontSize:'1rem'}}
                    />
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleLeftCardPlus}>
                      <img src={PlusIcon} alt="plus" className="w-8 h-8" />
                    </button>
                  </>
                )}
                {/* 右侧卡组卡数量输入和加减按钮 */}
                {modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex] && (
                  <>
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleMinus}>
                      <img src={MinusIcon} alt="minus" className="w-8 h-8" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={showCards[modalCardIndex].card_rarity[modalRarityIndex]?.quantity || 0}
                      onChange={handleInputChange}
                      className="w-10 text-center border rounded mx-2"
                      style={{fontSize:'1rem'}}
                    />
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handlePlus}>
                      <img src={PlusIcon} alt="plus" className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* 右箭头SVG，极窄宽度，贴边 */}
            <button
              className="fixed right-2 top-1/2 -translate-y-1/2 z-50 p-0 bg-transparent border-none outline-none flex items-center justify-center"
              style={{width:'40px',height:'80px'}}
              onClick={handleNext}
            >
              <svg width="32" height="80" viewBox="0 0 32 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="4,8 28,40 4,72" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardBrowser;