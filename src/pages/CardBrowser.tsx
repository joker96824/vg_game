import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Card, Deck, ShowCard, DeckCard, RarityInfo } from '../types/card';
import MinusIcon from '../assets/minus.svg';
import PlusIcon from '../assets/plus.svg';
import { IMAGE_BASE_URL } from '../constants/api';
import CardFilter from '../components/CardFilter';
import CardList from '../components/CardList';
import DeckView from '../components/DeckView';
import { useImageCache } from '../hooks/useImageCache';
import { getCards, getCardsByIds } from '../services/cardService';
import { saveDeck } from '../services/deckService';
import { validateDeck, validateCards } from '../utils/deckValidator';
import warningIcon from '../assets/warning.svg';

// 扩展 RarityInfo 类型
interface ExtendedRarityInfo extends RarityInfo {
  deck_zone: string;
  quantity: number;
}

// 扩展 Card 类型
interface ExtendedCard extends Omit<Card, 'rarity_infos'> {
  rarity_infos: ExtendedRarityInfo[];
}

// 扩展 ShowCard 类型
interface ExtendedShowCard extends Omit<ShowCard, 'card_rarity'> {
  card_rarity: {
    card_number: string;
    quantity: number;
  }[];
}

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
  const [mainCards, setMainCards] = useState<ExtendedCard[]>([]);
  const [rideCards, setRideCards] = useState<ExtendedCard[]>([]);
  const [GCards, setGCards] = useState<ExtendedCard[]>([]);
  const [tokenCards, setTokenCards] = useState<ExtendedCard[]>([]);
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
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'ride' | 'main' | 'g' | 'token'>('main');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [displayDeckName, setDisplayDeckName] = useState('');
  const [deckValidationErrors, setDeckValidationErrors] = useState<string[]>([]);

  // 导航标签配置
  const tabs = [
    { id: 'ride', label: '骑升' },
    { id: 'main', label: '主卡组' },
    { id: 'g', label: 'G区' },
    { id: 'token', label: '衍生' }
  ] as const;

  // 获取卡牌数据
  const fetchCards = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await getCards({
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
      });
      
      if (pageNum === 1) {
        setCards(response);
      } else {
        setCards(prev => [...prev, ...response]);
      }
      
      setHasMore(response.length === 20);
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

  // 显示提示信息
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 处理返回按钮点击
  const handleBackClick = () => {
    if (mainCards.length > 0) {
      if (window.confirm('是否保存当前卡组？')) {
        handleSaveDeck();
      } else {
        navigate('/deck');
      }
    } else {
      navigate('/deck');
    }
  };

  // 获取卡片在所有区域中的总数量
  const getCardTotalQuantity = (cardId: string, cardNumber: string, excludeZone?: string): number => {
    let total = 0;
    
    // 从mainCards中获取数量
    const mainCard = mainCards.find(c => c.id === cardId);
    if (mainCard && excludeZone !== 'main') {
      const mainQuantity = mainCard.rarity_infos.reduce((sum, r) => sum + r.quantity, 0);
      total += mainQuantity;
    }

    // 从rideCards中获取数量
    const rideCard = rideCards.find(c => c.id === cardId);
    if (rideCard && excludeZone !== 'ride') {
      const rideQuantity = rideCard.rarity_infos.reduce((sum, r) => sum + r.quantity, 0);
      total += rideQuantity;
    }

    // 从GCards中获取数量（只在g区时计算）
    if (excludeZone === 'g') {
      const gCard = GCards.find(c => c.id === cardId);
      if (gCard) {
        const gQuantity = gCard.rarity_infos.reduce((sum, r) => sum + r.quantity, 0);
        total += gQuantity;
      }
    }

    // token区不计算数量限制

    return total;
  };


  // 获取卡片在当前区域中所有稀有度的总数量
  const getCurrentZoneTotalQuantity = (card: ExtendedCard): number => {
    return card.rarity_infos.reduce((sum, r) => sum + r.quantity, 0);
  };

  // 处理左侧卡片数量变更
  const handleLeftCardQuantityChange = (val: number) => {
    if (modalType === 'left' && modalCardIndex !== null) {
      const card = cards[modalCardIndex];
      const rarity = card.rarity_infos?.[modalRarityIndex];
      if (!rarity) return;

      // 确保数量不小于0
      if (val < 0) val = 0;

      // 根据当前区域选择对应的卡片状态
      const getCurrentCards = () => {
        switch (activeTab) {
          case 'ride':
            return { cards: rideCards, setCards: setRideCards, zone: 'ride' as const };
          case 'main':
            return { cards: mainCards, setCards: setMainCards, zone: 'main' as const };
          case 'g':
            return { cards: GCards, setCards: setGCards, zone: 'g' as const };
          case 'token':
            return { cards: tokenCards, setCards: setTokenCards, zone: 'token' as const };
          default:
            return { cards: mainCards, setCards: setMainCards, zone: 'main' as const };
        }
      };

      const { cards: currentCards, setCards: setCurrentCards, zone } = getCurrentCards();

      // 在当前区域的卡片中查找是否存在该卡片
      const existingCardIndex = currentCards.findIndex(c => c.id === rarity.card_id);
      
      if (existingCardIndex === -1) {
        // 如果不存在，先检查数量限制
        const otherZonesQuantity = getCardTotalQuantity(rarity.card_id, rarity.card_number, zone);
        
        // 如果新数量会导致总和超过4，则不允许添加
        if (otherZonesQuantity + val > 4) {
          showToastMessage('一张卡在卡组和骑升区的数量之和不能超过4');
          return;
        }

        // 如果数量符合限制，添加新卡片到当前区域
        const newCard: ExtendedCard = {
          ...card,
          rarity_infos: card.rarity_infos?.map((r, i) => ({
            ...r,
            quantity: i === modalRarityIndex ? val : 0,
            deck_zone: zone
          })) || []
        };
        setCurrentCards(prev => {
          const newCards = [...prev, newCard];
          return newCards;
        });
      } else {
        // 如果存在，更新对应卡片的quantity
        setCurrentCards(prev => {
          const next = [...prev];
          const cardRarityIndex = next[existingCardIndex].rarity_infos.findIndex(
            r => r.card_number === rarity.card_number
          );
          
          if (cardRarityIndex !== -1) {
            // 获取当前卡片在其他区域中的总数量
            const otherZonesQuantity = getCardTotalQuantity(rarity.card_id, rarity.card_number, zone);
            
            // 获取当前卡片在当前区域中其他稀有度的总数量
            const currentZoneOtherRaritiesQuantity = next[existingCardIndex].rarity_infos.reduce((sum, r, i) => 
              i === cardRarityIndex ? sum : sum + r.quantity, 0
            );
            
            // 如果新数量会导致总和超过4，则不允许更新
            if (otherZonesQuantity + currentZoneOtherRaritiesQuantity + val > 4) {
              showToastMessage('一张卡在卡组和骑升区的数量之和不能超过4');
              return next;
            }

            next[existingCardIndex] = {
              ...next[existingCardIndex],
              rarity_infos: next[existingCardIndex].rarity_infos.map((r, i) => 
                i === cardRarityIndex ? { ...r, quantity: val } : r
              )
            };

            // 如果所有稀有度的数量都为0，则从当前区域中删除该卡片
            const allZero = next[existingCardIndex].rarity_infos.every(r => r.quantity === 0);
            if (allZero) {
              next.splice(existingCardIndex, 1);
              console.log('handleRightCardQuantityChange - 删除卡片:', {
                zone,
                remainingCards: next
              });
              // 更新modalCardIndex为前一张卡片
              if (modalCardIndex > 0) {
                setModalCardIndex(modalCardIndex - 1);
                setModalRarityIndex(0);
              } else {
                setIsCardModalOpen(false);
              }
            } else if (val === 0) {
              // 如果当前稀有度数量变为0，查找其他非0稀有度并切换
              const newRarityIndex = next[existingCardIndex].rarity_infos.findIndex(r => r.quantity > 0);
              if (newRarityIndex !== -1) {
                setModalRarityIndex(newRarityIndex);
              }
            }
          }
          return next;
        });
      }
    }
  };

  // 获取第一个quantity不为0的card_rarity索引
  const getFirstNonZeroRarityIndex = (card: Card) => {
    const index = card.rarity_infos?.findIndex(r => (r.quantity || 0) > 0) ?? -1;
    return index !== -1 ? index : 0;
  };

  // 处理右侧卡片数量变更
  const handleRightCardQuantityChange = (val: number) => {
    if (modalType === 'right' && modalCardIndex !== null) {
      // 根据当前区域选择对应的卡片状态
      const getCurrentCards = () => {
        switch (activeTab) {
          case 'ride':
            return { cards: rideCards, setCards: setRideCards, zone: 'ride' as const };
          case 'main':
            return { cards: mainCards, setCards: setMainCards, zone: 'main' as const };
          case 'g':
            return { cards: GCards, setCards: setGCards, zone: 'g' as const };
          case 'token':
            return { cards: tokenCards, setCards: setTokenCards, zone: 'token' as const };
          default:
            return { cards: mainCards, setCards: setMainCards, zone: 'main' as const };
        }
      };

      console.log('handleRightCardQuantityChange - 开始:', {
        val,
        modalCardIndex,
        activeTab,
        currentCards: getCurrentCards().cards
      });

      const { cards: currentCards, setCards: setCurrentCards, zone } = getCurrentCards();
      const card = currentCards[modalCardIndex];
      if (!card) return;

      const rarity = card.rarity_infos[modalRarityIndex];
      
      // 确保数量不小于0
      if (val < 0) val = 0;

      // 在当前区域的卡片中查找是否存在该卡片
      const existingCardIndex = currentCards.findIndex(c => c.id === card.id);
      
      if (existingCardIndex === -1) {
        // 如果不存在，先检查数量限制
        const otherZonesQuantity = getCardTotalQuantity(card.id, rarity.card_number, zone);
        
        // 如果新数量会导致总和超过4，则不允许添加
        if (otherZonesQuantity + val > 4) {
          showToastMessage('一张卡在卡组和骑升区的数量之和不能超过4');
          return;
        }

        // 如果数量符合限制，添加新卡片到当前区域
        const newCard: ExtendedCard = {
          ...card,
          rarity_infos: card.rarity_infos.map((r, i) => ({
            ...r,
            quantity: i === modalRarityIndex ? val : 0,
            deck_zone: zone
          }))
        };
        setCurrentCards(prev => {
          const newCards = [...prev, newCard];
          console.log('handleRightCardQuantityChange - 添加新卡片:', {
            zone,
            newCard,
            newCards
          });
          return newCards;
        });
      } else {
        // 如果存在，更新对应卡片的quantity
        setCurrentCards(prev => {
          const next = [...prev];
          const cardRarityIndex = next[existingCardIndex].rarity_infos.findIndex(
            r => r.card_number === rarity.card_number
          );
          
          if (cardRarityIndex !== -1) {
            // 获取当前卡片在其他区域中的总数量
            const otherZonesQuantity = getCardTotalQuantity(card.id, rarity.card_number, zone);
            
            // 获取当前卡片在当前区域中其他稀有度的总数量
            const currentZoneOtherRaritiesQuantity = next[existingCardIndex].rarity_infos.reduce((sum, r, i) => 
              i === cardRarityIndex ? sum : sum + r.quantity, 0
            );
            
            // 如果新数量会导致总和超过4，则不允许更新
            if (otherZonesQuantity + currentZoneOtherRaritiesQuantity + val > 4) {
              showToastMessage('一张卡在卡组和骑升区的数量之和不能超过4');
              return next;
            }

            console.log('handleRightCardQuantityChange - 更新前:', {
              zone,
              card: next[existingCardIndex],
              rarityIndex: cardRarityIndex,
              currentQuantity: next[existingCardIndex].rarity_infos[cardRarityIndex].quantity,
              newQuantity: val
            });

            next[existingCardIndex] = {
              ...next[existingCardIndex],
              rarity_infos: next[existingCardIndex].rarity_infos.map((r, i) => 
                i === cardRarityIndex ? { ...r, quantity: val } : r
              )
            };

            console.log('handleRightCardQuantityChange - 更新后:', {
              zone,
              card: next[existingCardIndex],
              rarityIndex: cardRarityIndex,
              newQuantity: next[existingCardIndex].rarity_infos[cardRarityIndex].quantity
            });

            // 如果所有稀有度的数量都为0，则从当前区域中删除该卡片
            const allZero = next[existingCardIndex].rarity_infos.every(r => r.quantity === 0);
            if (allZero) {
              next.splice(existingCardIndex, 1);
              console.log('handleRightCardQuantityChange - 删除卡片:', {
                zone,
                remainingCards: next
              });
              // 更新modalCardIndex为前一张卡片
              if (modalCardIndex > 0) {
                setModalCardIndex(modalCardIndex - 1);
                setModalRarityIndex(0);
              } else {
                setIsCardModalOpen(false);
              }
            } else if (val === 0) {
              // 如果当前稀有度数量变为0，查找其他非0稀有度并切换
              const newRarityIndex = next[existingCardIndex].rarity_infos.findIndex(r => r.quantity > 0);
              if (newRarityIndex !== -1) {
                setModalRarityIndex(newRarityIndex);
              }
            }
          }

          return next;
        });
      }
    }
  };

  const handleMinus = () => {
    if (modalType === 'right' && modalCardIndex !== null) {
      const getCurrentCards = () => {
        switch (activeTab) {
          case 'ride':
            return rideCards;
          case 'main':
            return mainCards;
          case 'g':
            return GCards;
          case 'token':
            return tokenCards;
          default:
            return mainCards;
        }
      };
      const currentCards = getCurrentCards();
      if (currentCards[modalCardIndex]) {
        const cur = currentCards[modalCardIndex].rarity_infos[modalRarityIndex].quantity;
        if (cur > 0) {
          // 先更新卡片数量
          const newQuantity = cur - 1;
          handleRightCardQuantityChange(newQuantity);
          
        }
      }
    }
  };

  const handlePlus = () => {
    if (modalType === 'right' && modalCardIndex !== null) {
      const getCurrentCards = () => {
        switch (activeTab) {
          case 'ride':
            return rideCards;
          case 'main':
            return mainCards;
          case 'g':
            return GCards;
          case 'token':
            return tokenCards;
          default:
            return mainCards;
        }
      };

      const currentCards = getCurrentCards();
      if (currentCards[modalCardIndex]) {
        const cur = currentCards[modalCardIndex].rarity_infos[modalRarityIndex].quantity;
        handleRightCardQuantityChange(cur + 1);
      }
    }
  };

  // 获取左侧卡片在当前区域中的数量
  const getLeftCardQuantity = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      const card = cards[modalCardIndex];
      const rarity = card.rarity_infos?.[modalRarityIndex];
      if (!rarity) return 0;
      
      const getCurrentCards = () => {
        switch (activeTab) {
          case 'ride':
            return rideCards;
          case 'main':
            return mainCards;
          case 'g':
            return GCards;
          case 'token':
            return tokenCards;
          default:
            return mainCards;
        }
      };

      const currentCards = getCurrentCards();
      const existingCard = currentCards.find(c => c.id === rarity.card_id);
      if (existingCard) {
        const cardRarity = existingCard.rarity_infos.find(r => r.card_number === rarity.card_number);
        return cardRarity?.quantity || 0;
      }
    }
    return 0;
  };

  const handleLeftCardMinus = () => {
    const cur = getLeftCardQuantity();
    if (cur > 0) handleLeftCardQuantityChange(cur - 1);
  };

  const handleLeftCardPlus = () => {
    const cur = getLeftCardQuantity();
    // 新增：检查当前区域卡片数量限制
    const getCurrentZoneTotalCards = () => {
      switch (activeTab) {
        case 'ride':
          return rideCards.reduce((sum, card) => sum + card.rarity_infos.reduce((s, r) => s + r.quantity, 0), 0);
        case 'main':
          return mainCards.reduce((sum, card) => sum + card.rarity_infos.reduce((s, r) => s + r.quantity, 0), 0);
        case 'g':
          return GCards.reduce((sum, card) => sum + card.rarity_infos.reduce((s, r) => s + r.quantity, 0), 0);
        default:
          return 0;
      }
    };
    const currentZoneTotal = getCurrentZoneTotalCards();
    let zoneLimit = 0;
    switch (activeTab) {
      case 'ride':
        zoneLimit = 4;
        break;
      case 'main':
        zoneLimit = 50;
        break;
      case 'g':
        zoneLimit = 16;
        break;
    }
    if (currentZoneTotal + 1 > zoneLimit) {
      let limitMessage = '';
      switch (activeTab) {
        case 'ride':
          limitMessage = '骑升区最多只能添加4张卡牌';
          break;
        case 'main':
          limitMessage = '主卡组最多只能添加50张卡牌';
          break;
        case 'g':
          limitMessage = 'G区最多只能添加16张卡牌';
          break;
      }
      showToastMessage(limitMessage);
      return;
    }
    // 检查单张卡是否超过4张限制
    const card = cards[modalCardIndex!];
    const rarity = card.rarity_infos?.[modalRarityIndex];
    if (!rarity) return;
    const otherZonesQuantity = getCardTotalQuantity(rarity.card_id, rarity.card_number, activeTab);
    if (otherZonesQuantity + cur + 1 > 4) {
      showToastMessage('一张卡在卡组和骑升区的数量之和不能超过4');
      return;
    }
    handleLeftCardQuantityChange(cur + 1);
  };

  // 获取并整理卡片数据
  const fetchAndProcessCards = async () => {
    if (!deckData?.deck_cards || deckData.deck_cards.length === 0) {
      setMainCards([]);
      setRideCards([]);
      setGCards([]);
      setTokenCards([]);
      return;
    }
    
    try {
      // 获取所有唯一的card_id
      const uniqueCardIds = [...new Set(deckData.deck_cards.map((dc: DeckCard) => dc.card_id))];
      
      if (uniqueCardIds.length === 0) {
        setMainCards([]);
        setRideCards([]);
        setGCards([]);
        setTokenCards([]);
        return;
      }

      // 调用API获取卡片数据
      const newCardsData = await getCardsByIds(uniqueCardIds);
      // 处理卡片数据，添加quantity属性
      const processedCards = newCardsData.map((card: Card): ExtendedCard => {
        // 找到所有相同card_id的deck_cards
        const deckCards = deckData.deck_cards.filter((dc: DeckCard) => dc.card_id === card.id);
        
        // 为每个rarity添加quantity
        const processedRarities = (card.rarity_infos || []).map((rarity: RarityInfo): ExtendedRarityInfo => {
          const deckCard = deckCards.find((dc: DeckCard) => dc.image === rarity.card_number);
          return {
            ...rarity,
            quantity: deckCard?.quantity || 0,
            deck_zone: deckCard?.deck_zone || 'main'
          };
        });

        return {
          ...card,
          rarity_infos: processedRarities
        };
      });

      // 根据区域筛选卡片
      const mainCards = processedCards.filter((card: ExtendedCard) => 
        card.rarity_infos.some((rarity: ExtendedRarityInfo) => rarity.deck_zone === 'main' && rarity.quantity > 0)
      );
      const rideCards = processedCards.filter((card: ExtendedCard) => 
        card.rarity_infos.some((rarity: ExtendedRarityInfo) => rarity.deck_zone === 'ride' && rarity.quantity > 0)
      );
      const GCards = processedCards.filter((card: ExtendedCard) => 
        card.rarity_infos.some((rarity: ExtendedRarityInfo) => rarity.deck_zone === 'g' && rarity.quantity > 0)
      );
      const tokenCards = processedCards.filter((card: ExtendedCard) => 
        card.rarity_infos.some((rarity: ExtendedRarityInfo) => rarity.deck_zone === 'token' && rarity.quantity > 0)
      );

      setMainCards(mainCards);
      setRideCards(rideCards);
      setGCards(GCards);
      setTokenCards(tokenCards);

      console.log('初始化卡片数据:', {
        main: mainCards.length,
        ride: rideCards.length,
        g: GCards.length,
        token: tokenCards.length
      });
    } catch (error) {
      console.error('获取卡片数据失败:', error);
      setMainCards([]);
      setRideCards([]);
      setGCards([]);
      setTokenCards([]);
    }
  };

  // 将 ExtendedCard 转换为 ExtendedShowCard
  const convertToShowCard = (card: ExtendedCard): ExtendedShowCard => ({
    ...card,
    card_rarity: card.rarity_infos.map(rarity => ({
      card_number: rarity.card_number,
      quantity: rarity.quantity
    }))
  });

  // 当deckData变化时重新获取数据
  useEffect(() => {
    fetchAndProcessCards();
  }, [deckData]);

  // 当deckData变化时更新displayDeckName
  useEffect(() => {
    if (deckData) {
      setDisplayDeckName(deckData.deck_name);
    }
  }, [deckData]);

  // 处理卡组名点击
  const handleNameClick = () => {
    if (deckData) {
      setIsEditingName(true);
      setEditingName(displayDeckName);
    }
  };

  // 处理卡组名输入框失焦
  const handleNameBlur = () => {
    if (editingName !== displayDeckName) {
      setDisplayDeckName(editingName);
    }
    setIsEditingName(false);
  };

  // 处理卡组名输入框按键
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingName !== displayDeckName) {
        setDisplayDeckName(editingName);
      }
      setIsEditingName(false);
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditingName(displayDeckName);
    }
  };

  // 修改保存卡组函数
  const handleSaveDeck = async () => {
    if (!deckData?.id) {
      alert('卡组ID不存在');
      return;
    }

    try {
      setSaving(true);
      
      // 从所有卡片中获取deck_cards数据
      const allCards = [...mainCards, ...rideCards, ...GCards, ...tokenCards];
      const deckCards = allCards.flatMap(card => 
        card.rarity_infos?.filter(rarity => (rarity.quantity || 0) > 0).map((rarity, index) => ({
          id: '', // 新建卡牌时不需要id
          card_id: card.id,
          image: rarity.card_number,
          quantity: rarity.quantity || 0,
          deck_zone: rarity.deck_zone || 'main',
          position: index,
          remark: '',
          deck_id: deckData.id,
          create_time: new Date().toISOString(),
          update_time: new Date().toISOString(),
          is_deleted: false
        })) || []
      );

      // 准备请求数据
      const requestData = {
        deck_name: displayDeckName,
        deck_description: deckData.deck_description || '',
        is_public: deckData.is_public || false,
        is_official: deckData.is_official || false,
        preset: deckData.preset || -1,
        deck_version: (deckData.deck_version || 0) + 1,
        remark: deckData.remark || '',
        deck_cards: deckCards
      };

      // 调用保存接口
      await saveDeck(deckData.id, requestData);
      
      alert('保存成功');
      navigate('/deck');
    } catch (error) {
      console.error('保存卡组失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 获取当前区域的卡片
  const getCurrentZoneCards = (): ExtendedCard[] => {
    switch (activeTab) {
      case 'ride':
        return rideCards;
      case 'main':
        return mainCards;
      case 'g':
        return GCards;
      case 'token':
        return tokenCards;
      default:
        return mainCards;
    }
  };

  // 检查卡组合规性
  const validateCurrentDeck = async () => {
    try {
      const validation = await validateCards(mainCards, rideCards, GCards, tokenCards);
      setDeckValidationErrors(validation.errors);
    } catch (error) {
      console.error('检查卡组合规性失败:', error);
      setDeckValidationErrors(['检查卡组合规性失败']);
    }
  };

  // 当卡片数据变化时检查合规性
  useEffect(() => {
    if (deckData) {
      validateCurrentDeck();
    }
  }, [mainCards, rideCards, GCards, tokenCards]);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden h-screen flex flex-col">
      {/* 顶部栏 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center relative">
        <button
          className="absolute left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
          onClick={handleBackClick}
        >
          返回
        </button>
        <div className="flex items-center">
          {isEditingName ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="text-center border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <span 
              className="cursor-pointer hover:text-blue-500"
              onClick={handleNameClick}
            >
              {displayDeckName}
            </span>
          )}
          {deckValidationErrors.length > 0 && (
            <div className="relative group ml-2">
              <img src={warningIcon} alt="warning" className="w-5 h-5" />
              <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-yellow-50 border border-yellow-200 rounded shadow-lg text-red-600 text-sm hidden group-hover:block z-50">
                {deckValidationErrors.map((error, index) => (
                  <div key={index} className="mb-1 last:mb-0">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 提示弹窗 */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg z-50 animate-fade-out">
          {toastMessage}
        </div>
      )}

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
        <div className="w-[30%] flex flex-col border-l">
          {/* 顶部导航栏 */}
          <div className="flex border-b h-8">
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

          <DeckView
            showCards={getCurrentZoneCards().map(convertToShowCard)}
            onCardClick={(idx) => {
              setModalCardIndex(idx);
              setModalType('right');
              setIsCardModalOpen(true);
              setModalRarityIndex(getFirstNonZeroRarityIndex(getCurrentZoneCards()[idx]));
            }}
          />
        </div>
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
                {modalType === 'right' && modalCardIndex !== null && getCurrentZoneCards()[modalCardIndex] && (
                  <div className="relative w-full h-full">
                    {/* 稀有度切换按钮 - 左 */}
                    {getCurrentZoneCards()[modalCardIndex].rarity_infos.length > 1 && (
                      <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-r-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                        onClick={() => setModalRarityIndex((prev) => (prev - 1 + getCurrentZoneCards()[modalCardIndex].rarity_infos.length) % getCurrentZoneCards()[modalCardIndex].rarity_infos.length)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    <img
                      src={`${IMAGE_BASE_URL}/${getCurrentZoneCards()[modalCardIndex].rarity_infos[modalRarityIndex]?.card_number}.jpg`}
                      alt={getCurrentZoneCards()[modalCardIndex].name_cn}
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
                    {getCurrentZoneCards()[modalCardIndex].rarity_infos.length > 1 && (
                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-l-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                        onClick={() => setModalRarityIndex((prev) => (prev + 1) % getCurrentZoneCards()[modalCardIndex].rarity_infos.length)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    {/* 分页点放在图片底部 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {getCurrentZoneCards()[modalCardIndex].rarity_infos.map((_, i) => (
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
                    <div className="w-10 text-center mx-2">
                      {getLeftCardQuantity()}
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleLeftCardPlus}>
                      <img src={PlusIcon} alt="plus" className="w-8 h-8" />
                    </button>
                  </>
                )}
                {/* 右侧卡组卡数量输入和加减按钮 */}
                {modalType === 'right' && modalCardIndex !== null && (
                  <>
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleMinus}>
                      <img src={MinusIcon} alt="minus" className="w-8 h-8" />
                    </button>
                    <div className="w-10 text-center mx-2">
                      {getCurrentZoneCards()[modalCardIndex]?.rarity_infos[modalRarityIndex]?.quantity || 0}
                    </div>
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