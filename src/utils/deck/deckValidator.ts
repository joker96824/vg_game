import { RarityInfo } from '../../types/card';
import { Deck, DeckCard } from '../../types/deck';
import { CARD_LIMITS, DeckZone } from '../../constants/deck';
import { getCardsByIds } from '../../services/cardService';

// 扩展 RarityInfo 类型
interface ExtendedRarityInfo extends RarityInfo {
  deck_zone: string;
  quantity: number;
}

// 扩展 Card 类型
interface ExtendedCard {
  id: string;
  rarity_infos: ExtendedRarityInfo[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 检查卡组是否合规
 * @param deck 要检查的卡组
 * @returns 检查结果，包含是否合规和错误信息
 */
export const validateDeck = async (deck: Deck): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  // 按区域统计卡片数量
  const cardCounts: Record<DeckZone, number> = {
    ride: 0,
    main: 0,
    g: 0,
    token: 0
  };

  // 获取各区域的卡片
  const rideCards: DeckCard[] = [];
  const mainCards: DeckCard[] = [];
  
  deck.deck_cards?.forEach(card => {
    if (card.deck_zone && card.quantity) {
      cardCounts[card.deck_zone as DeckZone] += card.quantity;
      
      // 收集骑升区和主卡组的卡片
      if (card.deck_zone === 'ride') {
        rideCards.push(card);
      } else if (card.deck_zone === 'main') {
        mainCards.push(card);
      }
    }
  });

  // 1. 检查骑升区数量
  if (cardCounts['ride'] !== 4) {
    errors.push(`骑升区必须有4张卡，当前有${cardCounts['ride']}张`);
  }

  // 2. 检查主卡组数量
  if (cardCounts['main'] !== 50) {
    errors.push(`主卡组必须有50张卡，当前有${cardCounts['main']}张`);
  }

  // 3. 检查G区数量
  if (cardCounts['g'] > 16) {
    errors.push(`G区最多有16张卡，当前有${cardCounts['g']}张`);
  }

  // 获取所有需要检查的卡片ID
  const cardIds = [...rideCards, ...mainCards].map(card => card.card_id);

  try {
    // 获取卡片详细信息
    const cards = await getCardsByIds(cardIds);
    const cardMap = new Map(cards.map(card => [card.id, card]));

    // 4. 检查骑升区等级
    if (rideCards.length === 4) {
      const grades = rideCards
        .map(card => cardMap.get(card.card_id)?.grade || 0)
        .sort((a, b) => a - b);
      const expectedGrades = [0, 1, 2, 3];
      
      if (!grades.every((grade, index) => grade === expectedGrades[index])) {
        errors.push('骑升轴必须包含等级为0、1、2、3的卡各一张');
      }
    }
    else if(cardCounts['ride'] === 4) {
      errors.push('骑升轴必须包含等级为0、1、2、3的卡各一张');
    }

    // 5. 检查国家一致性
    const rideNations = new Set(
      rideCards
        .map(card => cardMap.get(card.card_id)?.nation)
        .filter(Boolean)
    );
    const mainNations = new Set(
      mainCards
        .map(card => cardMap.get(card.card_id)?.nation)
        .filter(Boolean)
    );
    
    if (rideNations.size > 0 && mainNations.size > 0) {
      const allNations = new Set([...rideNations, ...mainNations]);
      if (allNations.size > 1) {
        errors.push('骑升轴和主卡组的卡必须属于同一个国家');
      }
    }
  } catch (error) {
    console.error('获取卡片信息失败:', error);
    errors.push('获取卡片信息失败，无法完成合规性检查');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 获取卡组中某个区域的卡片数量
 * @param deck 卡组
 * @param zone 区域
 * @returns 该区域的卡片数量
 */
export const getZoneCardCount = (deck: Deck, zone: DeckZone): number => {
  return deck.deck_cards?.reduce((count, card) => {
    return card.deck_zone === zone ? count + (card.quantity || 0) : count;
  }, 0) || 0;
};

/**
 * 检查某个区域是否已满
 * @param deck 卡组
 * @param zone 区域
 * @returns 是否已满
 */
export const isZoneFull = (deck: Deck, zone: DeckZone): boolean => {
  const count = getZoneCardCount(deck, zone);
  const limit = CARD_LIMITS[zone.toUpperCase() as keyof typeof CARD_LIMITS];
  return count >= limit;
};

/**
 * 直接使用卡片数据检查卡组合规性
 * @param mainCards 主卡组卡片
 * @param rideCards 骑升区卡片
 * @param GCards G区卡片
 * @param tokenCards 衍生区卡片
 * @returns 返回验证结果和错误信息
 */
export const validateCards = async (
  mainCards: ExtendedCard[],
  rideCards: ExtendedCard[],
  GCards: ExtendedCard[],
  tokenCards: ExtendedCard[]
): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // 1. 检查骑升区数量
  const rideCount = rideCards.reduce((sum, card) => 
    sum + card.rarity_infos.reduce((s, r) => s + r.quantity, 0), 0
  );
  if (rideCount !== 4) {
    errors.push(`骑升区必须有4张卡，当前有${rideCount}张`);
  }

  // 2. 检查主卡组数量
  const mainCount = mainCards.reduce((sum, card) => 
    sum + card.rarity_infos.reduce((s, r) => s + r.quantity, 0), 0
  );
  if (mainCount !== 50) {
    errors.push(`主卡组必须有50张卡，当前有${mainCount}张`);
  }

  const gCount = GCards.reduce((sum, card) => 
    sum + card.rarity_infos.reduce((s, r) => s + r.quantity, 0), 0
  );
  if (gCount > 16) {
    errors.push(`G区最多有16张卡，当前有${gCount}张`);
  }

  // 获取所有需要检查的卡片ID
  const cardIds = [...rideCards, ...mainCards].map(card => card.id);

  try {
    // 获取卡片详细信息
    const cards = await getCardsByIds(cardIds);
    const cardMap = new Map(cards.map(card => [card.id, card]));

    // 4. 检查骑升区等级
    if (rideCards.length > 0) {
      const grades = rideCards
        .map(card => cardMap.get(card.id)?.grade || 0)
        .sort((a, b) => a - b);
      const expectedGrades = [0, 1, 2, 3];
      
      if (!grades.every((grade, index) => grade === expectedGrades[index] && grades.length === 4)) {
        errors.push('骑升轴必须包含等级为0、1、2、3的卡各一张');
      }
    }

    // 5. 检查国家一致性
    const rideNations = new Set(
      rideCards
        .map(card => cardMap.get(card.id)?.nation)
        .filter(Boolean)
    );
    const mainNations = new Set(
      mainCards
        .map(card => cardMap.get(card.id)?.nation)
        .filter(Boolean)
    );
    
    if (rideNations.size > 0 && mainNations.size > 0) {
      const allNations = new Set([...rideNations, ...mainNations]);
      if (allNations.size > 1) {
        errors.push('骑升轴和主卡组的卡必须属于同一个国家');
      }
    }
  } catch (error) {
    console.error('获取卡片信息失败:', error);
    errors.push('获取卡片信息失败，无法完成合规性检查');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 