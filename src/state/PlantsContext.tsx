import * as Crypto from 'expo-crypto';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CareHistory, CareTask, CareTaskType, Plant, Room, User, UserSettings } from '../types';

// Flattened user type for backward compatibility
type FlattenedUser = User & UserSettings;

interface PlantsContextValue {
  plants: Plant[];
  rooms: Room[];
  user: FlattenedUser | null;
  loading: boolean;
  wateringTasks: CareTask[]; // CareTasks with type=CareTaskType.WATER
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

  // Get watering tasks (CareTasks with type=CareTaskType.WATER)
  const wateringTasks = React.useMemo((): CareTask[] => {
    return careTasks.filter(task => task.type === CareTaskType.WATER);
  }, [careTasks]);

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
      nextDueDate: nextDueDate,
    });
    setCareTasks(prev =>
      prev.map(t => (t.id === taskId ? updatedTask : t))
    );

    // Add to history
    const historyEntry: CareHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: taskId,
      completedAt: now,
    };
    const savedHistory = await api.addCareHistory(historyEntry);
    setCareHistory(prev => [savedHistory, ...prev]);
  }, [careTasks]);

  const waterPlant = useCallback(async (plantId: string) => {
    // Find the water CareTask for this plant
    const waterTask = careTasks.find(t => t.plantId === plantId && t.type === CareTaskType.WATER);
    if (waterTask) {
      // Complete the CareTask
      await completeCareTask(waterTask.id, plantId);
    }
    
    setSelectedPlants(prev => {
      const newSet = new Set(prev);
      newSet.delete(plantId);
      return newSet;
    });
  }, [careTasks, completeCareTask]);

  const addPlant = useCallback(async (plant: Plant) => {
    const savedPlant = await api.addPlant(plant);
    setPlants(prev => [...prev, savedPlant]);
    
    // Create a water CareTask for the new plant
    try {
      // Get watering frequency from edge function
      const { watering_frequency_days, next_watering_date } = await api.getWateringFrequency(savedPlant.id);
      
      // Create water CareTask
      const now = new Date();
      const waterTask: CareTask = {
        id: Crypto.randomUUID(),
        plantId: savedPlant.id,
        type: CareTaskType.WATER,
        frequencyDays: Math.round(watering_frequency_days),
        nextDueDate: new Date(next_watering_date),
        createdAt: now,
      };
      
      await addCareTask(waterTask);
    } catch (error) {
      console.error('Error creating water CareTask for new plant:', error);
      // Don't fail plant creation if CareTask creation fails
    }
  }, [addCareTask]);

  const updatePlant = useCallback(async (plantId: string, updates: Partial<Plant>) => {
    const updatedPlant = await api.updatePlant(plantId, updates);
    setPlants(prev =>
      prev.map(p => (p.id === plantId ? updatedPlant : p))
    );
    
    // If plant properties that affect watering frequency changed, update the water CareTask
    const frequencyAffectingProps = [
      'distanceFromWindow', 'potSize', 'hasDrainage', 'potMaterial', 
      'soil', 'plantSize', 'age', 'isNearAC', 'isNearHeater', 'catalogItemId'
    ];
    
    const shouldUpdateFrequency = Object.keys(updates).some(key => 
      frequencyAffectingProps.includes(key)
    );
    
    if (shouldUpdateFrequency) {
      try {
        // Find existing water CareTask
        const waterTask = careTasks.find(t => t.plantId === plantId && t.type === CareTaskType.WATER);
        if (waterTask) {
          // Get watering frequency from edge function
          const { watering_frequency_days, next_watering_date } = await api.getWateringFrequency(plantId);
          
          // Update CareTask frequency and nextDueDate
          // Find the most recent completion from history
          const waterHistory = careHistory
            .filter(h => h.taskId === waterTask.id)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
          
          let nextDueDate: Date;
          if (waterHistory.length > 0) {
            // If task was completed before, calculate from last completion
            nextDueDate = new Date(waterHistory[0].completedAt);
            nextDueDate.setDate(nextDueDate.getDate() + Math.round(watering_frequency_days));
          } else {
            // If never completed, use the next_watering_date from the edge function
            nextDueDate = new Date(next_watering_date);
          }
          
          await updateCareTask(waterTask.id, {
            frequencyDays: Math.round(watering_frequency_days),
            nextDueDate: nextDueDate,
          });
        }
      } catch (error) {
        console.error('Error updating water CareTask frequency:', error);
        // Don't fail plant update if CareTask update fails
      }
    }
  }, [careTasks, careHistory, updateCareTask]);

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
    let history = careHistory;
    
    // If plantId is provided, filter by looking up plantId from CareTask
    if (plantId) {
      const plantTaskIds = new Set(
        careTasks.filter(t => t.plantId === plantId).map(t => t.id)
      );
      history = history.filter(h => plantTaskIds.has(h.taskId));
    }
    
    return limit ? history.slice(0, limit) : history;
  }, [careHistory, careTasks]);

  const deleteCareTask = useCallback(async (taskId: string) => {
    await api.deleteCareTask(taskId);
    setCareTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const updateUser = useCallback(async (updates: Partial<FlattenedUser>) => {
    if (!user) return;

    // Separate auth updates (name, email) from settings updates
    const { displayName: name, email, locationName, unitSystem, ...rest } = updates;
    
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

