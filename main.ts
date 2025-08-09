// Advanced JavaScript Debugging Challenge
// Task: Find and fix all bugs in this task management system

class TaskManager {
    constructor() {
        this.tasks = [];
        this.completedTasks = [];
        this.observers = [];
        this.idCounter = 0;
    }

    // Bug 1: Async method but not properly handling promises
    async addTask(title, priority = 'medium', dueDate) {
        const task = {
            id: ++this.idCounter,
            title: title,
            priority: priority,
            dueDate: new Date(dueDate),
            completed: false,
            createdAt: new Date()
        };
        
        // Simulating async validation
        const isValid = await this.validateTask(task);
        if (isValid) {
            this.tasks.push(task);
            this.notifyObservers('taskAdded', task);
            return task;
        }
        throw new Error('Invalid task');
    }

    // Bug 2: Promise not properly rejected/resolved
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

    // Bug 3: Incorrect array method usage
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

    // Bug 4: Closure and scope issues
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

    // Bug 5: Prototype pollution vulnerability
    updateTask(taskId, updates) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            for (let key in updates) {
                task[key] = updates[key];
            }
            this.notifyObservers('taskUpdated', task);
        }
    }

    // Bug 6: Memory leak in event listeners
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

    // Bug 7: Incorrect date comparison and sorting
    getOverdueTasks() {
        const now = new Date();
        return this.tasks
            .filter(task => task.dueDate < now && !task.completed)
            .sort((a, b) => a.dueDate - b.dueDate);
    }

    // Bug 8: Race condition in async operations
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

    // Bug 9: Incorrect this binding
    getTaskStats() {
        const stats = {
            total: this.tasks.length + this.completedTasks.length,
            completed: this.completedTasks.length,
            pending: this.tasks.length,
            overdue: this.getOverdueTasks().length
        };

        // Bug: Lost context when used as callback
        const calculateCompletionRate = function() {
            return this.completedTasks.length / (this.tasks.length + this.completedTasks.length) * 100;
        };

        stats.completionRate = calculateCompletionRate();
        return stats;
    }
}

// Bug 10: Prototype method with incorrect implementation
TaskManager.prototype.searchTasks = function(query) {
    return this.tasks.filter(task => {
        return task.title.toLowerCase().includes(query.toLowerCase()) ||
               task.description.toLowerCase().includes(query.toLowerCase());
    });
};

// Bug 11: Event handling with memory leaks
class TaskUI {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.element = document.createElement('div');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Memory leak: not removing event listeners
        this.taskManager.addObserver((event, data) => {
            this.updateUI(event, data);
        });

        // Another memory leak
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
        // Bug: not properly cleaning up
        this.element.remove();
    }
}

// Bug 12: Incorrect usage and async handling
async function demonstrateUsage() {
    const taskManager = new TaskManager();
    
    try {
        // This will cause issues due to bugs in the code
        const task1 = taskManager.addTask('Complete project', 'high', '2024-01-15');
        const task2 = taskManager.addTask('', 'low', '2024-01-20'); // Should fail validation
        const task3 = taskManager.addTask('Review code', 'medium', 'invalid-date');
        
        console.log('Tasks added:', task1, task2, task3);
        
        // Bug: trying to access results immediately
        const highPriorityTasks = taskManager.getTasksByPriority('high');
        console.log('High priority tasks:', highPriorityTasks);
        
        // Potential prototype pollution
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

// Bug 13: Global variable pollution and incorrect module pattern
var globalTaskManager = new TaskManager();

(function() {
    // Bug: accidentally creating global variable
    taskCounter = 0;
    
    function createTask(title) {
        return {
            id: ++taskCounter,
            title: title,
            // Bug: incorrect date creation
            createdAt: new Date().getTime()
        };
    }
    
    // Bug: should be attached to proper object
    window.createTask = createTask;
})();

// Usage that will trigger multiple bugs
demonstrateUsage();

// Additional test cases that will reveal bugs
setTimeout(() => {
    const ui = new TaskUI(globalTaskManager);
    
    // This will trigger the closure bug
    const results = globalTaskManager.getTasksByPriority('high');
    console.log('Delayed results:', results);
    
    // This won't properly clean up
    ui.destroy();
}, 1000);
