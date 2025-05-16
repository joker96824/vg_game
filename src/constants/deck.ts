export const DECK_ZONES = ['ride', 'main', 'g', 'token'] as const;
export type DeckZone = typeof DECK_ZONES[number];

export const CARD_LIMITS = {
  RIDE: 1,
  MAIN: 50,
  G: 16,
  TOKEN: 10
} as const;

export const DEFAULT_DECK_ZONE: DeckZone = 'ride'; 