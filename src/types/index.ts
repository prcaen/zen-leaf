export interface Location {
  id: string;
  name: string;
  icon?: string;
}

export interface Plant {
  id: string;
  name: string;
  locationId: string;
  imageUrl?: string;
  wateringFrequencyDays: number;
  lastWateredDate: string | null; // ISO date string
  createdAt: string; // ISO date string
  notes?: string;
  settings?: PlantSettings;
  careInfo?: PlantCareInfo;
}

export interface WateringTask {
  plantId: string;
  plant: Plant;
  location: Location;
  daysOverdue: number;
  isOverdue: boolean;
  nextWateringDate: string; // ISO date string
}

export interface PlantWithLocation extends Plant {
  location: Location;
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
  lastCompletedDate: string | null; // ISO date string
  nextDueDate: string; // ISO date string
  isLocked?: boolean;
  createdAt: string;
}

export interface CareHistory {
  id: string;
  plantId: string;
  taskType: CareTaskType;
  title: string;
  completedAt: string; // ISO date string
  notes?: string;
}

// Plant Settings
export interface LightSettings {
  level: 'low' | 'medium' | 'high';
  type: 'direct' | 'indirect' | 'shade';
  distanceFromWindow?: number; // in centimeters
}

export interface PotSettings {
  size: number; // Pot size in cm (diameter)
  hasDrainage: boolean;
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
  temperature?: number; // in Celsius
  humidity?: number; // percentage
  roomType?: string; // e.g., "living room", "bathroom"
  isNearAC?: boolean;
  isNearHeater?: boolean;
  isIndoor?: boolean;
}

export interface LocationSettings {
  climate?: string;
  season?: string;
  temperature?: {
    min?: number;
    max?: number;
  };
  city?: string;
}

export interface PlantSettings {
  light?: LightSettings;
  pot?: PotSettings;
  plantType?: PlantTypeSettings;
  room?: RoomSettings;
  location?: LocationSettings;
}

// Plant Care Info
export interface PlantCareInfo {
  growSpeed: 'slow' | 'moderate' | 'fast';
  lightNeeded: 'low' | 'medium' | 'high';
  toxicity: 'non-toxic' | 'toxic-pets' | 'toxic-humans' | 'toxic-all';
  waterNeeded: 'low' | 'moderate' | 'high';
  growSpeedDescription?: string;
  lightNeededDescription?: string;
  toxicityDescription?: string;
  waterNeededDescription?: string;
}

// Health Status
export interface HealthStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  issues?: string[];
  lastChecked: string; // ISO date string
  notes?: string;
}

