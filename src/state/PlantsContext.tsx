import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { CareHistory, CareTask, GrowSpeed, LightLevel, LightType, Plant, Room, Toxicity, UnitSystem, User, WateringTask, WaterNeeded } from '../types';

interface PlantsContextValue {
  plants: Plant[];
  rooms: Room[];
  user: User | null;
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
  addRoom: (room: Room) => Promise<void>;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  getPlantById: (plantId: string) => Plant | undefined;
  getRoomById: (roomId: string) => Room | undefined;
  getCareTasks: (plantId?: string) => CareTask[];
  getCareHistory: (plantId?: string, limit?: number) => CareHistory[];
  addCareTask: (task: CareTask) => Promise<void>;
  updateCareTask: (taskId: string, updates: Partial<CareTask>) => Promise<void>;
  completeCareTask: (taskId: string, plantId: string) => Promise<void>;
  deleteCareTask: (taskId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User | null>(null);
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
      const room = rooms.find(r => r.id === plant.roomId);
      if (!room) return;

      let nextWateringDate: Date;
      let daysOverdue = 0;

      if (plant.lastWateredDate) {
        const lastWatered = plant.lastWateredDate;
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
        room: room,
        daysOverdue: Math.max(0, daysOverdue),
        nextWateringDate: nextWateringDate,
      });
    });

    // Sort by days overdue (descending)
    return tasks.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [plants, rooms]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedPlants, loadedRooms, loadedTasks, loadedHistory, loadedUser] = await Promise.all([
        storage.getPlants(),
        storage.getRooms(),
        storage.getCareTasks(),
        storage.getCareHistory(),
        storage.getUser(),
      ]);
      setPlants(loadedPlants);
      setRooms(loadedRooms);
      setCareTasks(loadedTasks);
      setCareHistory(loadedHistory);
      
      // Initialize default user if none exists
      if (!loadedUser) {
        const defaultUser: User = {
          name: 'Plant Parent',
          email: 'user@example.com',
          locationName: 'Paris',
          unitSystem: UnitSystem.METRIC,
        };
        await storage.saveUser(defaultUser);
        setUser(defaultUser);
      } else {
        setUser(loadedUser);
      }
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
    const now = new Date();
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
    const now = new Date();
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

  const addRoom = useCallback(async (room: Room) => {
    await storage.addRoom(room);
    setRooms(prev => [...prev, room]);
  }, []);

  const updateRoom = useCallback(async (roomId: string, updates: Partial<Room>) => {
    await storage.updateRoom(roomId, updates);
    setRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteRoom = useCallback(async (roomId: string) => {
    await storage.deleteRoom(roomId);
    setRooms(prev => prev.filter(r => r.id !== roomId));
  }, []);

  const getRoomById = useCallback((roomId: string) => {
    return rooms.find(r => r.id === roomId);
  }, [rooms]);

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

    const now = new Date();
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + task.frequencyDays);

    // Update task
    await storage.updateCareTask(taskId, {
      lastCompletedDate: now,
      nextDueDate: nextDueDate,
    });
    setCareTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, lastCompletedDate: now, nextDueDate: nextDueDate }
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

  const updateUser = useCallback(async (updates: Partial<User>) => {
    await storage.updateUser(updates);
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const initializeWithSampleData = useCallback(async () => {
    // This will be called to populate initial data
    const sampleRooms: Room[] = [
      {
        id: 'room1', name: 'Kitchen', settings: {
          temperature: 20,
          humidity: 40,
          isIndoor: true,
          lightLevel: LightLevel.SUN,
        }
      },
      {
        id: 'room2', name: 'Living Room', settings: {
          temperature: 20,
          humidity: 60,
          isIndoor: true,
          lightLevel: LightLevel.PART_SUN,
        }
      },
      {
        id: 'room3', name: 'Bedroom', settings: {
          temperature: 18,
          humidity: 45,
          isIndoor: true,
          lightLevel: LightLevel.SHADE,
        }
      },
    ];

    const samplePlants: Plant[] = [
      {
        id: 'plant1',
        name: 'Basil',
        roomId: 'room1',
        wateringFrequencyDays: 2,
        lastWateredDate: null,
        createdAt: new Date(),
        settings: {
          light: { type: LightType.DIRECT, distanceFromWindow: 30 },
          pot: { size: 15, hasDrainage: true, material: 'terracotta', soil: 'all-purpose-potting-mix' },
          plantType: { size: 25, variety: 'Sweet Basil', category: 'herb' },
          positionInRoom: {
            isNearAC: false,
            isNearHeater: true,
          },
        },
        careInfo: {
          growSpeed: GrowSpeed.FAST,
          lightNeeded: LightLevel.SUN,
          toxicity: Toxicity.NON_TOXIC,
          waterNeeded: WaterNeeded.HIGH,
          growSpeedDescription: 'Basil grows quickly in the right conditions. You can start harvesting leaves in 3-4 weeks!',
          lightNeededDescription: 'Basil loves sun! Give it 6-8 hours of direct sunlight daily for best growth and flavor.',
          toxicityDescription: 'Basil is completely safe for both humans and pets. In fact, it\'s a delicious culinary herb!',
          waterNeededDescription: 'Keep the soil consistently moist but not waterlogged. Water daily in hot weather.',
        },
      },
      {
        id: 'plant2',
        name: 'Peace Lily',
        roomId: 'room2',
        wateringFrequencyDays: 3,
        lastWateredDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        createdAt: new Date(),
        settings: {
          light: { type: LightType.INDIRECT, distanceFromWindow: 150 },
          pot: { size: 40, hasDrainage: true, material: 'ceramic', soil: 'all-purpose-garden-soil' },
          plantType: { size: 60, category: 'tropical' },
          positionInRoom: {
            isNearAC: false,
            isNearHeater: true,
          },
        },
        careInfo: {
          growSpeed: GrowSpeed.MODERATE,
          lightNeeded: LightLevel.SHADE,
          toxicity: Toxicity.TOXIC_PETS,
          waterNeeded: WaterNeeded.MODERATE,
          growSpeedDescription: 'Peace lilies grow at a steady pace, producing new leaves every few weeks and flowers periodically.',
          lightNeededDescription: 'One of the best low-light plants! Thrives in shade and can even tolerate fluorescent lighting.',
          toxicityDescription: 'Warning: Peace lilies contain calcium oxalates that are toxic to cats and dogs if ingested. Keep out of reach of pets.',
          waterNeededDescription: 'Water when the top inch of soil is dry. The plant will droop slightly when it needs water, making it easy to know when to water.',
        },
      },
      {
        id: 'plant3',
        name: 'Monstera',
        roomId: 'room2',
        wateringFrequencyDays: 7,
        lastWateredDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        createdAt: new Date(),
        settings: {
          light: { type: LightType.INDIRECT, distanceFromWindow: 80 },
          pot: { size: 70, hasDrainage: true, material: 'plastic', soil: 'all-purpose-potting-mix' },
          plantType: { size: 120, category: 'tropical' },
          positionInRoom: {
            isNearAC: false,
            isNearHeater: true,
          },
        },
        careInfo: {
          growSpeed: GrowSpeed.MODERATE,
          lightNeeded: LightLevel.PART_SUN,
          toxicity: Toxicity.TOXIC_PETS,
          waterNeeded: WaterNeeded.MODERATE,
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
        lastCompletedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        createdAt: now,
      },
      {
        id: 'task2',
        plantId: 'plant2',
        type: 'prune',
        title: 'Prune dead leaves',
        description: 'Remove brown or yellow leaves',
        frequencyDays: 30,
        lastCompletedDate: null,
        nextDueDate: now,
        createdAt: now,
      },
      {
        id: 'task3',
        plantId: 'plant3',
        type: 'pest_check',
        title: 'Check for pests',
        description: 'Inspect leaves for spider mites',
        frequencyDays: 7,
        lastCompletedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: now,
      },
      {
        id: 'task4',
        plantId: 'plant3',
        type: 'repot',
        title: 'Repot plant',
        description: 'Move to larger pot',
        frequencyDays: 365,
        lastCompletedDate: null,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isLocked: true,
        createdAt: now,
      },
    ];

    // Sample care history
    const sampleHistory: CareHistory[] = [
      {
        id: 'history1',
        plantId: 'plant2',
        taskType: 'water',
        title: 'Watered',
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'history2',
        plantId: 'plant3',
        taskType: 'water',
        title: 'Watered',
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'history3',
        plantId: 'plant1',
        taskType: 'fertilize',
        title: 'Fertilized',
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'history4',
        plantId: 'plant3',
        taskType: 'pest_check',
        title: 'Checked for pests',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    await storage.saveRooms(sampleRooms);
    await storage.savePlants(samplePlants);
    await storage.saveCareTasks(sampleTasks);
    await storage.saveCareHistory(sampleHistory);

    setRooms(sampleRooms);
    setPlants(samplePlants);
    setCareTasks(sampleTasks);
    setCareHistory(sampleHistory);
  }, []);

  const value: PlantsContextValue = {
    plants,
    rooms,
    user,
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
    addRoom,
    updateRoom,
    deleteRoom,
    getPlantById,
    getRoomById,
    getCareTasks,
    getCareHistory,
    addCareTask,
    updateCareTask,
    completeCareTask,
    deleteCareTask,
    updateUser,
    refreshData,
    initializeWithSampleData,
  };

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
};

