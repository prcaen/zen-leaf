import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { CareHistory, CareTask, Location, Plant, WateringTask } from '../types';

interface PlantsContextValue {
  plants: Plant[];
  locations: Location[];
  loading: boolean;
  wateringTasks: WateringTask[];
  selectedPlants: Set<string>;
  careTasks: CareTask[];
  careHistory: CareHistory[];
  togglePlantSelection: (plantId: string) => void;
  waterPlant: (plantId: string) => Promise<void>;
  addPlant: (plant: Plant) => Promise<void>;
  updatePlant: (plantId: string, updates: Partial<Plant>) => Promise<void>;
  deletePlant: (plantId: string) => Promise<void>;
  addLocation: (location: Location) => Promise<void>;
  updateLocation: (locationId: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  getPlantById: (plantId: string) => Plant | undefined;
  getCareTasks: (plantId?: string) => CareTask[];
  getCareHistory: (plantId?: string, limit?: number) => CareHistory[];
  addCareTask: (task: CareTask) => Promise<void>;
  updateCareTask: (taskId: string, updates: Partial<CareTask>) => Promise<void>;
  completeCareTask: (taskId: string, plantId: string) => Promise<void>;
  deleteCareTask: (taskId: string) => Promise<void>;
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
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [careHistory, setCareHistory] = useState<CareHistory[]>([]);
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
      const [loadedPlants, loadedLocations, loadedTasks, loadedHistory] = await Promise.all([
        storage.getPlants(),
        storage.getLocations(),
        storage.getCareTasks(),
        storage.getCareHistory(),
      ]);
      setPlants(loadedPlants);
      setLocations(loadedLocations);
      setCareTasks(loadedTasks);
      setCareHistory(loadedHistory);
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

    // Add to history
    const historyEntry: CareHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plantId,
      taskType: 'water',
      title: 'Watered',
      completedAt: now,
    };
    await storage.addCareHistory(historyEntry);
    setCareHistory(prev => [historyEntry, ...prev]);
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

  const getPlantById = useCallback((plantId: string) => {
    return plants.find(p => p.id === plantId);
  }, [plants]);

  const getCareTasks = useCallback((plantId?: string) => {
    return plantId ? careTasks.filter(t => t.plantId === plantId) : careTasks;
  }, [careTasks]);

  const getCareHistory = useCallback((plantId?: string, limit?: number) => {
    let history = plantId ? careHistory.filter(h => h.plantId === plantId) : careHistory;
    return limit ? history.slice(0, limit) : history;
  }, [careHistory]);

  const addCareTask = useCallback(async (task: CareTask) => {
    await storage.addCareTask(task);
    setCareTasks(prev => [...prev, task]);
  }, []);

  const updateCareTask = useCallback(async (taskId: string, updates: Partial<CareTask>) => {
    await storage.updateCareTask(taskId, updates);
    setCareTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const completeCareTask = useCallback(async (taskId: string, plantId: string) => {
    const task = careTasks.find(t => t.id === taskId);
    if (!task) return;

    const now = new Date().toISOString();
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + task.frequencyDays);

    // Update task
    await storage.updateCareTask(taskId, {
      lastCompletedDate: now,
      nextDueDate: nextDueDate.toISOString(),
    });
    setCareTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, lastCompletedDate: now, nextDueDate: nextDueDate.toISOString() }
          : t
      )
    );

    // Add to history
    const historyEntry: CareHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plantId,
      taskType: task.type,
      title: task.title,
      completedAt: now,
    };
    await storage.addCareHistory(historyEntry);
    setCareHistory(prev => [historyEntry, ...prev]);
  }, [careTasks]);

  const deleteCareTask = useCallback(async (taskId: string) => {
    await storage.deleteCareTask(taskId);
    setCareTasks(prev => prev.filter(t => t.id !== taskId));
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
        settings: {
          light: { level: 'high', type: 'direct' },
          pot: { size: '6 inch', hasDrainage: true, material: 'terracotta' },
          plantType: { species: 'Ocimum basilicum', variety: 'Sweet Basil', category: 'herb' },
          room: { temperature: 22, humidity: 60, roomType: 'kitchen' },
          location: { isIndoor: true, climate: 'temperate' },
        },
        careInfo: {
          growSpeed: 'fast',
          lightNeeded: 'high',
          toxicity: 'non-toxic',
          waterNeeded: 'high',
          growSpeedDescription: 'Basil grows quickly in the right conditions. You can start harvesting leaves in 3-4 weeks!',
          lightNeededDescription: 'Basil loves sun! Give it 6-8 hours of direct sunlight daily for best growth and flavor.',
          toxicityDescription: 'Basil is completely safe for both humans and pets. In fact, it\'s a delicious culinary herb!',
          waterNeededDescription: 'Keep the soil consistently moist but not waterlogged. Water daily in hot weather.',
        },
      },
      {
        id: 'plant2',
        name: 'Peace Lily',
        locationId: 'loc2',
        wateringFrequencyDays: 3,
        lastWateredDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        createdAt: new Date().toISOString(),
        settings: {
          light: { level: 'low', type: 'indirect' },
          pot: { size: 'medium', hasDrainage: true, material: 'ceramic' },
          plantType: { species: 'Spathiphyllum', category: 'tropical' },
          room: { temperature: 20, humidity: 70, roomType: 'living room' },
          location: { isIndoor: true, climate: 'humid' },
        },
        careInfo: {
          growSpeed: 'moderate',
          lightNeeded: 'low',
          toxicity: 'toxic-pets',
          waterNeeded: 'moderate',
          growSpeedDescription: 'Peace lilies grow at a steady pace, producing new leaves every few weeks and flowers periodically.',
          lightNeededDescription: 'One of the best low-light plants! Thrives in shade and can even tolerate fluorescent lighting.',
          toxicityDescription: 'Warning: Peace lilies contain calcium oxalates that are toxic to cats and dogs if ingested. Keep out of reach of pets.',
          waterNeededDescription: 'Water when the top inch of soil is dry. The plant will droop slightly when it needs water, making it easy to know when to water.',
        },
      },
      {
        id: 'plant3',
        name: 'Monstera',
        locationId: 'loc2',
        wateringFrequencyDays: 7,
        lastWateredDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        createdAt: new Date().toISOString(),
        settings: {
          light: { level: 'medium', type: 'indirect' },
          pot: { size: 'large', hasDrainage: true, material: 'plastic' },
          plantType: { species: 'Monstera deliciosa', category: 'tropical' },
          room: { temperature: 21, humidity: 65, roomType: 'living room' },
          location: { isIndoor: true, climate: 'tropical' },
        },
        careInfo: {
          growSpeed: 'moderate',
          lightNeeded: 'medium',
          toxicity: 'toxic-pets',
          waterNeeded: 'moderate',
          growSpeedDescription: 'Monsteras grow steadily, producing a new leaf every 4-6 weeks in optimal conditions. They can become quite large over time!',
          lightNeededDescription: 'Bright, indirect light is perfect. Direct sunlight can burn the leaves, while too little light slows growth.',
          toxicityDescription: 'Caution: Monstera leaves contain calcium oxalates and are toxic to pets and can cause irritation in humans. Keep away from curious pets and children.',
          waterNeededDescription: 'Water when the top 2-3 inches of soil are dry. Monsteras prefer to dry out slightly between waterings.',
        },
      },
    ];

    // Sample care tasks
    const now = new Date();
    const sampleTasks: CareTask[] = [
      {
        id: 'task1',
        plantId: 'plant1',
        type: 'fertilize',
        title: 'Fertilize',
        description: 'Apply balanced liquid fertilizer',
        frequencyDays: 14,
        lastCompletedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        nextDueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 'task2',
        plantId: 'plant2',
        type: 'prune',
        title: 'Prune dead leaves',
        description: 'Remove brown or yellow leaves',
        frequencyDays: 30,
        lastCompletedDate: null,
        nextDueDate: now.toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 'task3',
        plantId: 'plant3',
        type: 'pest_check',
        title: 'Check for pests',
        description: 'Inspect leaves for spider mites',
        frequencyDays: 7,
        lastCompletedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        nextDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now.toISOString(),
      },
      {
        id: 'task4',
        plantId: 'plant3',
        type: 'repot',
        title: 'Repot plant',
        description: 'Move to larger pot',
        frequencyDays: 365,
        lastCompletedDate: null,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isLocked: true,
        createdAt: now.toISOString(),
      },
    ];

    // Sample care history
    const sampleHistory: CareHistory[] = [
      {
        id: 'history1',
        plantId: 'plant2',
        taskType: 'water',
        title: 'Watered',
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'history2',
        plantId: 'plant3',
        taskType: 'water',
        title: 'Watered',
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'history3',
        plantId: 'plant1',
        taskType: 'fertilize',
        title: 'Fertilized',
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'history4',
        plantId: 'plant3',
        taskType: 'pest_check',
        title: 'Checked for pests',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    await storage.saveLocations(sampleLocations);
    await storage.savePlants(samplePlants);
    await storage.saveCareTasks(sampleTasks);
    await storage.saveCareHistory(sampleHistory);
    
    setLocations(sampleLocations);
    setPlants(samplePlants);
    setCareTasks(sampleTasks);
    setCareHistory(sampleHistory);
  }, []);

  const value: PlantsContextValue = {
    plants,
    locations,
    loading,
    wateringTasks,
    selectedPlants,
    careTasks,
    careHistory,
    togglePlantSelection,
    waterPlant,
    addPlant,
    updatePlant,
    deletePlant,
    addLocation,
    updateLocation,
    deleteLocation,
    getPlantById,
    getCareTasks,
    getCareHistory,
    addCareTask,
    updateCareTask,
    completeCareTask,
    deleteCareTask,
    refreshData,
    initializeWithSampleData,
  };

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
};

