import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'
import { TaskDropZone } from './TaskDropZone'

interface TaskListProps {
  tasks: Task[]
  onTaskSelect: (task: Task) => void
  className?: string
}

interface DraggableTaskProps {
  task: Task
  onTaskSelect: (task: Task) => void
  level?: number
}

function DraggableTask({
  task,
  onTaskSelect,
  level = 0
}: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: task.id,
    data: { type: 'task', task }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskDropZone
        task={task}
        onSelect={onTaskSelect}
        level={level}
      />
    </div>
  )
}

export function TaskList({
  tasks,
  onTaskSelect,
  className
}: TaskListProps) {
  return (
    <div className={className}>
      {tasks.map((task) => {
        return (
          <DraggableTask
            key={task.id}
            task={task}
            onTaskSelect={onTaskSelect}
            level={task.level || 0}
          />
        )
      })}
    </div>
  )
}

// Export the wrapper for backward compatibility
export { TaskListWrapper } from './TaskListWrapper'