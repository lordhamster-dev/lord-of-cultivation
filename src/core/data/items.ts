export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: 'herb' | 'seed' | 'fish' | 'pill' | 'material' | 'currency';
  emoji: string;
  stackable: boolean;
  sellPrice?: number; // sell price in spirit stones; undefined = not sellable
}

export const ITEMS: ItemDef[] = [
  // Currency
  { id: 'spirit_stone', name: '灵石', description: '修仙世界的通用货币', category: 'currency', emoji: '💰', stackable: true },
  // Seeds
  { id: 'spirit_grass_seed', name: '灵草种子', description: '种植灵草的种子', category: 'seed', emoji: '🌱', stackable: true, sellPrice: 2 },
  { id: 'fire_herb_seed', name: '火灵草种子', description: '种植火灵草的种子', category: 'seed', emoji: '🌱', stackable: true, sellPrice: 5 },
  { id: 'moon_flower_seed', name: '月华花种子', description: '种植月华花的种子', category: 'seed', emoji: '🌱', stackable: true, sellPrice: 10 },
  { id: 'golden_lotus_seed', name: '金莲子种子', description: '种植金莲子的种子', category: 'seed', emoji: '🌱', stackable: true, sellPrice: 25 },
  // Herbs
  { id: 'spirit_grass', name: '灵草', description: '最基础的灵草，炼制聚气丹的原料', category: 'herb', emoji: '🌿', stackable: true, sellPrice: 5 },
  { id: 'fire_herb', name: '火灵草', description: '蕴含火灵气，炼制培元丹的主料', category: 'herb', emoji: '🔥', stackable: true, sellPrice: 15 },
  { id: 'moon_flower', name: '月华花', description: '月夜盛开，炼制筑基丹必须材料', category: 'herb', emoji: '🌸', stackable: true, sellPrice: 30 },
  { id: 'golden_lotus', name: '金莲子', description: '传说中的灵药，炼制金丹境突破丹的核心材料', category: 'herb', emoji: '🪷', stackable: true, sellPrice: 80 },
  // Fish
  { id: 'carp', name: '灵鲤', description: '灵湖中常见的鱼类', category: 'fish', emoji: '🐟', stackable: true, sellPrice: 3 },
  { id: 'spirit_fish', name: '灵鱼', description: '蕴含灵气的鱼', category: 'fish', emoji: '🐠', stackable: true, sellPrice: 8 },
  { id: 'jade_fish', name: '玉鱼', description: '通体如玉的稀有鱼类', category: 'fish', emoji: '🐡', stackable: true, sellPrice: 20 },
  { id: 'fire_carp', name: '赤炎鲤', description: '生活在火山温泉的炎系鱼类', category: 'fish', emoji: '🔴', stackable: true, sellPrice: 35 },
  { id: 'lava_eel', name: '熔岩鳗', description: '极为罕见的熔岩鳗鱼', category: 'fish', emoji: '🌋', stackable: true, sellPrice: 60 },
  { id: 'dragon_fish', name: '龙纹鱼', description: '身具龙纹的神秘鱼类', category: 'fish', emoji: '🐉', stackable: true, sellPrice: 100 },
  { id: 'phoenix_carp', name: '凤尾鲤', description: '传说中的仙灵鱼类', category: 'fish', emoji: '🦚', stackable: true, sellPrice: 200 },
  // Materials
  { id: 'fire_crystal', name: '火晶石', description: '火山中凝聚的火属性晶石', category: 'material', emoji: '🔮', stackable: true, sellPrice: 25 },
  { id: 'beast_hide', name: '灵兽皮', description: '灵兽身上剥取的皮革，炼器基础材料', category: 'material', emoji: '🐾', stackable: true, sellPrice: 20 },
  { id: 'beast_bone', name: '灵兽骨', description: '灵兽的骨骼，蕴含灵气', category: 'material', emoji: '🦴', stackable: true, sellPrice: 30 },
  { id: 'iron_ore', name: '灵铁矿', description: '蕴含灵气的铁矿石，炼器核心材料', category: 'material', emoji: '⛏️', stackable: true, sellPrice: 40 },
  { id: 'demon_core', name: '妖核', description: '妖兽体内的核心，蕴含强大妖力', category: 'material', emoji: '💀', stackable: true, sellPrice: 100 },
  { id: 'void_crystal', name: '虚空结晶', description: '虚空中凝聚的稀有晶体，高阶炼器材料', category: 'material', emoji: '✨', stackable: true, sellPrice: 250 },
  // Pills
  { id: 'gathering_pill', name: '聚气丹', description: '服用后打坐灵力恢复效率+50%，持续5分钟', category: 'pill', emoji: '💊', stackable: true, sellPrice: 20 },
  // Breakthrough pills (reduce spirit stone cost when breaking through)
  { id: 'foundation_pill', name: '筑基丹', description: '突破筑基时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 50 },
  { id: 'core_formation_pill', name: '结丹丹', description: '突破结丹时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 150 },
  { id: 'nascent_soul_pill', name: '元婴丹', description: '突破元婴时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 500 },
  { id: 'god_transform_pill', name: '化神丹', description: '突破化神时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 1500 },
  { id: 'void_refining_pill', name: '炼虚丹', description: '突破炼虚时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 5000 },
  { id: 'body_integration_pill', name: '合体丹', description: '突破合体时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 15000 },
  { id: 'mahayana_pill', name: '大乘丹', description: '突破大乘时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 50000 },
  { id: 'true_immortal_pill', name: '真仙丹', description: '突破真仙时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 200000 },
  { id: 'golden_immortal_pill', name: '金仙丹', description: '突破金仙时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 800000 },
  { id: 'taiyi_pill', name: '太乙丹', description: '突破太乙时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 3000000 },
  { id: 'daluo_pill', name: '大罗丹', description: '突破大罗时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 10000000 },
  { id: 'dao_ancestor_pill', name: '道祖丹', description: '突破道祖时消耗灵石减少50%', category: 'pill', emoji: '💊', stackable: true, sellPrice: 50000000 },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find(i => i.id === id);
}

// ─── Pill combat effects (HP/spirit recovery % per use during combat) ─────────
export interface PillCombatEffect {
  hpRecovery: number;      // fraction of maxHp to restore (e.g. 0.20 = 20%)
  spiritRecovery: number;  // fraction of spiritMax to restore (e.g. 0.30 = 30%)
}

export const PILL_COMBAT_EFFECTS: Record<string, PillCombatEffect> = {
  gathering_pill:      { hpRecovery: 0.05, spiritRecovery: 0.30 },
  foundation_pill:     { hpRecovery: 0.15, spiritRecovery: 0.05 },
  core_formation_pill: { hpRecovery: 0.20, spiritRecovery: 0.10 },
  nascent_soul_pill:   { hpRecovery: 0.25, spiritRecovery: 0.15 },
  god_transform_pill:  { hpRecovery: 0.30, spiritRecovery: 0.20 },
  void_refining_pill:  { hpRecovery: 0.35, spiritRecovery: 0.25 },
  body_integration_pill: { hpRecovery: 0.40, spiritRecovery: 0.30 },
  mahayana_pill:       { hpRecovery: 0.50, spiritRecovery: 0.40 },
  true_immortal_pill:  { hpRecovery: 0.60, spiritRecovery: 0.50 },
  golden_immortal_pill:{ hpRecovery: 0.70, spiritRecovery: 0.60 },
  taiyi_pill:          { hpRecovery: 0.80, spiritRecovery: 0.70 },
  daluo_pill:          { hpRecovery: 0.90, spiritRecovery: 0.80 },
  dao_ancestor_pill:   { hpRecovery: 1.00, spiritRecovery: 1.00 },
};
