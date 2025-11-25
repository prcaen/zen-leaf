import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CareHistory, CareTask, Plant, Room, User, UserSettings, WateringTask } from '../types';

// Flattened user type for backward compatibility
type FlattenedUser = User & UserSettings;

interface PlantsContextValue {
  plants: Plant[];
  rooms: Room[];
  user: FlattenedUser | null;
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
  updateUser: (updates: Partial<FlattenedUser>) => Promise<void>;
  refreshData: () => Promise<void>;
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
  const [user, setUser] = useState<FlattenedUser | null>(null);
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
        api.getPlants(),
        api.getRooms(),
        api.getCareTasks(),
        api.getCareHistory(),
        api.getUser(),
      ]);
      setPlants(loadedPlants);
      setRooms(loadedRooms);
      setCareTasks(loadedTasks);
      setCareHistory(loadedHistory);
      
      // Flatten user with settings for backward compatibility
      if (loadedUser) {
        setUser({
          ...loadedUser,
          ...loadedUser.settings,
        });
      } else {
        setUser(null);
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
    const updatedPlant = await api.updatePlant(plantId, { lastWateredDate: now });
    setPlants(prev =>
      prev.map(p => (p.id === plantId ? updatedPlant : p))
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
    const savedHistory = await api.addCareHistory(historyEntry);
    setCareHistory(prev => [savedHistory, ...prev]);
  }, []);

  const waterSelectedPlants = useCallback(async () => {
    const now = new Date();
    const plantIds = Array.from(selectedPlants);

    const updatedPlants = await Promise.all(
      plantIds.map(id => api.updatePlant(id, { lastWateredDate: now }))
    );

    setPlants(prev =>
      prev.map(p => {
        const updated = updatedPlants.find(up => up.id === p.id);
        return updated || p;
      })
    );
    setSelectedPlants(new Set());
  }, [selectedPlants]);

  const addPlant = useCallback(async (plant: Plant) => {
    const savedPlant = await api.addPlant(plant);
    setPlants(prev => [...prev, savedPlant]);
  }, []);

  const updatePlant = useCallback(async (plantId: string, updates: Partial<Plant>) => {
    const updatedPlant = await api.updatePlant(plantId, updates);
    setPlants(prev =>
      prev.map(p => (p.id === plantId ? updatedPlant : p))
    );
  }, []);

  const deletePlant = useCallback(async (plantId: string) => {
    await api.deletePlant(plantId);
    setPlants(prev => prev.filter(p => p.id !== plantId));
  }, []);

  const addRoom = useCallback(async (room: Room) => {
    const savedRoom = await api.addRoom(room);
    setRooms(prev => [...prev, savedRoom]);
  }, []);

  const updateRoom = useCallback(async (roomId: string, updates: Partial<Room>) => {
    const updatedRoom = await api.updateRoom(roomId, updates);
    setRooms(prev =>
      prev.map(r => (r.id === roomId ? updatedRoom : r))
    );
  }, []);

  const deleteRoom = useCallback(async (roomId: string) => {
    await api.deleteRoom(roomId);
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
    const savedTask = await api.addCareTask(task);
    setCareTasks(prev => [...prev, savedTask]);
  }, []);

  const updateCareTask = useCallback(async (taskId: string, updates: Partial<CareTask>) => {
    const updatedTask = await api.updateCareTask(taskId, updates);
    setCareTasks(prev =>
      prev.map(t => (t.id === taskId ? updatedTask : t))
    );
  }, []);

  const completeCareTask = useCallback(async (taskId: string, plantId: string) => {
    const task = careTasks.find(t => t.id === taskId);
    if (!task) return;

    const now = new Date();
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + task.frequencyDays);

    // Update task
    const updatedTask = await api.updateCareTask(taskId, {
      lastCompletedDate: now,
      nextDueDate: nextDueDate,
    });
    setCareTasks(prev =>
      prev.map(t => (t.id === taskId ? updatedTask : t))
    );

    // Add to history
    const historyEntry: CareHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plantId,
      taskType: task.type,
      title: task.title,
      completedAt: now,
    };
    const savedHistory = await api.addCareHistory(historyEntry);
    setCareHistory(prev => [savedHistory, ...prev]);
  }, [careTasks]);

  const deleteCareTask = useCallback(async (taskId: string) => {
    await api.deleteCareTask(taskId);
    setCareTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const updateUser = useCallback(async (updates: Partial<FlattenedUser>) => {
    if (!user) return;

    // Separate auth updates (name, email) from settings updates
    const { name, email, locationName, unitSystem, ...rest } = updates;
    
    // Update name via auth if provided
    if (name !== undefined) {
      await api.updateUserName(name);
    }

    // Update settings if provided
    const settingsUpdates: Partial<UserSettings> = {};
    if (locationName !== undefined) {
      settingsUpdates.locationName = locationName;
    }
    if (unitSystem !== undefined) {
      settingsUpdates.unitSystem = unitSystem;
    }

    if (Object.keys(settingsUpdates).length > 0) {
      await api.updateUserSettings(settingsUpdates);
    }

    // Reload user data to get updated values
    const updatedUser = await api.getUser();
    if (updatedUser) {
      setUser({
        ...updatedUser,
        ...updatedUser.settings,
      });
    }
  }, [user]);

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
  };

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
};

