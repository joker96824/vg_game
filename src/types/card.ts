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

export interface ShowCard extends Card {
  card_rarity: Array<{
    card_number: string;
    quantity: number;
    zone?: 'ride' | 'main' | 'G' | 'token';
  }>;
} 