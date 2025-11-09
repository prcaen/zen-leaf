import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plant, Location } from '../types';

const PLANTS_KEY = '@zen_leaf_plants';
const LOCATIONS_KEY = '@zen_leaf_locations';

export const storage = {
  // Plants
  async getPlants(): Promise<Plant[]> {
    try {
      const data = await AsyncStorage.getItem(PLANTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading plants:', error);
      return [];
    }
  },

  async savePlants(plants: Plant[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
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

  // Clear all data (useful for development/testing)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PLANTS_KEY, LOCATIONS_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

