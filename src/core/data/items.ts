export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: 'herb' | 'seed' | 'fish' | 'pill' | 'material';
  stackable: boolean;
}

export const ITEMS: ItemDef[] = [
  // Seeds
  { id: 'spirit_grass_seed', name: '灵草种子', description: '种植灵草的种子', category: 'seed', stackable: true },
  { id: 'fire_herb_seed', name: '火灵草种子', description: '种植火灵草的种子', category: 'seed', stackable: true },
  { id: 'moon_flower_seed', name: '月华花种子', description: '种植月华花的种子', category: 'seed', stackable: true },
  { id: 'golden_lotus_seed', name: '金莲子种子', description: '种植金莲子的种子', category: 'seed', stackable: true },
  // Herbs
  { id: 'spirit_grass', name: '灵草', description: '最基础的灵草，炼制聚气丹的原料', category: 'herb', stackable: true },
  { id: 'fire_herb', name: '火灵草', description: '蕴含火灵气，炼制培元丹的主料', category: 'herb', stackable: true },
  { id: 'moon_flower', name: '月华花', description: '月夜盛开，炼制筑基丹必须材料', category: 'herb', stackable: true },
  { id: 'golden_lotus', name: '金莲子', description: '传说中的灵药，炼制金丹境突破丹的核心材料', category: 'herb', stackable: true },
  // Fish
  { id: 'carp', name: '灵鲤', description: '灵湖中常见的鱼类', category: 'fish', stackable: true },
  { id: 'spirit_fish', name: '灵鱼', description: '蕴含灵气的鱼', category: 'fish', stackable: true },
  { id: 'jade_fish', name: '玉鱼', description: '通体如玉的稀有鱼类', category: 'fish', stackable: true },
  { id: 'fire_carp', name: '赤炎鲤', description: '生活在火山温泉的炎系鱼类', category: 'fish', stackable: true },
  { id: 'lava_eel', name: '熔岩鳗', description: '极为罕见的熔岩鳗鱼', category: 'fish', stackable: true },
  { id: 'dragon_fish', name: '龙纹鱼', description: '身具龙纹的神秘鱼类', category: 'fish', stackable: true },
  { id: 'phoenix_carp', name: '凤尾鲤', description: '传说中的仙灵鱼类', category: 'fish', stackable: true },
  // Materials
  { id: 'fire_crystal', name: '火晶石', description: '火山中凝聚的火属性晶石', category: 'material', stackable: true },
  { id: 'beast_hide', name: '灵兽皮', description: '灵兽身上剥取的皮革，炼器基础材料', category: 'material', stackable: true },
  { id: 'beast_bone', name: '灵兽骨', description: '灵兽的骨骼，蕴含灵气', category: 'material', stackable: true },
  { id: 'iron_ore', name: '灵铁矿', description: '蕴含灵气的铁矿石，炼器核心材料', category: 'material', stackable: true },
  { id: 'demon_core', name: '妖核', description: '妖兽体内的核心，蕴含强大妖力', category: 'material', stackable: true },
  { id: 'void_crystal', name: '虚空结晶', description: '虚空中凝聚的稀有晶体，高阶炼器材料', category: 'material', stackable: true },
  // Pills
  { id: 'gathering_pill', name: '聚气丹', description: '服用后灵石产出+50%，持续5分钟', category: 'pill', stackable: true },
  // Breakthrough pills (reduce spirit stone cost when breaking through)
  { id: 'foundation_pill', name: '筑基丹', description: '突破筑基时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'core_formation_pill', name: '结丹丹', description: '突破结丹时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'nascent_soul_pill', name: '元婴丹', description: '突破元婴时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'god_transform_pill', name: '化神丹', description: '突破化神时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'void_refining_pill', name: '炼虚丹', description: '突破炼虚时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'body_integration_pill', name: '合体丹', description: '突破合体时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'mahayana_pill', name: '大乘丹', description: '突破大乘时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'true_immortal_pill', name: '真仙丹', description: '突破真仙时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'golden_immortal_pill', name: '金仙丹', description: '突破金仙时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'taiyi_pill', name: '太乙丹', description: '突破太乙时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'daluo_pill', name: '大罗丹', description: '突破大罗时消耗灵石减少50%', category: 'pill', stackable: true },
  { id: 'dao_ancestor_pill', name: '道祖丹', description: '突破道祖时消耗灵石减少50%', category: 'pill', stackable: true },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find(i => i.id === id);
}
