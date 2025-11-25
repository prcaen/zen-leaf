export interface Room {
  id: string;
  name: string;
  humidity?: number; // percentage
  isIndoor?: boolean; // indoor or outdoor
  temperature?: number; // in Celsius
  lightLevel?: LightLevel;
}

export interface Plant {
  id: string;
  name: string;
  roomId: string;
  imageUrl?: string;
  wateringFrequencyDays: number;
  lastWateredDate: Date | null;
  createdAt: Date;
  notes?: string;
  distanceFromWindow?: number; // in centimeters (from light settings)
  potSize?: number; // Pot size in cm (diameter) (from pot settings)
  hasDrainage?: boolean; // (from pot settings)
  potMaterial?: string; // e.g., "ceramic", "plastic", "terracotta" (from pot settings)
  soil?: string; // e.g., "all-purpose-potting-mix" (from pot settings)
  plantSize?: number; // Plant height in cm (from plantType settings)
  variety?: string; // (from plantType settings)
  category?: string; // e.g., "succulent", "fern", "tropical" (from plantType settings)
  age?: number; // Plant age in years (0 = less than a year, 50 = 50+ years) (from plantType settings)
  isNearAC?: boolean; // (from positionInRoom settings)
  isNearHeater?: boolean; // (from positionInRoom settings)
  careInfo?: PlantCareInfo;
}

export interface WateringTask {
  plantId: string;
  plant: Plant;
  room: Room;
  daysOverdue: number;
  nextWateringDate: Date;
}

export interface PlantWithRoom extends Plant {
  room: Room;
}

// Care Task Types
export type CareTaskType = 'water' | 'fertilize' | 'repot' | 'prune' | 'pest_check' | 'other';

export interface CareTask {
  id: string;
  plantId: string;
  type: CareTaskType;
  title: string;
  description?: string;
  frequencyDays: number;
  lastCompletedDate: Date | null;
  nextDueDate: Date;
  isLocked?: boolean;
  createdAt: Date;
}

export interface CareHistory {
  id: string;
  plantId: string;
  taskType: CareTaskType;
  title: string;
  completedAt: Date;
  notes?: string;
}

// Plant Settings
export enum LightLevel {
  SUN = 'sun',
  PART_SUN = 'part sun',
  SHADE = 'shade',
  DARK = 'dark',
}

export enum GrowSpeed {
  SLOW = 'slow',
  MODERATE = 'moderate',
  FAST = 'fast',
}

export enum Toxicity {
  NON_TOXIC = 'non-toxic',
  TOXIC_PETS = 'toxic-pets',
  TOXIC_HUMANS = 'toxic-humans',
  TOXIC_ALL = 'toxic-all',
}

export enum WaterNeeded {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

export enum HealthOverall {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

// Plant Care Info
export interface PlantCareInfo {
  growSpeed: GrowSpeed;
  lightNeeded: LightLevel;
  toxicity: Toxicity;
  waterNeeded: WaterNeeded;
  growSpeedDescription?: string;
  lightNeededDescription?: string;
  toxicityDescription?: string;
  waterNeededDescription?: string;
}

// Plant Basic Info (for plant creation flow before room selection)
export interface PlantBasicInfo {
  name: string;
  wateringFrequencyDays: number;
  lastWateredDate: null;
  careInfo: PlantCareInfo;
  imageUrl?: string;
}

// Health Status
export interface HealthStatus {
  overall: HealthOverall;
  issues?: string[];
  lastChecked: Date;
  notes?: string;
}

// User
export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

// User data from Supabase Auth
export interface User {
  id: string;
  name: string;
  email: string;
}

// User settings stored in user_settings table
export interface UserSettings {
  locationName: string; // city
  unitSystem: UnitSystem;
}

// Combined user data for convenience
export interface UserWithSettings extends User {
  settings: UserSettings;
}

