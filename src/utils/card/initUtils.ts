import type { Card, Deck, DeckCard, RarityInfo } from '../../types/card';
import { getCardsByIds } from '../../services/cardService';

// 扩展 RarityInfo 类型
interface ExtendedRarityInfo extends RarityInfo {
  deck_zone: string;
  quantity: number;
}

// 扩展 Card 类型，与 Card.tsx 中的使用保持一致
interface ExtendedCard extends Omit<Card, 'rarity_infos'> {
  rarity_infos: ExtendedRarityInfo[];
}

interface ProcessedCards {
  main: ExtendedCard[];
  ride: ExtendedCard[];
  g: ExtendedCard[];
  token: ExtendedCard[];
}

/**
 * 获取指定区域的唯一卡片ID
 * @param deckCards 卡组中的卡片
 * @param zone 区域
 * @returns 该区域的唯一卡片ID数组
 */
const getUniqueCardIdsByZone = (deckCards: DeckCard[], zone: string): string[] => {
  return [...new Set(
    deckCards
      .filter((dc: DeckCard) => dc.deck_zone === zone)
      .map((dc: DeckCard) => dc.card_id)
  )];
};

/**
 * 处理指定区域的卡片数据
 * @param cards 卡片数据
 * @param deckCards 卡组中的卡片
 * @param zone 区域
 * @returns 处理后的卡片数据
 */
const processCardsByZone = (cards: Card[], deckCards: DeckCard[], zone: string): ExtendedCard[] => {
  return cards.map((card: Card): ExtendedCard => {
    const zoneDeckCards = deckCards.filter(
      (dc: DeckCard) => dc.card_id === card.id && dc.deck_zone === zone
    );
    
    const processedRarities = (card.rarity_infos || []).map((rarity: RarityInfo): ExtendedRarityInfo => {
      const deckCard = zoneDeckCards.find((dc: DeckCard) => dc.image === rarity.card_number);
      return {
        ...rarity,
        quantity: deckCard?.quantity || 0,
        deck_zone: zone
      };
    });

    return {
      ...card,
      rarity_infos: processedRarities
    };
  });
};

/**
 * 初始化卡组中的卡片数据
 * @param deckData 卡组数据
 * @returns 处理后的各区域卡片数据
 */
export const initDeckCards = async (deckData: Deck): Promise<ProcessedCards> => {
  if (!deckData?.deck_cards || deckData.deck_cards.length === 0) {
    return {
      main: [],
      ride: [],
      g: [],
      token: []
    };
  }

  try {
    // 获取各区域的卡片ID
    const mainCardIds = getUniqueCardIdsByZone(deckData.deck_cards, 'main');
    const rideCardIds = getUniqueCardIdsByZone(deckData.deck_cards, 'ride');
    const gCardIds = getUniqueCardIdsByZone(deckData.deck_cards, 'g');
    const tokenCardIds = getUniqueCardIdsByZone(deckData.deck_cards, 'token');

    console.log('各区域的卡片ID:', {
      main: mainCardIds,
      ride: rideCardIds,
      g: gCardIds,
      token: tokenCardIds
    });

    // 获取各区域的卡片数据
    const [mainCardsData, rideCardsData, gCardsData, tokenCardsData] = await Promise.all([
      mainCardIds.length > 0 ? getCardsByIds(mainCardIds) : Promise.resolve([]),
      rideCardIds.length > 0 ? getCardsByIds(rideCardIds) : Promise.resolve([]),
      gCardIds.length > 0 ? getCardsByIds(gCardIds) : Promise.resolve([]),
      tokenCardIds.length > 0 ? getCardsByIds(tokenCardIds) : Promise.resolve([])
    ]);

    console.log('API返回的各区域卡片数据:', {
      main: mainCardsData,
      ride: rideCardsData,
      g: gCardsData,
      token: tokenCardsData
    });

    // 处理各区域的卡片数据
    const processedMainCards = processCardsByZone(mainCardsData, deckData.deck_cards, 'main');
    const processedRideCards = processCardsByZone(rideCardsData, deckData.deck_cards, 'ride');
    const processedGCards = processCardsByZone(gCardsData, deckData.deck_cards, 'g');
    const processedTokenCards = processCardsByZone(tokenCardsData, deckData.deck_cards, 'token');

    console.log('处理后的各区域卡片数据:', {
      main: processedMainCards,
      ride: processedRideCards,
      g: processedGCards,
      token: processedTokenCards
    });

    // 添加调试日志，记录 validateCards 函数的参数
    console.log('validateCards 函数参数:', {
      mainCards: processedMainCards.map(card => ({
        id: card.id,
        rarity_infos: card.rarity_infos.map(r => ({
          card_number: r.card_number,
          quantity: r.quantity,
          deck_zone: r.deck_zone
        }))
      })),
      rideCards: processedRideCards.map(card => ({
        id: card.id,
        rarity_infos: card.rarity_infos.map(r => ({
          card_number: r.card_number,
          quantity: r.quantity,
          deck_zone: r.deck_zone
        }))
      })),
      GCards: processedGCards.map(card => ({
        id: card.id,
        rarity_infos: card.rarity_infos.map(r => ({
          card_number: r.card_number,
          quantity: r.quantity,
          deck_zone: r.deck_zone
        }))
      })),
      tokenCards: processedTokenCards.map(card => ({
        id: card.id,
        rarity_infos: card.rarity_infos.map(r => ({
          card_number: r.card_number,
          quantity: r.quantity,
          deck_zone: r.deck_zone
        }))
      }))
    });

    return {
      main: processedMainCards,
      ride: processedRideCards,
      g: processedGCards,
      token: processedTokenCards
    };
  } catch (error) {
    console.error('获取卡片数据失败:', error);
    return {
      main: [],
      ride: [],
      g: [],
      token: []
    };
  }
}; 