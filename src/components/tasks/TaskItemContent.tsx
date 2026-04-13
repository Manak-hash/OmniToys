import type { Task } from '@/types/task'

export interface TaskItemContentProps {
  task: Task
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  onToggleCollapse: (taskId: string) => void
  onEdit: (task: Task) => void
  onCreateSubtask?: (parentTaskId: string) => void
  level?: number
  isOver?: boolean
  isDragTarget?: boolean
}

export function TaskItemContent() {
  return <div>TaskItemContent placeholder - will be implemented in Task 2</div>
}