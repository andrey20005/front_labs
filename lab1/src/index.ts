import { TaskManager } from './task_manager'
import { TasksList } from './components/tasks_list'
import { Toolbar } from './components/toolbar'
import { TaskForm } from './components/task_form'

let tasksListInstance: TasksList

const manager = new TaskManager({
    onStateChange: (processedTasks) => {
        if (tasksListInstance) {
            tasksListInstance.render(processedTasks)
        }
    }
})

const formInstance = new TaskForm({
    manager: manager,
    containerId: 'task-form-container',
    formId: 'task-form',
    titleInputId: 'task-title',
    descInputId: 'task-desc',
    prioritySelectId: 'task-priority',
    formTitleId: 'form-title',
    cancelBtnId: 'btn-cancel'
})

tasksListInstance = new TasksList({
    manager: manager,
    gridContainerId: 'tasks-list',
    templateId: 'task-card-template',
    onEditRequested: (taskId) => {
        const task = manager.getTaskById(taskId)
        if (task) {
            formInstance.openForEdit(task)
        }
    }
})

const toolbarInstance = new Toolbar({
    manager: manager,
    searchInputId: 'search-input',
    filterStatusId: 'filter-status',
    sortSelectId: 'sort-select'
})

if (!localStorage.getItem('personal_tasks_app')) {
    console.log('Генерация первоначальных демонстрационных задач...')
    
    manager.addTask(
        'Изучить TypeScript архитектуру',
        'Разбить логику приложения на три независимых UI-компонента и связать их через главный медиатор в index.ts.',
        'high'
    )

    manager.addTask(
        'Настроить стили и анимации',
        'Проверить плавность сворачивания формы создания новой записи и протестировать автоподнятие высоты текстового поля.',
        'medium'
    )

    manager.addTask(
        'Купить кофе',
        'Взять зерновой кофе сильной обжарки для продуктивного программирования лабораторных работ.',
        'low'
    )
    
    const activeTasks = manager.getProcessedTasks()
    if (activeTasks.length > 0) {
        manager.toggleTaskStatus(activeTasks[0].id) 
    }
} else {
    manager.notify() 
}
