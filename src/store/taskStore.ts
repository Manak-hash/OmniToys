import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task } from '@/types/task'

interface TaskStore {
  // Global tasks storage
  tasks: { [projectId: string]: Task[] }

  // Currently selected task
  selectedTaskId: string | null

  // Collapsed task IDs for each project
  collapsedTasks: { [projectId: string]: Set<string> }

  // Current project
  currentProjectId: string | null

  // Actions
  setProjectTasks: (projectId: string, tasks: Task[]) => void
  addTask: (projectId: string, task: Task) => void
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
  setSelectedTask: (taskId: string | null) => void
  toggleTaskCollapse: (projectId: string, taskId: string) => void
  setCurrentProject: (projectId: string) => void
  moveTask: (projectId: string, draggedTaskId: string, targetTaskId: string, position: 'before' | 'on') => void
  createSubtask: (projectId: string, parentTaskId: string, subtask: Omit<Task, 'id'>) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: {},
      selectedTaskId: null,
      collapsedTasks: {},
      currentProjectId: null,

      setProjectTasks: (projectId, tasks) =>
        set((state) => ({
          tasks: { ...state.tasks, [projectId]: tasks }
        })),

      addTask: (projectId, task) =>
        set((state) => ({
          tasks: {
            ...state.tasks,
            [projectId]: [...(state.tasks[projectId] || []), task]
          }
        })),

      updateTask: (projectId, taskId, updates) =>
        set((state) => {
          const projectTasks = state.tasks[projectId] || []
          const updatedTasks = projectTasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
          return {
            tasks: { ...state.tasks, [projectId]: updatedTasks }
          }
        }),

      deleteTask: (projectId, taskId) =>
        set((state) => {
          const projectTasks = state.tasks[projectId] || []
          const updatedTasks = projectTasks.filter(task => task.id !== taskId)
          // Also remove from collapsed tasks
          const updatedCollapsedTasks = { ...state.collapsedTasks }
          if (updatedCollapsedTasks[projectId]) {
            updatedCollapsedTasks[projectId].delete(taskId)
          }
          return {
            tasks: { ...state.tasks, [projectId]: updatedTasks },
            collapsedTasks: updatedCollapsedTasks
          }
        }),

      setSelectedTask: (taskId) =>
        set({ selectedTaskId: taskId }),

      toggleTaskCollapse: (projectId, taskId) =>
        set((state) => {
          const projectCollapsedTasks = state.collapsedTasks[projectId] || new Set()
          const updatedCollapsedTasks = new Set(projectCollapsedTasks)

          if (updatedCollapsedTasks.has(taskId)) {
            updatedCollapsedTasks.delete(taskId)
          } else {
            updatedCollapsedTasks.add(taskId)
          }

          return {
            collapsedTasks: {
              ...state.collapsedTasks,
              [projectId]: updatedCollapsedTasks
            }
          }
        }),

      setCurrentProject: (projectId) =>
        set({ currentProjectId: projectId }),

      moveTask: (projectId, draggedTaskId, targetTaskId, position) => {
        const state = get()
        const projectTasks = state.tasks[projectId] || []
        const draggedTask = projectTasks.find(t => t.id === draggedTaskId)
        const targetTask = projectTasks.find(t => t.id === targetTaskId)

        if (!draggedTask || !targetTask) return

        // Remove dragged task from its current position
        const remainingTasks = projectTasks.filter(t => t.id !== draggedTaskId)

        if (position === 'on') {
          // Make dragged task a subtask of target task
          const updatedTargetTask = {
            ...targetTask,
            children: [...(targetTask.children || []), { ...draggedTask, parentId: targetTaskId, level: (targetTask.level || 0) + 1 }]
          }
          set((state) => ({
            tasks: {
              ...state.tasks,
              [projectId]: remainingTasks.map(t => t.id === targetTaskId ? updatedTargetTask : t)
            }
          }))
        } else {
          // Insert before target task
          const targetIndex = remainingTasks.findIndex(t => t.id === targetTaskId)
          if (targetIndex !== -1) {
            const updatedTasks = [
              ...remainingTasks.slice(0, targetIndex),
              draggedTask,
              ...remainingTasks.slice(targetIndex)
            ]
            set((state) => ({
              tasks: { ...state.tasks, [projectId]: updatedTasks }
            }))
          }
        }
      },

      createSubtask: (projectId, parentTaskId, subtask) => {
        const subtaskWithId: Task = {
          ...subtask,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          parentId: parentTaskId,
          level: (subtask.level || 0) + 1
        }

        set((state) => {
          const projectTasks = state.tasks[projectId] || []
          const updatedTasks = projectTasks.map(task => {
            if (task.id === parentTaskId) {
              return {
                ...task,
                children: [...(task.children || []), subtaskWithId],
                expanded: true // Ensure parent is expanded when adding subtask
              }
            }
            return task
          })

          return {
            tasks: { ...state.tasks, [projectId]: [...updatedTasks, subtaskWithId] }
          }
        })
      }
    }),
    {
      name: 'omni-tasks-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        collapsedTasks: state.collapsedTasks
      })
    }
  )
)

// Hook to get tasks for a specific project
export const useProjectTasks = (projectId: string) => {
  const { tasks, currentProjectId, setCurrentProject } = useTaskStore()

  // Set current project if not set
  if (!currentProjectId && projectId) {
    setCurrentProject(projectId)
  }

  return tasks[projectId] || []
}

// Hook to get collapsed tasks for a specific project
export const useCollapsedTasks = (projectId: string) => {
  const { collapsedTasks } = useTaskStore()
  return collapsedTasks[projectId] || new Set()
}