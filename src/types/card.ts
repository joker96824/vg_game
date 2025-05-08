export interface Card {
  id: string;
  card_code: string;
  card_link: string;
  card_number: string;
  card_rarity?: string;
  name_cn?: string;
  name_jp?: string;
  nation?: string;
  clan?: string;
  grade?: number;
  skill?: string;
  card_power?: number;
  shield?: number;
  critical?: number;
  special_mark?: string;
  card_type?: string;
  trigger_type?: string;
  ability?: string;
  card_alias?: string;
  card_group?: string;
  ability_json?: any;
  create_user_id?: string;
  update_user_id?: string;
  create_time?: string;
  update_time?: string;
  is_deleted?: boolean;
  card_version?: number;
  remark?: string;
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