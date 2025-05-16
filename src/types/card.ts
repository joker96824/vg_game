export interface RarityInfo {
  pack_name: string;
  card_number: string;
  release_info: string;
  quote: string | null;
  illustrator: string;
  image_url: string;
  id: string;
  card_id: string;
  create_time: string;
  update_time: string;
  quantity?: number;
  zone?: 'ride' | 'main' | 'G' | 'token';
}

export interface Card {
  card_code: string;
  card_id: string;
  name_cn: string;
  name_en: string | null;
  card_type: string;
  trigger_type: string;
  card_power: number;
  grade: number;
  race: string | null;
  nation: string;
  clan: string | null;
  skill: string;
  flavor_text: string | null;
  image_url: string | null;
  card_thumbnail_url: string | null;
  card_updated_at: string | null;
  id: string;
  create_user_id: string;
  update_user_id: string;
  create_time: string;
  update_time: string;
  is_deleted: boolean;
  card_version: number;
  remark: string;
  rarity_infos: RarityInfo[];
}

export interface CardRarity {
  id: string;
  card_id: string;
  pack_name?: string;
  card_number?: string;
  release_info?: string;
  quote?: string;
  illustrator?: string;
  image_url?: string;
  create_time?: string;
  update_time?: string;
}

export type ModalType = 'left' | 'right' | null;

export interface DeckCard {
  id: string;
  card_id: string;
  image: string;
  quantity?: number;
  create_time: string;
  deck_id: string;
  deck_zone: string;
  is_deleted: boolean;
  position: number;
  remark: string;
  update_time: string;
}

export interface Deck {
  id: string;
  deck_name: string;
  deck_cards: DeckCard[];
  deck_description?: string;
  is_public?: boolean;
  is_official?: boolean;
  preset?: number;
  deck_version?: number;
  remark?: string;
}

export interface ShowCard extends Card {
  card_rarity: Array<{
    card_number: string;
    quantity: number;
    zone?: 'ride' | 'main' | 'G' | 'token';
  }>;
} 