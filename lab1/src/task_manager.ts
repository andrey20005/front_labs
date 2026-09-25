export interface Task {
    id: string
    title: string
    description: string
    isCompleted: boolean
    createdAt: Date
    completedAt?: Date
    priority: 'low' | 'medium' | 'high'
}

export type TaskFilter = 'all' | 'completed' | 'active'
export type TaskSortBy = 'dateAsc' | 'dateDesc' | 'priorityAsc' | 'priorityDesc' | 'title'

export interface TaskManagerOptions {
    onStateChange: (tasks: Task[]) => void
    storageKey?: string
}

export class TaskManager {
    private tasks: Task[] = []
    private onStateChange: (tasks: Task[]) => void
    private storageKey: string

    private searchQuery: string = ''
    private currentFilter: TaskFilter = 'all'
    private currentSort: TaskSortBy = 'dateDesc'

    constructor(options: TaskManagerOptions) {
        this.onStateChange = options.onStateChange
        this.storageKey = options.storageKey || 'personal_tasks_app'
        this.loadFromStorage()
    }

    private saveToStorage(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks))
        this.notify()
    }

    private loadFromStorage(): void {
        const data = localStorage.getItem(this.storageKey)
        if (data) {
            try {
                const parsed = JSON.parse(data) as any[]
                this.tasks = parsed.map(t => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    completedAt: t.completedAt ? new Date(t.completedAt) : undefined
                }))
            } catch (e) {
                console.error("Ошибка чтения из localStorage", e)
                this.tasks = []
            }
        }
    }

    public notify(): void {
        const processedTasks = this.getProcessedTasks()
        this.onStateChange(processedTasks)
    }

    public setSearchQuery(query: string): void {
        this.searchQuery = query.trim().toLowerCase()
        this.notify()
    }

    public setFilter(filter: TaskFilter): void {
        this.currentFilter = filter
        this.notify()
    }

    public setSort(sort: TaskSortBy): void {
        this.currentSort = sort
        this.notify()
    }

    public addTask(title: string, description: string = '', priority: Task['priority'] = 'medium'): void {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            isCompleted: false,
            createdAt: new Date(),
            priority
        }
        this.tasks.push(newTask)
        this.saveToStorage()
    }

    public updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, ...updates } : task
        )
        this.saveToStorage()
    }

    public toggleTaskStatus(id: string): void {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                const nextStatus = !task.isCompleted
                return { 
                    ...task, 
                    isCompleted: nextStatus,
                    completedAt: nextStatus ? new Date() : undefined 
                }
            }
            return task
        })
        this.saveToStorage()
    }

    public deleteTask(id: string): void {
        this.tasks = this.tasks.filter(task => task.id !== id)
        this.saveToStorage()
    }

    public getTaskById(id: string): Task | undefined {
        return this.tasks.find(task => task.id === id)
    }

    public getProcessedTasks(): Task[] {
        let result = [...this.tasks]

        if (this.searchQuery) {
            result = result.filter(task => 
                task.title.toLowerCase().includes(this.searchQuery) || 
                task.description.toLowerCase().includes(this.searchQuery)
            )
        }

        if (this.currentFilter === 'completed') {
            result = result.filter(task => task.isCompleted)
        } else if (this.currentFilter === 'active') {
            result = result.filter(task => !task.isCompleted)
        }

        const priorityWeight = { low: 1, medium: 2, high: 3 }

        result.sort((a, b) => {
            switch (this.currentSort) {
                case 'dateDesc':
                    return b.createdAt.getTime() - a.createdAt.getTime()
                case 'dateAsc':
                    return a.createdAt.getTime() - b.createdAt.getTime()
                case 'priorityDesc':
                    return priorityWeight[b.priority] - priorityWeight[a.priority]
                case 'priorityAsc':
                    return priorityWeight[a.priority] - priorityWeight[b.priority]
                case 'title':
                    return a.title.localeCompare(b.title)
                default:
                    return 0
            }
        })

        return result
    }
}
