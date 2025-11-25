import { CareHistory, CareTask, CareTaskType, Plant, PlantCatalogItem } from '../types';

/**
 * Calculate plant age in years from acquired date
 * @param acquiredAt - The date when the plant was acquired
 * @returns The age in years, or null if date is not provided
 */
export function calculatePlantAge(acquiredAt: Date | null | undefined): number | null {
  if (!acquiredAt) return null;
  
  const now = new Date();
  const acquired = new Date(acquiredAt);
  const diffMs = now.getTime() - acquired.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  
  return Math.floor(diffYears);
}

/**
 * Format plant age for display
 * @param acquiredAt - The date when the plant was acquired
 * @returns Formatted age string
 */
export function formatPlantAge(acquiredAt: Date | null | undefined): string {
  if (!acquiredAt) return 'Not set';
  
  const acquired = new Date(acquiredAt);
  const now = new Date();
  const diffMs = now.getTime() - acquired.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Less than a day';
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  
  const months = Math.floor(diffDays / 30.44);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  
  const years = Math.floor(months / 12);
  if (years === 0) return 'Less than a year';
  if (years === 1) return '1 year';
  if (years >= 50) return '50 years and more';
  
  return `${years} years`;
}

/**
 * Get the last watered date from care history
 * @param plantId - The plant ID
 * @param careHistory - Array of care history entries
 * @param careTasks - Array of care tasks to look up taskId references
 * @returns The last watered date, or null if never watered
 */
export function getLastWateredDate(plantId: string, careHistory: CareHistory[], careTasks: CareTask[]): Date | null {
  // Find water tasks for this plant
  const waterTasks = careTasks.filter(t => t.plantId === plantId && t.type === CareTaskType.WATER);
  const waterTaskIds = new Set(waterTasks.map(t => t.id));
  
  // Filter history entries that reference water tasks for this plant
  const waterHistory = careHistory
    .filter(h => waterTaskIds.has(h.taskId))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  
  if (waterHistory.length === 0) {
    return null;
  }
  
  return new Date(waterHistory[0].completedAt);
}

/**
 * Compute watering frequency in days based on plant properties
 * @param plant - The plant
 * @param catalogItem - The plant catalog item (optional, for waterNeeded info)
 * @returns The computed watering frequency in days
 */
export function computeWateringFrequencyDays(plant: Plant, catalogItem?: PlantCatalogItem): number {
  // Base frequency based on waterNeeded from catalog (if available)
  let baseDays = 7; // Default to weekly
  
  if (catalogItem) {
    switch (catalogItem.waterNeeded) {
      case 'low':
        baseDays = 14; // Every 2 weeks
        break;
      case 'moderate':
        baseDays = 7; // Weekly
        break;
      case 'high':
        baseDays = 3; // Every 3 days
        break;
    }
  }
  
  // Adjustments based on plant properties
  
  // Pot size: Larger pots hold more water, need less frequent watering
  if (plant.potSize) {
    if (plant.potSize > 60) {
      baseDays += 2; // Large pot: +2 days
    } else if (plant.potSize > 30) {
      baseDays += 1; // Medium pot: +1 day
    }
    // Small pot (<30cm): no adjustment
  }
  
  // Drainage: Pots without drainage need less frequent watering (water stays longer)
  if (plant.hasDrainage === false) {
    baseDays += 2; // No drainage: +2 days
  }
  
  // Pot material: Terracotta dries faster, plastic/ceramic retain moisture
  if (plant.potMaterial) {
    if (plant.potMaterial === 'terracotta') {
      baseDays -= 1; // Terracotta: -1 day (dries faster)
    } else if (plant.potMaterial === 'plastic' || plant.potMaterial === 'ceramic') {
      baseDays += 1; // Plastic/ceramic: +1 day (retains moisture)
    }
  }
  
  // Distance from window: Further from window = less light = less water needed
  if (plant.distanceFromWindow) {
    if (plant.distanceFromWindow > 200) {
      baseDays += 2; // Far from window: +2 days
    } else if (plant.distanceFromWindow > 100) {
      baseDays += 1; // Medium distance: +1 day
    }
  }
  
  // Plant size: Larger plants may need more water, but also have more roots to access water
  // Generally, larger plants in same pot size need slightly more frequent watering
  if (plant.plantSize) {
    if (plant.plantSize > 100) {
      baseDays -= 1; // Large plant: -1 day
    }
  }
  
  // Age: Older plants with established root systems can go longer between waterings
  const plantAge = calculatePlantAge(plant.acquiredAt);
  if (plantAge !== null && plantAge > 2) {
    baseDays += 1; // Mature plant: +1 day
  }
  
  // Environmental factors: Near AC or heater = more frequent watering needed
  if (plant.isNearAC === true) {
    baseDays -= 2; // Near AC: -2 days (dry air)
  }
  
  if (plant.isNearHeater === true) {
    baseDays -= 2; // Near heater: -2 days (dry heat)
  }
  
  // Soil type: Some soils retain moisture better
  if (plant.soil) {
    if (plant.soil === 'clay-soil') {
      baseDays += 1; // Clay soil: +1 day (retains moisture)
    } else if (plant.soil === 'sandy-soil') {
      baseDays -= 1; // Sandy soil: -1 day (drains quickly)
    }
  }
  
  // Ensure minimum of 1 day and maximum of 30 days
  return Math.max(1, Math.min(30, Math.round(baseDays)));
}

