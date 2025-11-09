import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { Location, Plant, WateringTask } from '../types';

interface PlantsContextValue {
  plants: Plant[];
  locations: Location[];
  loading: boolean;
  wateringTasks: WateringTask[];
  selectedPlants: Set<string>;
  togglePlantSelection: (plantId: string) => void;
  waterPlant: (plantId: string) => Promise<void>;
  addPlant: (plant: Plant) => Promise<void>;
  updatePlant: (plantId: string, updates: Partial<Plant>) => Promise<void>;
  deletePlant: (plantId: string) => Promise<void>;
  addLocation: (location: Location) => Promise<void>;
  updateLocation: (locationId: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  initializeWithSampleData: () => Promise<void>;
}

const PlantsContext = createContext<PlantsContextValue | undefined>(undefined);

export const usePlants = () => {
  const context = useContext(PlantsContext);
  if (!context) {
    throw new Error('usePlants must be used within PlantsProvider');
  }
  return context;
};

interface PlantsProviderProps {
  children: ReactNode;
}

export const PlantsProvider: React.FC<PlantsProviderProps> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(new Set());

  // Calculate watering tasks
  const wateringTasks = React.useMemo((): WateringTask[] => {
    const tasks: WateringTask[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    plants.forEach(plant => {
      const location = locations.find(l => l.id === plant.locationId);
      if (!location) return;

      let nextWateringDate: Date;
      let daysOverdue = 0;

      if (plant.lastWateredDate) {
        const lastWatered = new Date(plant.lastWateredDate);
        nextWateringDate = new Date(lastWatered);
        nextWateringDate.setDate(lastWatered.getDate() + plant.wateringFrequencyDays);
        
        const diffTime = today.getTime() - nextWateringDate.getTime();
        daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      } else {
        // Never watered, needs water now
        nextWateringDate = today;
        daysOverdue = 0;
      }

      tasks.push({
        plantId: plant.id,
        plant,
        location,
        daysOverdue: Math.max(0, daysOverdue),
        isOverdue: daysOverdue > 0,
        nextWateringDate: nextWateringDate.toISOString(),
      });
    });

    // Sort by days overdue (descending)
    return tasks.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [plants, locations]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedPlants, loadedLocations] = await Promise.all([
        storage.getPlants(),
        storage.getLocations(),
      ]);
      setPlants(loadedPlants);
      setLocations(loadedLocations);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    await loadData();
  }, []);

  const togglePlantSelection = useCallback((plantId: string) => {
    setSelectedPlants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(plantId)) {
        newSet.delete(plantId);
      } else {
        newSet.add(plantId);
      }
      return newSet;
    });
  }, []);

  const waterPlant = useCallback(async (plantId: string) => {
    const now = new Date().toISOString();
    await storage.updatePlant(plantId, { lastWateredDate: now });
    setPlants(prev =>
      prev.map(p => (p.id === plantId ? { ...p, lastWateredDate: now } : p))
    );
    setSelectedPlants(prev => {
      const newSet = new Set(prev);
      newSet.delete(plantId);
      return newSet;
    });
  }, []);

  const waterSelectedPlants = useCallback(async () => {
    const now = new Date().toISOString();
    const plantIds = Array.from(selectedPlants);
    
    await Promise.all(
      plantIds.map(id => storage.updatePlant(id, { lastWateredDate: now }))
    );

    setPlants(prev =>
      prev.map(p =>
        selectedPlants.has(p.id) ? { ...p, lastWateredDate: now } : p
      )
    );
    setSelectedPlants(new Set());
  }, [selectedPlants]);

  const addPlant = useCallback(async (plant: Plant) => {
    await storage.addPlant(plant);
    setPlants(prev => [...prev, plant]);
  }, []);

  const updatePlant = useCallback(async (plantId: string, updates: Partial<Plant>) => {
    await storage.updatePlant(plantId, updates);
    setPlants(prev =>
      prev.map(p => (p.id === plantId ? { ...p, ...updates } : p))
    );
  }, []);

  const deletePlant = useCallback(async (plantId: string) => {
    await storage.deletePlant(plantId);
    setPlants(prev => prev.filter(p => p.id !== plantId));
  }, []);

  const addLocation = useCallback(async (location: Location) => {
    await storage.addLocation(location);
    setLocations(prev => [...prev, location]);
  }, []);

  const updateLocation = useCallback(async (locationId: string, updates: Partial<Location>) => {
    await storage.updateLocation(locationId, updates);
    setLocations(prev =>
      prev.map(l => (l.id === locationId ? { ...l, ...updates } : l))
    );
  }, []);

  const deleteLocation = useCallback(async (locationId: string) => {
    await storage.deleteLocation(locationId);
    setLocations(prev => prev.filter(l => l.id !== locationId));
  }, []);

  const initializeWithSampleData = useCallback(async () => {
    // This will be called to populate initial data
    const sampleLocations: Location[] = [
      { id: 'loc1', name: 'Kitchen' },
      { id: 'loc2', name: 'Living Room' },
      { id: 'loc3', name: 'Bedroom' },
    ];

    const samplePlants: Plant[] = [
      {
        id: 'plant1',
        name: 'Basil',
        locationId: 'loc1',
        wateringFrequencyDays: 2,
        lastWateredDate: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plant2',
        name: 'Peace Lily',
        locationId: 'loc2',
        wateringFrequencyDays: 3,
        lastWateredDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plant3',
        name: 'Monstera',
        locationId: 'loc2',
        wateringFrequencyDays: 7,
        lastWateredDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        createdAt: new Date().toISOString(),
      },
    ];

    await storage.saveLocations(sampleLocations);
    await storage.savePlants(samplePlants);
    setLocations(sampleLocations);
    setPlants(samplePlants);
  }, []);

  const value: PlantsContextValue = {
    plants,
    locations,
    loading,
    wateringTasks,
    selectedPlants,
    togglePlantSelection,
    waterPlant,
    waterSelectedPlants,
    addPlant,
    updatePlant,
    deletePlant,
    addLocation,
    updateLocation,
    deleteLocation,
    refreshData,
    initializeWithSampleData,
  };

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
};

