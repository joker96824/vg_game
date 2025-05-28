import { Deck, DeckCard } from '../types/deck';
import { API_ENDPOINTS } from '../constants/api';
import { createAuthenticatedRequest } from '../utils/request';

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
}

interface DeckListResponse {
  total: number;
  items: Deck[];
}

/**
 * 获取卡组列表
 * @returns 卡组列表
 */
export const getDecks = async (): Promise<Deck[]> => {
  try {
    const response = await createAuthenticatedRequest(API_ENDPOINTS.DECKS);
    const data: ApiResponse<DeckListResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡组列表失败');
    }
    
    return data.data?.items || [];
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
}): Promise<Deck> => {
  try {
    const response = await createAuthenticatedRequest(API_ENDPOINTS.DECKS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deckData),
    });
    
    const data: ApiResponse<Deck> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '创建卡组失败');
    }
    
    return data.data!;
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
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.DECKS}/${deckId}`);
    const data: ApiResponse<Deck> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡组详情失败');
    }
    
    return data.data!;
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
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.DECKS}/${deckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deckData),
    });
    
    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '保存卡组失败');
    }
  } catch (error) {
    console.error('保存卡组时出错:', error);
    throw error;
  }
};

/**
 * 导入卡组
 * @param deckId 要导入的卡组ID
 * @returns 新创建的卡组
 */
export const importDeck = async (deckId: string): Promise<Deck> => {
  try {
    // 1. 获取要导入的卡组信息
    const sourceDeck = await getDeckById(deckId);
    
    // 2. 创建新卡组
    const newDeck = await createDeck({
      deck_name: `${sourceDeck.deck_name} (导入)`,
      deck_description: `从卡组 ${sourceDeck.deck_name} 导入\n${sourceDeck.deck_description || ''}`
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
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.DECKS}/${deckId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json'
      }
    });

    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '删除卡组失败');
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
    const body = {
      deck_name: deckName,
      deck_description: deckDescription
    };

    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.DECKS}/${deckId}/info`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data: ApiResponse<void> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '更新卡组信息失败');
    }
  } catch (error) {
    console.error('更新卡组信息失败:', error);
    throw error;
  }
};

/**
 * 复制卡组
 * @param deckId 要复制的卡组ID
 * @returns 新创建的卡组
 */
export const copyDeck = async (deckId: string): Promise<Deck> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.DECKS}/${deckId}/copy`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    });

    const data: ApiResponse<Deck> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '复制卡组失败');
    }
    
    return data.data!;
  } catch (error) {
    console.error('复制卡组失败:', error);
    throw error;
  }
};

/**
 * 验证卡组
 * @param deckId 卡组ID
 * @returns 验证结果
 */
export const validateDeckValidity = async (deckId: string): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.DECKS}/${deckId}/validity`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '验证卡组失败');
    }
    
    return {
      isValid: data.data.is_valid,
      errors: data.data.errors || []
    };
  } catch (error) {
    console.error('验证卡组失败:', error);
    throw error;
  }
}; 