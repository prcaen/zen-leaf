import { LightLevel } from '../types';

export interface PlantCatalogItem {
  id: string;
  name: string;
  aliases: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  lightLevel: LightLevel;
  imageUrl?: string;
}

export const commonHouseplants: PlantCatalogItem[] = [
  {
    id: 'monstera',
    name: 'Monstera',
    aliases: 'Swiss Cheese Plant, Fruit Salad Plant, Hurricane plant',
    difficulty: 'Easy',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    aliases: 'Medicinal Aloe, Barbados Aloe, Bitter Aloe',
    difficulty: 'Easy',
    lightLevel: LightLevel.SUN,
  },
  {
    id: 'moth-orchid',
    name: 'Moth orchid',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'chinese-money-sugar',
    name: "Chinese money plant 'Sugar'",
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'golden-pothos',
    name: 'Golden Pothos',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'spider-plant',
    name: 'Spider Plant',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'spineless-yucca',
    name: 'Spineless Yucca',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.SUN,
  },
  {
    id: 'dragon-tree',
    name: 'Dragon Tree',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'parlor-palm',
    name: 'Parlor Palm',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'jade-plant',
    name: 'Jade Plant',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.SUN,
  },
  {
    id: 'ginseng-ficus',
    name: "Ginseng Ficus 'Ginseng'",
    aliases: '',
    difficulty: 'Advanced',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'zz-plant',
    name: 'Zz Plant',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'peace-lily',
    name: 'Peace Lily',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'money-tree',
    name: 'Money Tree',
    aliases: '',
    difficulty: 'Advanced',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'avocado',
    name: 'Avocado',
    aliases: '',
    difficulty: 'Advanced',
    lightLevel: LightLevel.SUN,
  },
  {
    id: 'basil',
    name: 'Basil',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SUN,
  },
  {
    id: 'silver-inch-plant',
    name: 'Silver Inch Plant',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'monkey-mask',
    name: 'Monkey Mask',
    aliases: '',
    difficulty: 'Advanced',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'areca-palm',
    name: 'Areca Palm',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'mother-in-law-tongue',
    name: "Mother-in-law's tongue 'Futura Superba'",
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'flamingo-lily',
    name: 'Flamingo Lily',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'peacock-plant',
    name: 'Peacock Plant',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'echeveria',
    name: 'Echeveria - mixed varieties',
    aliases: '',
    difficulty: 'Easy',
    lightLevel: LightLevel.SUN,
  },
  {
    id: 'prayer-plant',
    name: 'Prayer Plant',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'moth-orchid-white',
    name: "Moth Orchid 'Younghome White Apple'",
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SHADE,
  },
  {
    id: 'chinese-money',
    name: 'Chinese Money Plant',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'polka-dot',
    name: 'Polka Dot Plant',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'polka-dot-pink',
    name: "Polka Dot Plant 'Pink Splash'",
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'weeping-fig',
    name: 'Weeping Fig',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.PART_SUN,
  },
  {
    id: 'haworthia',
    name: 'Haworthia - Mixed Varieties',
    aliases: '',
    difficulty: 'Moderate',
    lightLevel: LightLevel.SUN,
  },
];

