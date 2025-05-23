export interface DeckCard {
    id: string;
    card_id: string;
    deck_id: string;
    deck_zone: string;
    quantity: number;
    image: string;
    grade?: number;
    nation?: string;
    create_time: string;
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