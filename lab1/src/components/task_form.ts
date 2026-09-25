import { TaskManager, Task } from '../task_manager'

export interface TaskFormOptions {
    manager: TaskManager
    containerId: string
    formId: string
    titleInputId: string
    descInputId: string
    prioritySelectId: string
    formTitleId: string
    cancelBtnId: string
}

export class TaskForm {
    private manager: TaskManager
    private container: HTMLElement
    private form: HTMLFormElement
    private titleInput: HTMLInputElement
    private descInput: HTMLTextAreaElement
    private prioritySelect: HTMLSelectElement
    private formTitle: HTMLElement
    private cancelBtn: HTMLButtonElement

    private editingTaskId: string | null = null

    constructor(options: TaskFormOptions) {
        this.manager = options.manager
        this.container = document.getElementById(options.containerId) as HTMLElement
        this.form = document.getElementById(options.formId) as HTMLFormElement
        this.titleInput = document.getElementById(options.titleInputId) as HTMLInputElement
        this.descInput = document.getElementById(options.descInputId) as HTMLTextAreaElement
        this.prioritySelect = document.getElementById(options.prioritySelectId) as HTMLSelectElement
        this.formTitle = document.getElementById(options.formTitleId) as HTMLElement
        this.cancelBtn = document.getElementById(options.cancelBtnId) as HTMLButtonElement

        if (!this.container || !this.form || !this.titleInput || !this.descInput || !this.prioritySelect || !this.formTitle || !this.cancelBtn) {
            throw new Error(`TaskForm: Ошибка инициализации DOM-элементов.`)
        }

        this.initEvents()
    }

    public openForEdit(task: Task): void {
        this.editingTaskId = task.id
        this.formTitle.textContent = 'Изменение задачи'
        this.titleInput.value = task.title
        this.descInput.value = task.description
        this.prioritySelect.value = task.priority

        this.container.classList.remove('collapsed')
        this.adjustTextAreaHeight()
        this.titleInput.focus()
        this.container.scrollIntoView({ behavior: 'smooth' })
    }

    private initEvents(): void {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault()
            const title = this.titleInput.value.trim()
            const desc = this.descInput.value.trim()
            const priority = this.prioritySelect.value as Task['priority']

            if (!title) return

            if (this.editingTaskId) {
                this.manager.updateTask(this.editingTaskId, { title, description: desc, priority })
            } else {
                this.manager.addTask(title, desc, priority)
            }

            this.resetForm()
        })

        this.cancelBtn.addEventListener('click', () => {
            this.resetForm()
        })

        this.descInput.addEventListener('input', () => {
            this.adjustTextAreaHeight()
        })
    }

    private adjustTextAreaHeight(): void {
        this.descInput.style.height = 'auto'
        this.descInput.style.height = `${this.descInput.scrollHeight}px`
    }

    private resetForm(): void {
        this.editingTaskId = null
        this.formTitle.textContent = 'Новая задача'
        this.form.reset()
        this.descInput.style.height = 'auto'
        this.container.classList.add('collapsed')
    }
}
