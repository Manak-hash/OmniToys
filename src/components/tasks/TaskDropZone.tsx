import { useDroppable } from '@dnd-kit/core'
import { TaskItemContent } from './TaskItemContent'
import type { Task } from '@/types/task'
import { cn } from '@/utils/cn'

interface TaskDropZoneProps {
  task: Task
  onSelect: (task: Task) => void
  level?: number
  dragOverId?: string | null
  dropPosition?: 'before' | 'on' | null | undefined
}

export function TaskDropZone({
  task,
  onSelect,
  level = 0,
  dragOverId,
  dropPosition
}: TaskDropZoneProps) {
  // Make this task droppable (wrapper)
  const { setNodeRef } = useDroppable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  // Calculate visual feedback
  const isDragTarget = dragOverId === task.id
  const showInsertLine = isDragTarget && dropPosition === 'before'
  const showMakeSubtask = isDragTarget && dropPosition === 'on'

  return (
    <div
      ref={setNodeRef}
      data-task-id={task.id}
      className="relative"
      style={{ paddingLeft: `${12 + level * 24}px` }}
    >
      {/* Insertion line for reordering */}
      {showInsertLine && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-50"
          style={{ top: '-3px' }}
        >
          <div
            className="rounded-full shadow-lg"
            style={{
              height: '4px',
              width: '100%',
              background: 'var(--color-primary, #df1c26)',
              boxShadow: '0 0 8px var(--color-primary-glow, rgba(223, 28, 38, 0.6))'
            }}
          />
        </div>
      )}

      {/* Droppable wrapper styling */}
      <div
        className={cn(
          'transition-all duration-200',
          showMakeSubtask && 'ring-2 ring-omni-accent bg-omni-accent/10 scale-[1.02]'
        )}
        onClick={() => onSelect(task)}
      >
        <TaskItemContent />
      </div>
    </div>
  )
}