export interface CareHistory {
  id: string;
  taskId: string;
  completedAt: Date;
}

export interface CareTask {
  id: string;
  plantId: string;
  type: CareTaskType;
  frequencyDays: number;
  nextDueDate: Date;
  isLocked?: boolean;
  createdAt: Date;
}

export interface Plant {
  id: string;
  name: string;
  roomId: string;
  catalogItemId?: string; // Reference to PlantCatalogItem
  imageUrl?: string;
  createdAt: Date;
  distanceFromWindow?: number; // in centimeters
  potSize?: number; // Pot size in cm (diameter)
  hasDrainage?: boolean;
  potMaterial?: string; // e.g., "ceramic", "plastic", "terracotta"
  soil?: string; // e.g., "all-purpose-potting-mix"
  plantSize?: number; // Plant height in cm
  acquiredAt?: Date; // Date when plant was acquired - age is calculated from this date
  isNearAC?: boolean;
  isNearHeater?: boolean;
}

// Plant Basic Info (for plant creation flow before room selection)
export interface PlantBasicInfo {
  name: string;
  catalogItemId: string; // Reference to PlantCatalogItem
  imageUrl?: string;
}

export interface PlantCatalogItem {
  id: string;
  name: string;
  aliases: string;
  difficulty: Difficulty;
  lightLevel: LightLevel;
  imageUrl?: string;
  growSpeed: GrowSpeed;
  toxicity: Toxicity;
  waterNeeded: WaterNeeded;
  growSpeedDescription?: string;
  lightNeededDescription?: string;
  toxicityDescription?: string;
  waterNeededDescription?: string;
  variety?: string;
  category?: string; // e.g., "succulent", "fern", "tropical"
}

export interface Room {
  id: string;
  name: string;
  humidity?: number; // percentage
  isIndoor?: boolean; // indoor or outdoor
  temperature?: number; // in Celsius
  lightLevel?: LightLevel;
}

// User data from Supabase Auth
export interface User {
  id: string;
  displayName: string;
  email: string;
}

export interface UserSettings {
  locationName: string;
  unitSystem: UnitSystem;
}

// Combined data
export interface PlantWithRoom extends Plant {
  room: Room;
}

export interface UserWithSettings extends User {
  settings: UserSettings;
}

// Enums
export enum CareTaskType {
  WATER = 'water',
  FERTILIZE = 'fertilize',
  REPOT = 'repot',
  PRUNE = 'prune',
  PEST_CHECK = 'pest_check',
  OTHER = 'other',
}

export enum Difficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  ADVANCED = 'advanced',
}

export enum GrowSpeed {
  SLOW = 'slow',
  MODERATE = 'moderate',
  FAST = 'fast',
}

export enum LightLevel {
  SUN = 'sun',
  PART_SUN = 'part sun',
  SHADE = 'shade',
  DARK = 'dark',
}

export enum Toxicity {
  NON_TOXIC = 'non-toxic',
  TOXIC_PETS = 'toxic-pets',
  TOXIC_HUMANS = 'toxic-humans',
  TOXIC_ALL = 'toxic-all',
}

export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export enum WaterNeeded {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}