import { Deck, DeckCard } from '../types/deck';
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

/**
 * 导入卡组
 * @param deckId 要导入的卡组ID
 * @param userId 当前用户ID
 * @returns 新创建的卡组
 */
export const importDeck = async (deckId: string, userId: string): Promise<Deck> => {
  try {
    // 1. 获取要导入的卡组信息
    const sourceDeck = await getDeckById(deckId);
    
    // 2. 创建新卡组
    const newDeck = await createDeck({
      deck_name: `${sourceDeck.deck_name} (导入)`,
      deck_description: `从卡组 ${sourceDeck.deck_name} 导入\n${sourceDeck.deck_description || ''}`,
      user_id: userId
    });
    
    // 3. 更新新卡组，复制卡片数据
    await saveDeck(newDeck.id, {
      ...newDeck,
      deck_cards: sourceDeck.deck_cards.map(card => ({
        ...card,
        id: '', // 新建卡牌时不需要id
        deck_id: newDeck.id,
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      })),
      deck_version: 1
    });
    
    return newDeck;
  } catch (error) {
    console.error('导入卡组失败:', error);
    throw error;
  }
};

// 删除卡组
export const deleteDeck = async (deckId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.DECKS}/${deckId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('删除卡组失败');
    }
  } catch (error) {
    console.error('删除卡组失败:', error);
    throw error;
  }
};

/**
 * 更新卡组信息
 * @param deckId 卡组ID
 * @param deckName 新的卡组名
 * @param deckDescription 卡组描述
 */
export const updateDeckInfo = async (
  deckId: string,
  deckName: string,
  deckDescription?: string
): Promise<void> => {
  try {
    const params = new URLSearchParams({
      deck_name: deckName
    });
    
    if (deckDescription) {
      params.append('deck_description', deckDescription);
    }

    const response = await fetch(`${API_ENDPOINTS.DECKS}/${deckId}/info?${params.toString()}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('更新卡组信息失败');
    }
  } catch (error) {
    console.error('更新卡组信息失败:', error);
    throw error;
  }
};

/**
 * 复制卡组
 * @param deckId 要复制的卡组ID
 * @param userId 当前用户ID
 * @returns 新创建的卡组
 */
export const copyDeck = async (deckId: string, userId: string): Promise<Deck> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.DECKS}/${deckId}/copy?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('复制卡组失败');
    }

    return await response.json();
  } catch (error) {
    console.error('复制卡组失败:', error);
    throw error;
  }
}; 