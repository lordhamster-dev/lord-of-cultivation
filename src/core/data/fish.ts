export interface FishDef {
  id: string;
  name: string;
  weight: number;
  exp: number;
  minLevel: number;
}

export interface FishingAreaDef {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  baseDurationMs: number;
  fish: FishDef[];
  specialItems: { itemId: string; chance: number }[];
}

export const FISHING_AREAS: FishingAreaDef[] = [
  {
    id: 'spirit_lake',
    name: '灵湖',
    description: '宗门旁的平静灵湖，适合初学者',
    requiredLevel: 1,
    baseDurationMs: 10_000,
    fish: [
      { id: 'carp', name: '灵鲤', weight: 60, exp: 5, minLevel: 1 },
      { id: 'spirit_fish', name: '灵鱼', weight: 30, exp: 15, minLevel: 5 },
      { id: 'jade_fish', name: '玉鱼', weight: 10, exp: 40, minLevel: 10 },
    ],
    specialItems: [
      { itemId: 'spirit_grass_seed', chance: 0.15 },
    ],
  },
  {
    id: 'volcano_lake',
    name: '火山温泉',
    description: '地底岩浆加热的温泉，有特殊鱼类',
    requiredLevel: 30,
    baseDurationMs: 15_000,
    fish: [
      { id: 'fire_carp', name: '赤炎鲤', weight: 50, exp: 80, minLevel: 30 },
      { id: 'lava_eel', name: '熔岩鳗', weight: 20, exp: 200, minLevel: 40 },
    ],
    specialItems: [
      { itemId: 'fire_herb_seed', chance: 0.1 },
      { itemId: 'fire_crystal', chance: 0.05 },
    ],
  },
  {
    id: 'sky_lake',
    name: '九天瑶池',
    description: '传说中的仙境湖泊',
    requiredLevel: 70,
    baseDurationMs: 20_000,
    fish: [
      { id: 'dragon_fish', name: '龙纹鱼', weight: 40, exp: 800, minLevel: 70 },
      { id: 'phoenix_carp', name: '凤尾鲤', weight: 10, exp: 3000, minLevel: 85 },
    ],
    specialItems: [
      { itemId: 'golden_lotus_seed', chance: 0.03 },
    ],
  },
];

export function getFishingArea(id: string): FishingAreaDef | undefined {
  return FISHING_AREAS.find(a => a.id === id);
}
