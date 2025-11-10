import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plant, Location, CareTask, CareHistory } from '../types';

const PLANTS_KEY = '@zen_leaf_plants';
const LOCATIONS_KEY = '@zen_leaf_locations';
const CARE_TASKS_KEY = '@zen_leaf_care_tasks';
const CARE_HISTORY_KEY = '@zen_leaf_care_history';

// Serialization helpers for Date objects
// Convert Date objects to ISO strings for JSON storage
function serializeDates<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item));
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeDates((obj as any)[key]);
      }
    }
    return serialized;
  }

  return obj;
}

// Deserialization helpers for Date objects
// Convert ISO strings back to Date objects
function deserializeDates<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    // Check if it's an ISO date string
    const date = new Date(obj);
    if (!isNaN(date.getTime())) {
      return date as any;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deserializeDates(item)) as any;
  }

  if (typeof obj === 'object') {
    const deserialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        deserialized[key] = deserializeDates(obj[key]);
      }
    }
    return deserialized;
  }

  return obj;
}

export const storage = {
  // Plants
  async getPlants(): Promise<Plant[]> {
    try {
      const data = await AsyncStorage.getItem(PLANTS_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return deserializeDates<Plant[]>(parsed);
    } catch (error) {
      console.error('Error loading plants:', error);
      return [];
    }
  },

  async savePlants(plants: Plant[]): Promise<void> {
    try {
      const serialized = serializeDates(plants);
      await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving plants:', error);
    }
  },

  async addPlant(plant: Plant): Promise<void> {
    const plants = await this.getPlants();
    plants.push(plant);
    await this.savePlants(plants);
  },

  async updatePlant(plantId: string, updates: Partial<Plant>): Promise<void> {
    const plants = await this.getPlants();
    const index = plants.findIndex(p => p.id === plantId);
    if (index !== -1) {
      plants[index] = { ...plants[index], ...updates };
      await this.savePlants(plants);
    }
  },

  async deletePlant(plantId: string): Promise<void> {
    const plants = await this.getPlants();
    const filtered = plants.filter(p => p.id !== plantId);
    await this.savePlants(filtered);
  },

  // Locations
  async getLocations(): Promise<Location[]> {
    try {
      const data = await AsyncStorage.getItem(LOCATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading locations:', error);
      return [];
    }
  },

  async saveLocations(locations: Location[]): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
    } catch (error) {
      console.error('Error saving locations:', error);
    }
  },

  async addLocation(location: Location): Promise<void> {
    const locations = await this.getLocations();
    locations.push(location);
    await this.saveLocations(locations);
  },

  async updateLocation(locationId: string, updates: Partial<Location>): Promise<void> {
    const locations = await this.getLocations();
    const index = locations.findIndex(l => l.id === locationId);
    if (index !== -1) {
      locations[index] = { ...locations[index], ...updates };
      await this.saveLocations(locations);
    }
  },

  async deleteLocation(locationId: string): Promise<void> {
    const locations = await this.getLocations();
    const filtered = locations.filter(l => l.id !== locationId);
    await this.saveLocations(filtered);
  },

  // Care Tasks
  async getCareTasks(plantId?: string): Promise<CareTask[]> {
    try {
      const data = await AsyncStorage.getItem(CARE_TASKS_KEY);
      const parsed = data ? JSON.parse(data) : [];
      const deserialized = deserializeDates<CareTask[]>(parsed);
      return plantId ? deserialized.filter((t: CareTask) => t.plantId === plantId) : deserialized;
    } catch (error) {
      console.error('Error loading care tasks:', error);
      return [];
    }
  },

  async saveCareTasks(tasks: CareTask[]): Promise<void> {
    try {
      const serialized = serializeDates(tasks);
      await AsyncStorage.setItem(CARE_TASKS_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving care tasks:', error);
    }
  },

  async addCareTask(task: CareTask): Promise<void> {
    const tasks = await this.getCareTasks();
    tasks.push(task);
    await this.saveCareTasks(tasks);
  },

  async updateCareTask(taskId: string, updates: Partial<CareTask>): Promise<void> {
    const tasks = await this.getCareTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      await this.saveCareTasks(tasks);
    }
  },

  async deleteCareTask(taskId: string): Promise<void> {
    const tasks = await this.getCareTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    await this.saveCareTasks(filtered);
  },

  // Care History
  async getCareHistory(plantId?: string): Promise<CareHistory[]> {
    try {
      const data = await AsyncStorage.getItem(CARE_HISTORY_KEY);
      const parsed = data ? JSON.parse(data) : [];
      const deserialized = deserializeDates<CareHistory[]>(parsed);
      return plantId ? deserialized.filter((h: CareHistory) => h.plantId === plantId) : deserialized;
    } catch (error) {
      console.error('Error loading care history:', error);
      return [];
    }
  },

  async saveCareHistory(history: CareHistory[]): Promise<void> {
    try {
      const serialized = serializeDates(history);
      await AsyncStorage.setItem(CARE_HISTORY_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving care history:', error);
    }
  },

  async addCareHistory(entry: CareHistory): Promise<void> {
    const history = await this.getCareHistory();
    history.unshift(entry); // Add to beginning for recent-first order
    await this.saveCareHistory(history);
  },

  async deleteCareHistory(entryId: string): Promise<void> {
    const history = await this.getCareHistory();
    const filtered = history.filter(h => h.id !== entryId);
    await this.saveCareHistory(filtered);
  },

  // Clear all data (useful for development/testing)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        PLANTS_KEY,
        LOCATIONS_KEY,
        CARE_TASKS_KEY,
        CARE_HISTORY_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

