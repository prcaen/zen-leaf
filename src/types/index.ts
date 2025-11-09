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
}

export interface WateringTask {
  plantId: string;
  plant: Plant;
  location: Location;
  daysOverdue: number;
  isOverdue: boolean;
  nextWateringDate: string; // ISO date string
}

export type TabType = 'today' | 'soon';

export interface PlantWithLocation extends Plant {
  location: Location;
}

