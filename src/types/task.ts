export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  expanded: boolean
  children?: Task[]
  parentId?: string
  level?: number
}