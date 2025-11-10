export interface Room {
  id: string;
  name: string;
  settings?: RoomSettings;
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
  settings?: PlantSettings;
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

export interface LightSettings {
  distanceFromWindow?: number; // in centimeters
}

export interface PotSettings {
  size?: number; // Pot size in cm (diameter)
  hasDrainage?: boolean;
  material?: string; // e.g., "ceramic", "plastic", "terracotta"
  soil?: string; // e.g., "soil"
}

export interface PlantTypeSettings {
  size?: number; // Plant height in cm
  variety?: string;
  category?: string; // e.g., "succulent", "fern", "tropical"
  age?: number; // Plant age in years (0 = less than a year, 50 = 50+ years)
}

export interface RoomSettings {
  humidity?: number; // percentage
  isIndoor?: boolean; // indoor or outdoor
  temperature?: number; // in Celsius
  lightLevel?: LightLevel;
}

export interface PlantSettings {
  light?: LightSettings;
  pot?: PotSettings;
  plantType?: PlantTypeSettings;
  positionInRoom?: PositionInRoom;
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

// Health Status
export interface HealthStatus {
  overall: HealthOverall;
  issues?: string[];
  lastChecked: Date;
  notes?: string;
}

export interface PositionInRoom {
  isNearAC?: boolean;
  isNearHeater?: boolean;
}

// User
export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export interface User {
  name: string;
  email: string;
  locationName: string; // city
  unitSystem: UnitSystem;
}

