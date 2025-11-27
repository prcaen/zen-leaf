import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlantBasicInfo } from '../types';

// Temporary plant data storage (for plant creation flow)
const TEMP_PLANT_DATA_KEY = '@zen_leaf_temp_plant_data';

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

export const tempPlantStorage = {
  async save(basicInfo: PlantBasicInfo): Promise<void> {
    try {
      const serialized = serializeDates(basicInfo);
      await AsyncStorage.setItem(TEMP_PLANT_DATA_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving temp plant data:', error);
    }
  },

  async get(): Promise<PlantBasicInfo | null> {
    try {
      const data = await AsyncStorage.getItem(TEMP_PLANT_DATA_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return deserializeDates<PlantBasicInfo>(parsed);
    } catch (error) {
      console.error('Error loading temp plant data:', error);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TEMP_PLANT_DATA_KEY);
    } catch (error) {
      console.error('Error clearing temp plant data:', error);
    }
  },
};

