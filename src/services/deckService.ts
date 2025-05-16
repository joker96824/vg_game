import { Deck, DeckCard } from '../types/card';
import { API_ENDPOINTS } from '../constants/api';

/**
 * 获取卡组列表
 * @param userId 用户ID
 * @returns 卡组列表
 */
export const getDecks = async (userId: string): Promise<Deck[]> => {
  try {
    const url = `${API_ENDPOINTS.DECKS}?user_id=${encodeURIComponent(userId)}`;
    console.log('正在请求卡组列表:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('获取卡组列表失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取卡组列表时出错:', error);
    throw error;
  }
};

/**
 * 创建新卡组
 * @param deckData 卡组数据
 * @returns 新创建的卡组
 */
export const createDeck = async (deckData: {
  deck_name: string;
  deck_description?: string;
  user_id: string;
}): Promise<Deck> => {
  try {
    const response = await fetch(API_ENDPOINTS.DECKS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deckData),
    });
    
    if (!response.ok) {
      throw new Error('创建卡组失败');
    }
    return await response.json();
  } catch (error) {
    console.error('创建卡组时出错:', error);
    throw error;
  }
};

/**
 * 获取指定卡组详情
 * @param deckId 卡组ID
 * @returns 卡组详情
 */
export const getDeckById = async (deckId: string): Promise<Deck> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.DECKS}/${deckId}`);
    if (!response.ok) {
      throw new Error('获取卡组详情失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取卡组详情时出错:', error);
    throw error;
  }
};

/**
 * 保存卡组
 * @param deckId 卡组ID
 * @param deckData 卡组数据
 */
export const saveDeck = async (deckId: string, deckData: {
  deck_name: string;
  deck_description?: string;
  is_public?: boolean;
  is_official?: boolean;
  preset?: number;
  deck_version: number;
  remark?: string;
  deck_cards: DeckCard[];
}): Promise<void> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.DECKS}/${deckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deckData),
    });
    
    if (!response.ok) {
      throw new Error('保存卡组失败');
    }
  } catch (error) {
    console.error('保存卡组时出错:', error);
    throw error;
  }
}; 