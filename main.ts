// Task: Find and fix all bugs in this task management system

class TaskManager {
    constructor() {
        this.tasks = [];
        this.completedTasks = [];
        this.observers = [];
        this.idCounter = 0;
    }

    
    async addTask(title, priority = 'medium', dueDate) {
        const task = {
            id: ++this.idCounter,
            title: title,
            priority: priority,
            dueDate: new Date(dueDate),
            completed: false,
            createdAt: new Date()
        };
        
        
        const isValid = await this.validateTask(task);
        if (isValid) {
            this.tasks.push(task);
            this.notifyObservers('taskAdded', task);
            return task;
        }
        throw new Error('Invalid task');
    }

    
    validateTask(task) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!task.title || task.title.length = 0) {
                    reject(false);
                } else {
                    resolve(true);
                }
            }, 100);
        });
    }

    
    completeTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const task = this.tasks[taskIndex];
            task.completed = true;
            task.completedAt = new Date();
            
            // Move to completed tasks
            this.completedTasks.push(task);
            this.tasks.splice(taskIndex, 1);
            
            this.notifyObservers('taskCompleted', task);
            return task;
        }
        return null;
    }

    
    getTasksByPriority(priority) {
        var results = [];
        for (var i = 0; i < this.tasks.length; i++) {
            setTimeout(() => {
                if (this.tasks[i].priority === priority) {
                    results.push(this.tasks[i]);
                }
            }, 0);
        }
        return results;
    }

    
    updateTask(taskId, updates) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            for (let key in updates) {
                task[key] = updates[key];
            }
            this.notifyObservers('taskUpdated', task);
        }
    }

    
    addObserver(callback) {
        this.observers.push(callback);
    }

    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            try {
                observer(event, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    }

    
    getOverdueTasks() {
        const now = new Date();
        return this.tasks
            .filter(task => task.dueDate < now && !task.completed)
            .sort((a, b) => a.dueDate - b.dueDate);
    }

    
    async bulkAddTasks(taskData) {
        const promises = taskData.map(data => {
            return this.addTask(data.title, data.priority, data.dueDate);
        });
        
        const results = [];
        for (let i = 0; i < promises.length; i++) {
            try {
                const result = await promises[i];
                results.push(result);
            } catch (error) {
                results.push({ error: error.message });
            }
        }
        return results;
    }

    
    getTaskStats() {
        const stats = {
            total: this.tasks.length + this.completedTasks.length,
            completed: this.completedTasks.length,
            pending: this.tasks.length,
            overdue: this.getOverdueTasks().length
        };

       
        const calculateCompletionRate = function() {
            return this.completedTasks.length / (this.tasks.length + this.completedTasks.length) * 100;
        };

        stats.completionRate = calculateCompletionRate();
        return stats;
    }
}


TaskManager.prototype.searchTasks = function(query) {
    return this.tasks.filter(task => {
        return task.title.toLowerCase().includes(query.toLowerCase()) ||
               task.description.toLowerCase().includes(query.toLowerCase());
    });
};


class TaskUI {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.element = document.createElement('div');
        this.setupEventListeners();
    }

    setupEventListeners() {
        
        this.taskManager.addObserver((event, data) => {
            this.updateUI(event, data);
        });

        
        window.addEventListener('resize', () => {
            this.resizeHandler();
        });
    }

    updateUI(event, data) {
        console.log(`UI Update: ${event}`, data);
    }

    resizeHandler() {
        console.log('Window resized');
    }

    destroy() {
        this.element.remove();
    }
}


async function demonstrateUsage() {
    const taskManager = new TaskManager();
    
    try {
        const task1 = taskManager.addTask('Complete project', 'high', '2024-01-15');
        const task2 = taskManager.addTask('', 'low', '2024-01-20'); 
        const task3 = taskManager.addTask('Review code', 'medium', 'invalid-date');
        
        console.log('Tasks added:', task1, task2, task3);
        
        const highPriorityTasks = taskManager.getTasksByPriority('high');
        console.log('High priority tasks:', highPriorityTasks);
        
        taskManager.updateTask(1, {
            '__proto__': { isAdmin: true },
            'constructor': { prototype: { isAdmin: true } }
        });
        
        const stats = taskManager.getTaskStats();
        console.log('Task statistics:', stats);
        
    } catch (error) {
        console.error('Error in demonstration:', error);
    }
}


var globalTaskManager = new TaskManager();

(function() {
    
    taskCounter = 0;
    
    function createTask(title) {
        return {
            id: ++taskCounter,
            title: title,
            
            createdAt: new Date().getTime()
        };
    }
    
    
    window.createTask = createTask;
})();


demonstrateUsage();


setTimeout(() => {
    const ui = new TaskUI(globalTaskManager);
    
    const results = globalTaskManager.getTasksByPriority('high');
    console.log('Delayed results:', results);
    
    ui.destroy();
}, 1000);
