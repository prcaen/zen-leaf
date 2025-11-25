import { PlantCatalogItem } from '../data/plantCatalog';
import { CareHistory, CareTask, LightLevel, Plant, Room, UnitSystem, User, UserSettings, UserWithSettings } from '../types';
import { supabase } from './supabase';

// Helper to convert camelCase to snake_case for database columns
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const snakeObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = toSnakeCase(key);
        snakeObj[snakeKey] = camelToSnake(obj[key]);
      }
    }
    return snakeObj;
  }

  return obj;
}

// Helper to convert snake_case to camelCase for TypeScript
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const camelObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = toCamelCase(key);
        camelObj[camelKey] = snakeToCamel(obj[key]);
      }
    }
    return camelObj;
  }

  return obj;
}

// Helper to convert Date objects to ISO strings for Supabase
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

// Helper to convert ISO strings back to Date objects
function deserializeDates<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
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

// Helper to get current user ID
async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export const api = {
  // Plants
  async getPlants(): Promise<Plant[]> {
    try {
      const userId = await getUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => {
        const camelCase = snakeToCamel(item);
        return deserializeDates<Plant>(camelCase);
      });
    } catch (error) {
      console.error('Error fetching plants:', error);
      return [];
    }
  },

  async addPlant(plant: Plant): Promise<Plant> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(plant);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('plants')
        .insert({ ...snakeCase, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      const camelCase = snakeToCamel(data);
      return deserializeDates<Plant>(camelCase);
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  },

  async updatePlant(plantId: string, updates: Partial<Plant>): Promise<Plant> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(updates);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('plants')
        .update(snakeCase)
        .eq('id', plantId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      const camelCase = snakeToCamel(data);
      return deserializeDates<Plant>(camelCase);
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  },

  async deletePlant(plantId: string): Promise<void> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    try {
      const userId = await getUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => {
        const camelCase = snakeToCamel(item);
        return deserializeDates<Room>(camelCase);
      });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  },

  async addRoom(room: Room): Promise<Room> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(room);
      const snakeCase = camelToSnake(serialized);
      
      // Explicitly construct the insert object to ensure user_id is included
      const insertData: any = {
        id: snakeCase.id,
        name: snakeCase.name,
        user_id: userId,
      };
      
      if (snakeCase.settings) {
        insertData.settings = snakeCase.settings;
      }
      
      const { data, error } = await supabase
        .from('rooms')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
      
      const camelCase = snakeToCamel(data);
      return deserializeDates<Room>(camelCase);
    } catch (error) {
      console.error('Error adding room:', error);
      throw error;
    }
  },

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(updates);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('rooms')
        .update(snakeCase)
        .eq('id', roomId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      const camelCase = snakeToCamel(data);
      return deserializeDates<Room>(camelCase);
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  async deleteRoom(roomId: string): Promise<void> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Care Tasks
  async getCareTasks(plantId?: string): Promise<CareTask[]> {
    try {
      const userId = await getUserId();
      if (!userId) return [];

      let query = supabase
        .from('care_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('next_due_date', { ascending: true });

      if (plantId) {
        query = query.eq('plant_id', plantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(item => {
        const camelCase = snakeToCamel(item);
        return deserializeDates<CareTask>(camelCase);
      });
    } catch (error) {
      console.error('Error fetching care tasks:', error);
      return [];
    }
  },

  async addCareTask(task: CareTask): Promise<CareTask> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(task);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('care_tasks')
        .insert({ ...snakeCase, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      const camelCase = snakeToCamel(data);
      return deserializeDates<CareTask>(camelCase);
    } catch (error) {
      console.error('Error adding care task:', error);
      throw error;
    }
  },

  async updateCareTask(taskId: string, updates: Partial<CareTask>): Promise<CareTask> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(updates);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('care_tasks')
        .update(snakeCase)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      const camelCase = snakeToCamel(data);
      return deserializeDates<CareTask>(camelCase);
    } catch (error) {
      console.error('Error updating care task:', error);
      throw error;
    }
  },

  async deleteCareTask(taskId: string): Promise<void> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('care_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting care task:', error);
      throw error;
    }
  },

  // Care History
  async getCareHistory(plantId?: string): Promise<CareHistory[]> {
    try {
      const userId = await getUserId();
      if (!userId) return [];

      let query = supabase
        .from('care_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (plantId) {
        query = query.eq('plant_id', plantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(item => {
        const camelCase = snakeToCamel(item);
        return deserializeDates<CareHistory>(camelCase);
      });
    } catch (error) {
      console.error('Error fetching care history:', error);
      return [];
    }
  },

  async addCareHistory(entry: CareHistory): Promise<CareHistory> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(entry);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('care_history')
        .insert({ ...snakeCase, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      const camelCase = snakeToCamel(data);
      return deserializeDates<CareHistory>(camelCase);
    } catch (error) {
      console.error('Error adding care history:', error);
      throw error;
    }
  },

  async deleteCareHistory(entryId: string): Promise<void> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('care_history')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting care history:', error);
      throw error;
    }
  },

  // User - Get user data from auth and settings from user_settings table
  async getUser(): Promise<UserWithSettings | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      console.log('authUser', authUser);

      // Get user data from auth
      const user: User = {
        id: authUser.id,
        name: authUser.user_metadata?.display_name,
        email: authUser.email ?? '',
      };

      // Get user settings from user_settings table
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      let settings: UserSettings;
      if (settingsError) {
        // Settings might not exist yet, create defaults
        if (settingsError.code === 'PGRST116') {
          settings = {
            locationName: 'Paris',
            unitSystem: UnitSystem.METRIC,
          };
          // Create default settings
          await this.saveUserSettings(settings);
        } else {
          throw settingsError;
        }
      } else {
        const camelCase = snakeToCamel(settingsData);
        settings = {
          locationName: camelCase.locationName || 'Paris',
          unitSystem: camelCase.unitSystem || UnitSystem.METRIC,
        };
      }

      return {
        ...user,
        settings,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Get user settings only
  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const userId = await getUserId();
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      const camelCase = snakeToCamel(data);
      return {
        locationName: camelCase.locationName || 'Paris',
        unitSystem: camelCase.unitSystem || UnitSystem.METRIC,
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  },

  // Save user settings
  async saveUserSettings(settings: UserSettings): Promise<UserSettings> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(settings);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, ...snakeCase })
        .select()
        .single();

      if (error) throw error;
      const camelCase = snakeToCamel(data);
      return {
        locationName: camelCase.locationName,
        unitSystem: camelCase.unitSystem,
      };
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  },

  // Update user settings
  async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const serialized = serializeDates(updates);
      const snakeCase = camelToSnake(serialized);
      const { data, error } = await supabase
        .from('user_settings')
        .update(snakeCase)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        // If settings don't exist, create them
        if (error.code === 'PGRST116') {
          const defaultSettings: UserSettings = {
            locationName: 'Paris',
            unitSystem: UnitSystem.METRIC,
            ...updates,
          };
          return await this.saveUserSettings(defaultSettings);
        }
        throw error;
      }

      const camelCase = snakeToCamel(data);
      return {
        locationName: camelCase.locationName,
        unitSystem: camelCase.unitSystem,
      };
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // Update user name (via auth metadata)
  async updateUserName(name: string): Promise<User> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not authenticated');

      const { data, error } = await supabase.auth.updateUser({
        data: { name, display_name: name },
      });

      if (error) throw error;

      return {
        id: data.user.id,
        name: data.user.user_metadata?.display_name,
        email: data.user.email ?? '',
      };
    } catch (error) {
      console.error('Error updating user name:', error);
      throw error;
    }
  },

  // Plant Catalog (public, no authentication required)
  async getPlantCatalog(): Promise<PlantCatalogItem[]> {
    try {
      const { data, error } = await supabase
        .from('plant_catalog')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Convert database format to TypeScript format
      return data.map((item: any) => {
        // Convert 'part_sun' from DB to 'part sun' for TypeScript enum
        let lightLevelValue: string = item.light_level;
        if (lightLevelValue === 'part_sun') {
          lightLevelValue = 'part sun';
        }
        
        // Map string to LightLevel enum
        const lightLevelMap: Record<string, LightLevel> = {
          'sun': LightLevel.SUN,
          'part sun': LightLevel.PART_SUN,
          'shade': LightLevel.SHADE,
          'dark': LightLevel.DARK,
        };
        
        return {
          id: item.id,
          name: item.name,
          aliases: item.aliases || '',
          difficulty: item.difficulty as 'Easy' | 'Moderate' | 'Advanced',
          lightLevel: lightLevelMap[lightLevelValue] || LightLevel.PART_SUN,
          imageUrl: item.image_url || undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching plant catalog:', error);
      throw error;
    }
  },
};

