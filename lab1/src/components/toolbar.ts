import { TaskManager, TaskFilter, TaskSortBy } from '../task_manager'

export interface ToolbarOptions {
    manager: TaskManager
    searchInputId: string
    filterStatusId: string
    sortSelectId: string
}

export class Toolbar {
    private manager: TaskManager
    private searchInput: HTMLInputElement
    private filterStatus: HTMLSelectElement
    private sortSelect: HTMLSelectElement

    constructor(options: ToolbarOptions) {
        this.manager = options.manager
        
        this.searchInput = document.getElementById(options.searchInputId) as HTMLInputElement
        this.filterStatus = document.getElementById(options.filterStatusId) as HTMLSelectElement
        this.sortSelect = document.getElementById(options.sortSelectId) as HTMLSelectElement

        if (!this.searchInput || !this.filterStatus || !this.sortSelect) {
            throw new Error(`Toolbar: Ошибка инициализации DOM-элементов.`)
        }

        this.initEvents()
    }

    private initEvents(): void {
        this.searchInput.addEventListener('input', () => {
            this.manager.setSearchQuery(this.searchInput.value)
        })

        this.filterStatus.addEventListener('change', () => {
            const filterValue = this.filterStatus.value as TaskFilter
            this.manager.setFilter(filterValue)
        })

        this.sortSelect.addEventListener('change', () => {
            const sortValue = this.sortSelect.value as TaskSortBy
            this.manager.setSort(sortValue)
        })
    }
}
