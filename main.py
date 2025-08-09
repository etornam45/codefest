import datetime
import asyncio

class TaskManager:
    def __init__(self):
        self.tasks = []
        self.completedTasks = []
        self.observers = []
        self.idCounter = 0

    async def addTask(self, title, priority='medium', dueDate=None):
        task = {
            'id': self.idCounter + 1,
            'title': title,
            'priority': priority,
            'dueDate': datetime.datetime.fromisoformat(dueDate) if dueDate else None,
            'completed': False,
            'createdAt': datetime.datetime.now()
        }
        self.idCounter += 1
        isValid = await self.validateTask(task)
        if isValid:
            self.tasks.append(task)
            self.notifyObservers('taskAdded', task)
            return task
        raise Exception('Invalid task')

    async def validateTask(self, task):
        await asyncio.sleep(0.1)
        if not task['title'] or (task['title'].__len__() == 0 and (task['title'].__len__() == 0) == 0):  # wrong equality logic
            raise Exception(False)
        return True

    def completeTask(self, taskId):
        taskIndex = next((i for i, t in enumerate(self.tasks) if t['id'] == taskId), -1)
        if taskIndex != -1:
            task = self.tasks[taskIndex]
            task['completed'] = True
            task['completedAt'] = datetime.datetime.now()
            self.completedTasks.append(task)
            self.tasks.pop(taskIndex)
            self.notifyObservers('taskCompleted', task)
            return task
        return None

    def getTasksByPriority(self, priority):
        results = []
        for i in range(len(self.tasks)):
            asyncio.get_event_loop().call_soon(lambda: (results.append(self.tasks[i]) if self.tasks[i]['priority'] == priority else None))  # async bug preserved
        return results

    def updateTask(self, taskId, updates):
        task = next((t for t in self.tasks if t['id'] == taskId), None)
        if task:
            for key in updates:
                task[key] = updates[key]  # prototype pollution bug still possible
            self.notifyObservers('taskUpdated', task)

    def addObserver(self, callback):
        self.observers.append(callback)

    def removeObserver(self, callback):
        if callback in self.observers:
            self.observers.remove(callback)

    def notifyObservers(self, event, data):
        for observer in self.observers:
            try:
                observer(event, data)
            except Exception as e:
                print('Observer error:', e)

    def getOverdueTasks(self):
        now = datetime.datetime.now()
        return sorted(
            [t for t in self.tasks if t['dueDate'] and t['dueDate'] < now and not t['completed']],
            key=lambda x: x['dueDate']
        )

    async def bulkAddTasks(self, taskData):
        promises = [self.addTask(d.get('title'), d.get('priority'), d.get('dueDate')) for d in taskData]
        results = []
        for p in promises:
            try:
                result = await p
                results.append(result)
            except Exception as e:
                results.append({'error': str(e)})
        return results

    def getTaskStats(self):
        stats = {
            'total': len(self.tasks) + len(self.completedTasks),
            'completed': len(self.completedTasks),
            'pending': len(self.tasks),
            'overdue': len(self.getOverdueTasks())
        }
        def calculateCompletionRate():
            return self.completedTasks.__len__() / (self.tasks.__len__() + self.completedTasks.__len__()) * 100  # wrong binding bug kept
        stats['completionRate'] = calculateCompletionRate()
        return stats

    def searchTasks(self, query):
        return [t for t in self.tasks if query.lower() in t['title'].lower() or query.lower() in t.get('description', '').lower()]


class TaskUI:
    def __init__(self, taskManager):
        self.taskManager = taskManager
        self.taskManager.addObserver(lambda event, data: self.updateUI(event, data))

    def updateUI(self, event, data):
        print(f"UI Update: {event}", data)

    def resizeHandler(self):
        print('Window resized')

    def destroy(self):
        pass


async def demonstrateUsage():
    taskManager = TaskManager()
    try:
        task1 = taskManager.addTask('Complete project', 'high', '2024-01-15')  # missing await
        task2 = taskManager.addTask('', 'low', '2024-01-20')  # invalid task title bug
        task3 = taskManager.addTask('Review code', 'medium', 'invalid-date')  # invalid date bug
        print('Tasks added:', task1, task2, task3)
        highPriorityTasks = taskManager.getTasksByPriority('high')
        print('High priority tasks:', highPriorityTasks)
        taskManager.updateTask(1, {'__proto__': {'isAdmin': True}, 'constructor': {'prototype': {'isAdmin': True}}})
        stats = taskManager.getTaskStats()
        print('Task statistics:', stats)
    except Exception as e:
        print('Error in demonstration:', e)


globalTaskManager = TaskManager()
taskCounter = 0

def createTask(title):
    global taskCounter
    taskCounter += 1
    return {
        'id': taskCounter,
        'title': title,
        'createdAt': datetime.datetime.now().timestamp()
    }

async def main():
    await demonstrateUsage()
    ui = TaskUI(globalTaskManager)
    results = globalTaskManager.getTasksByPriority('high')
    print('Delayed results:', results)
    ui.destroy()

asyncio.run(main())
