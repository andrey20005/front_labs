import { Task, TaskManager } from '../task_manager'

export interface TasksListOptions {
    manager: TaskManager
    gridContainerId: string
    templateId: string
    onEditRequested: (taskId: string) => void
}

export class TasksList {
    private manager: TaskManager
    private gridContainer: HTMLElement
    private template: HTMLTemplateElement
    private onEditRequested: (taskId: string) => void

    constructor(options: TasksListOptions) {
        this.manager = options.manager
        this.gridContainer = document.getElementById(options.gridContainerId) as HTMLElement
        this.template = document.getElementById(options.templateId) as HTMLTemplateElement
        this.onEditRequested = options.onEditRequested

        if (!this.gridContainer || !this.template) {
            throw new Error(`TasksList: Ошибка инициализации DOM-элементов.`)
        }

        this.initEvents()
    }

    public render(tasks: Task[]): void {
        this.gridContainer.innerHTML = ''

        if (tasks.length === 0) {
            const emptyMessage = document.createElement('p')
            emptyMessage.textContent = 'Список задач пуст'
            emptyMessage.className = 'subtitle'
            emptyMessage.style.textAlign = 'center'
            emptyMessage.style.gridColumn = '1 / -1'
            emptyMessage.style.padding = '2rem 0'
            this.gridContainer.appendChild(emptyMessage)
            return
        }

        tasks.forEach(task => {
            const cardClone = this.createCardElement(task)
            this.gridContainer.appendChild(cardClone)
        })
    }

    private createCardElement(task: Task): HTMLElement {
        const clone = this.template.content.cloneNode(true) as HTMLElement
        const cardElement = clone.querySelector('.task-card') as HTMLElement

        cardElement.setAttribute('data-id', task.id)
        cardElement.classList.add(`priority-${task.priority}`)
        
        if (task.isCompleted) {
            cardElement.classList.add('is-completed')
        }

        const badge = cardElement.querySelector('.badge')!
        const title = cardElement.querySelector('.task-card-title')!
        const desc = cardElement.querySelector('.task-card-desc')!
        const dateCreated = cardElement.querySelector('.date-created')!
        const dateCompleted = cardElement.querySelector('.date-completed') as HTMLElement
        const completeBtn = cardElement.querySelector('.btn-complete')!

        const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }
        badge.textContent = priorityLabels[task.priority]
        badge.classList.add(`badge-${task.priority}`)

        title.textContent = task.title
        desc.textContent = task.description || 'Нет описания'
        
        dateCreated.textContent = `Создано: ${this.formatDate(task.createdAt)}`
        
        if (task.isCompleted && task.completedAt) {
            dateCompleted.textContent = `Завершено: ${this.formatDate(task.completedAt)}`
            completeBtn.textContent = 'Вернуть'
        } else {
            dateCompleted.remove()
            completeBtn.textContent = 'Завершить'
        }

        return cardElement
    }

    private initEvents(): void {
        this.gridContainer.addEventListener('click', (event: MouseEvent) => {
            const target = event.target as HTMLElement
            const taskCard = target.closest('.task-card')
            if (!taskCard) return

            const taskId = taskCard.getAttribute('data-id')!

            if (target.classList.contains('btn-complete')) {
                this.manager.toggleTaskStatus(taskId)
            } 
            else if (target.classList.contains('btn-delete')) {
                this.manager.deleteTask(taskId)
            } 
            else if (target.classList.contains('btn-edit')) {
                this.onEditRequested(taskId)
            }
        })
    }

    private formatDate(date: Date): string {
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}
