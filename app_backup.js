// Data Management Class
class FamilyTaskManager {
    constructor() {
        this.initializeData();
        this.loadData();
        this.currentUser = null;
        this.currentTask = null;
        this.selectedUserId = null;
        this.timer = null;
        this.timerInterval = null;
        this.previousScreen = 'homeScreen';
        this.activeTimers = new Map();
    }

    // Initialize default data if not exists
    initializeData() {
        const defaultData = {
            users: [
                {
                    id: 1,
                    name: 'אמא',
                    birthDate: '1985-05-15',
                    role: 'הורה',
                    avatar: null,
                    points: 0,
                    isPerformingTask: false,
                    currentTaskId: null
                },
                {
                    id: 2,
                    name: 'אבא',
                    birthDate: '1983-08-22',
                    role: 'הורה',
                    avatar: null,
                    points: 0,
                    isPerformingTask: false,
                    currentTaskId: null
                },
                {
                    id: 3,
                    name: 'טלאור',
                    birthDate: '2015-03-10',
                    role: 'ילד',
                    avatar: null,
                    points: 0,
                    isPerformingTask: false,
                    currentTaskId: null
                }
            ],
            tasks: [
                {
                    id: 1,
                    title: 'סידור המיטה',
                    description: 'סידור המיטה ומיטוב הכריות',
                    duration: 15,
                    ageRange: '5-12',
                    room: 'חדר ילדים',
                    image: null,
                    difficulty: 'קל',
                    isActive: true,
                    assignedUsers: [3],
                    points: 10,
                    taskType: 'personal',
                    currentlyPerformedBy: null
                },
                {
                    id: 2,
                    title: 'ניקוי השולחן',
                    description: 'ניגוב השולחן אחרי הארוחה',
                    duration: 30,
                    ageRange: '6-15',
                    room: 'מטבח',
                    image: null,
                    difficulty: 'בינוני',
                    isActive: true,
                    assignedUsers: [3],
                    points: 20,
                    taskType: 'shared',
                    currentlyPerformedBy: null
                },
                {
                    id: 3,
                    title: 'איסוף הצעצועים',
                    description: 'איסוף כל הצעצועים ושים במקום',
                    duration: 45,
                    ageRange: '4-10',
                    room: 'סלון',
                    image: null,
                    difficulty: 'בינוני',
                    isActive: true,
                    assignedUsers: [3],
                    points: 25,
                    taskType: 'shared',
                    currentlyPerformedBy: null
                }
            ],
            rewards: [
                {
                    id: 1,
                    title: 'זמן מסך נוסף',
                    cost: 50,
                    image: null
                },
                {
                    id: 2,
                    title: 'בחירת ארוחת ערב',
                    cost: 30,
                    image: null
                },
                {
                    id: 3,
                    title: 'טיול קטן',
                    cost: 100,
                    image: null
                }
            ],
            completions: [],
            rooms: ['סלון', 'מטבח', 'חדר ילדים', 'חדר רחצה', 'חצר'],
            weeklyStats: {
                startDate: new Date().toISOString(),
                userStats: {}
            }
        };

        if (!localStorage.getItem('familyTaskData')) {
            this.saveData(defaultData);
        }
    }

    // Load data from localStorage
    loadData() {
        const stored = localStorage.getItem('familyTaskData');
        this.data = stored ? JSON.parse(stored) : null;
    }

    // Save data to localStorage
    saveData(data = this.data) {
        localStorage.setItem('familyTaskData', JSON.stringify(data));
        this.data = data;
    }

    // Get all users
    getUsers() {
        return this.data.users;
    }

    // Get user by ID
    getUser(id) {
        return this.data.users.find(user => user.id === id);
    }

    // Get active tasks
    getActiveTasks() {
        return this.data.tasks.filter(task => task.isActive);
    }

    // Get tasks for specific user
    getUserTasks(userId) {
        return this.getActiveTasks().filter(task => 
            task.assignedUsers.includes(userId)
        );
    }

    // Get tasks for specific room
    getRoomTasks(room) {
        return this.getActiveTasks().filter(task => task.room === room);
    }

    // Complete a task
    completeTask(taskId, userId, actualDuration, onTime) {
        const task = this.data.tasks.find(t => t.id === taskId);
        const user = this.data.users.find(u => u.id === userId);
        
        if (!task || !user) return false;

        const pointsEarned = this.calculatePoints(task, onTime);
        
        // Add completion record
        const completion = {
            id: Date.now(),
            user: userId,
            task: taskId,
            completedAt: new Date().toISOString(),
            durationActual: actualDuration,
            onTime: onTime,
            pointsEarned: pointsEarned
        };

        this.data.completions.push(completion);
        
        // Update user points
        user.points += pointsEarned;
        
        // Update user status - no longer performing task
        user.isPerformingTask = false;
        user.currentTaskId = null;
        
        // Update task status - no longer being performed
        task.currentlyPerformedBy = null;
        
        // For personal tasks, deactivate. For shared tasks, keep active for others
        if (task.taskType === 'personal') {
            task.isActive = false;
        }
        
        this.saveData();
        return true;
    }

    // Start task timer for a user
    startTaskTimer(taskId, userId) {
        const task = this.data.tasks.find(t => t.id === taskId);
        const user = this.data.users.find(u => u.id === userId);
        
        if (!task || !user) return false;
        
        // For shared tasks, check if already being performed
        if (task.taskType === 'shared' && task.currentlyPerformedBy && task.currentlyPerformedBy !== userId) {
            return false; // Task is already being performed by someone else
        }
        
        // Update user status
        user.isPerformingTask = true;
        user.currentTaskId = taskId;
        
        // Update task status
        task.currentlyPerformedBy = userId;
        
        this.saveData();
        return true;
    }

    // Stop task timer for a user (if they don't complete)
    stopTaskTimer(userId) {
        const user = this.data.users.find(u => u.id === userId);
        if (!user || !user.isPerformingTask) return false;
        
        const task = this.data.tasks.find(t => t.id === user.currentTaskId);
        if (task) {
            task.currentlyPerformedBy = null;
        }
        
        user.isPerformingTask = false;
        user.currentTaskId = null;
        
        this.saveData();
        return true;
    }

    // Check if task is available for user
    isTaskAvailable(taskId, userId) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (!task || !task.isActive) return false;
        
        // Personal tasks are always available to assigned users
        if (task.taskType === 'personal') {
            return task.assignedUsers.includes(userId);
        }
        
        // Shared tasks are available if not currently being performed
        return !task.currentlyPerformedBy && task.assignedUsers.includes(userId);
    }

    // Get user performing status
    getUserPerformingStatus(userId) {
        const user = this.data.users.find(u => u.id === userId);
        return user ? {
            isPerforming: user.isPerformingTask,
            taskId: user.currentTaskId
        } : { isPerforming: false, taskId: null };
    }

    // Calculate points based on task and performance
    calculatePoints(task, onTime) {
        let points = task.points || 0;
        if (onTime) points *= 1.5; // Bonus for completing on time
        return Math.round(points);
    }

    // Add new task
    addTask(taskData) {
        const newTask = {
            ...taskData,
            id: Date.now(),
            isActive: true,
            assignedUsers: taskData.assignedUsers || []
        };
        this.data.tasks.push(newTask);
        this.saveData();
        return newTask;
    }

    // Update task
    updateTask(taskId, updates) {
        const taskIndex = this.data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.data.tasks[taskIndex] = { ...this.data.tasks[taskIndex], ...updates };
            this.saveData();
            return true;
        }
        return false;
    }

    // Reactivate task
    reactivateTask(taskId) {
        return this.updateTask(taskId, { isActive: true });
    }

    // Add new user
    addUser(userData) {
        const newUser = {
            ...userData,
            id: Date.now(),
            points: 0
        };
        this.data.users.push(newUser);
        this.saveData();
        return newUser;
    }

    // Update user
    updateUser(userId, updates) {
        const userIndex = this.data.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
            this.saveData();
            return true;
        }
        return false;
    }

    // Add new reward
    addReward(rewardData) {
        const newReward = {
            ...rewardData,
            id: Date.now()
        };
        this.data.rewards.push(newReward);
        this.saveData();
        return newReward;
    }

    // Get weekly stats
    getWeeklyStats() {
        const startOfWeek = new Date(this.data.weeklyStats.startDate);
        const now = new Date();
        
        const weeklyCompletions = this.data.completions.filter(completion => {
            const completionDate = new Date(completion.completedAt);
            return completionDate >= startOfWeek;
        });

        const stats = {};
        this.data.users.forEach(user => {
            const userCompletions = weeklyCompletions.filter(c => c.user === user.id);
            stats[user.id] = {
                name: user.name,
                tasksCompleted: userCompletions.length,
                totalTime: userCompletions.reduce((sum, c) => sum + c.durationActual, 0),
                pointsEarned: userCompletions.reduce((sum, c) => sum + c.pointsEarned, 0),
                onTimeCompletions: userCompletions.filter(c => c.onTime).length
            };
        });

        return stats;
    }

    // Reset weekly stats
    resetWeeklyStats() {
        this.data.weeklyStats = {
            startDate: new Date().toISOString(),
            userStats: {}
        };
        
        // Reset user points
        this.data.users.forEach(user => {
            user.points = 0;
        });
        
        this.saveData();
    }

    // Helper method to calculate age
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
} 