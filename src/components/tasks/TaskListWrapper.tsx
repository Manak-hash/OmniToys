import { useProjectTasks, useTaskStore } from '@/store/taskStore'
import { TaskList } from './TaskList'
import type { Task } from '@/types/task'

interface TaskListWrapperProps {
  projectId: string
  className?: string
}

export function TaskListWrapper({ projectId, className }: TaskListWrapperProps) {
  const tasks = useProjectTasks(projectId)
  const { setSelectedTask } = useTaskStore()

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task.id)
  }

  return (
    <TaskList
      tasks={tasks}
      onTaskSelect={handleTaskSelect}
      className={className}
    />
  )
}