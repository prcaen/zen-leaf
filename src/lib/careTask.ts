import { CareTask, CareTaskType } from '../types';

export interface CareTaskTypeInfo {
  title: string;
  description?: string;
}

/**
 * Get title and description for a CareTaskType
 * @param type - The care task type
 * @returns Object with title and optional description
 */
export function getCareTaskTypeInfo(type: CareTaskType): CareTaskTypeInfo {
  const typeMap: Record<CareTaskType, CareTaskTypeInfo> = {
    [CareTaskType.WATER]: {
      title: 'Water',
      description: 'Water your plant to keep it hydrated',
    },
    [CareTaskType.FERTILIZE]: {
      title: 'Fertilize',
      description: 'Add nutrients to support healthy growth',
    },
    [CareTaskType.REPOT]: {
      title: 'Repot',
      description: 'Move to a larger pot to accommodate growth',
    },
    [CareTaskType.PRUNE]: {
      title: 'Prune',
      description: 'Trim dead or overgrown parts to maintain shape',
    },
    [CareTaskType.PEST_CHECK]: {
      title: 'Pest Check',
      description: 'Inspect for pests and treat if necessary',
    },
    [CareTaskType.OTHER]: {
      title: 'Other',
      description: 'Additional care task',
    },
  };

  return typeMap[type];
}

/**
 * Get title for a CareTaskType
 * @param type - The care task type
 * @returns The title string
 */
export function getCareTaskTitle(type: CareTaskType): string {
  return getCareTaskTypeInfo(type).title;
}

/**
 * Get description for a CareTaskType
 * @param type - The care task type
 * @returns The description string or undefined
 */
export function getCareTaskDescription(type: CareTaskType): string | undefined {
  return getCareTaskTypeInfo(type).description;
}

/**
 * Check if a care task is due today or overdue
 * @param task - The care task to check
 * @returns True if the task is due today or overdue, false otherwise
 */
export function isDueToday(task: CareTask): boolean {
  if (!task.nextDueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.nextDueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate <= today;
}

