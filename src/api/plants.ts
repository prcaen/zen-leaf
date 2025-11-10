import { Plant, Room } from '../types';

// Placeholder for future API integration
// This file structure is ready for when you want to add backend API calls

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

export const plantsApi = {
  async fetchPlants(): Promise<Plant[]> {
    // TODO: Implement API call
    // const response = await fetch(`${API_BASE_URL}/plants`);
    // return response.json();
    throw new Error('API not implemented yet');
  },

  async fetchPlant(id: string): Promise<Plant> {
    // TODO: Implement API call
    // const response = await fetch(`${API_BASE_URL}/plants/${id}`);
    // return response.json();
    throw new Error('API not implemented yet');
  },

  async createPlant(plant: Omit<Plant, 'id' | 'createdAt'>): Promise<Plant> {
    // TODO: Implement API call
    // const response = await fetch(`${API_BASE_URL}/plants`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(plant),
    // });
    // return response.json();
    throw new Error('API not implemented yet');
  },

  async updatePlant(id: string, updates: Partial<Plant>): Promise<Plant> {
    // TODO: Implement API call
    // const response = await fetch(`${API_BASE_URL}/plants/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates),
    // });
    // return response.json();
    throw new Error('API not implemented yet');
  },

  async deletePlant(id: string): Promise<void> {
    // TODO: Implement API call
    // await fetch(`${API_BASE_URL}/plants/${id}`, {
    //   method: 'DELETE',
    // });
    throw new Error('API not implemented yet');
  },

  async fetchLocations(): Promise<Room[]> {
    // TODO: Implement API call
    // const response = await fetch(`${API_BASE_URL}/locations`);
    // return response.json();
    throw new Error('API not implemented yet');
  },

  async createLocation(location: Omit<Room, 'id'>): Promise<Room> {
    // TODO: Implement API call
    // const response = await fetch(`${API_BASE_URL}/locations`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(location),
    // });
    // return response.json();
    throw new Error('API not implemented yet');
  },

  async syncWithServer(): Promise<{ plants: Plant[]; locations: Room[] }> {
    // TODO: Implement sync logic
    // This would handle syncing local data with the server
    throw new Error('API not implemented yet');
  },
};

