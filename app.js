// Data Management Class
console.log('🔥 app.js STARTED LOADING');

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
        
        // Check storage usage
        const storageInfo = this.getStorageInfo();
        if (storageInfo && storageInfo.usagePercent > 80) {
            console.warn('🔥 WARNING: Storage usage is high!', storageInfo.usagePercent + '%');
        }
        
        // Restore any active timers from localStorage
        this.restoreActiveTimers();
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
                    birthDate: '2012-04-03',
                    role: 'ילד',
                    avatar: null,
                    points: 0,
                    isPerformingTask: false,
                    currentTaskId: null
                },
                {
                    id: 4,
                    name: 'שירציון',
                    birthDate: '2013-12-11',
                    role: 'ילד',
                    avatar: null,
                    points: 0,
                    isPerformingTask: false,
                    currentTaskId: null
                },
                {
                    id: 5,
                    name: 'פארי',
                    birthDate: '2015-09-01',
                    role: 'ילד',
                    avatar: null,
                    points: 0,
                    isPerformingTask: false,
                    currentTaskId: null
                },
                {
                    id: 6,
                    name: 'נגן',
                    birthDate: '2018-10-08',
                    role: 'ילד',
                    avatar: null,
                    points: 0,
                    isPerformingTask: false,
                    currentTaskId: null
                },
                {
                    id: 7,
                    name: 'כנה',
                    birthDate: '2022-01-28',
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
                    assignedUsers: [3, 4, 5, 6],
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
                    assignedUsers: [3, 4, 5, 6],
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
                    assignedUsers: [3, 4, 5, 6],
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
        try {
            const dataString = JSON.stringify(data);
            console.log('🔥 Attempting to save data, size:', Math.round(dataString.length / 1024), 'KB');
            localStorage.setItem('familyTaskData', dataString);
            this.data = data;
            console.log('🔥 Data saved successfully');
        } catch (error) {
            console.error('🔥 Error saving data:', error);
            if (error.name === 'QuotaExceededError') {
                alert('אחסון מלא! התמונות גדולות מדי. נסה להקטין את התמונות או מחק תמונות ישנות.');
                // Try to save without avatars as fallback
                const dataWithoutAvatars = JSON.parse(JSON.stringify(data));
                dataWithoutAvatars.users.forEach(user => {
                    if (user.avatar) {
                        console.log('🔥 Removing avatar for user:', user.name);
                        user.avatar = null;
                    }
                });
                try {
                    localStorage.setItem('familyTaskData', JSON.stringify(dataWithoutAvatars));
                    this.data = dataWithoutAvatars;
                    alert('הנתונים נשמרו ללא התמונות כדי לחסוך מקום.');
                } catch (fallbackError) {
                    console.error('🔥 Even fallback save failed:', fallbackError);
                    alert('שגיאה קריטית בשמירת הנתונים. נסה לרענן את הדף.');
                }
            }
        }
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

    // Restore active timers from localStorage data
    restoreActiveTimers() {
        this.data.users.forEach(user => {
            if (user.isPerformingTask && user.activeTimerStartTime && user.activeTimerTaskId) {
                this.activeTimers.set(user.id, {
                    taskId: user.activeTimerTaskId,
                    startTime: user.activeTimerStartTime,
                    interval: null
                });
            }
        });
    }

    // Helper method to compress image
    compressImage(file, maxWidth = 150, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                console.log('🔥 Image compressed from', Math.round(file.size / 1024), 'KB to', Math.round(compressedDataUrl.length * 0.75 / 1024), 'KB');
                resolve(compressedDataUrl);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // Check localStorage usage
    getStorageInfo() {
        try {
            const data = localStorage.getItem('familyTaskData');
            const sizeInBytes = data ? data.length : 0;
            const sizeInKB = Math.round(sizeInBytes / 1024);
            const sizeInMB = Math.round(sizeInKB / 1024 * 100) / 100;
            
            // Estimate localStorage limit (usually 5-10MB)
            const estimatedLimit = 5 * 1024; // 5MB in KB
            const usagePercent = Math.round(sizeInKB / estimatedLimit * 100);
            
            console.log('🔥 Storage info:', {
                sizeInBytes,
                sizeInKB,
                sizeInMB,
                usagePercent: `${usagePercent}%`,
                estimatedLimit: `${estimatedLimit}KB`
            });
            
            return {
                sizeInBytes,
                sizeInKB,
                sizeInMB,
                usagePercent,
                estimatedLimit
            };
        } catch (error) {
            console.error('🔥 Error getting storage info:', error);
            return null;
        }
    }
}

// UI Manager Class
class UIManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        
        // Store bound methods to prevent context issues
        this.boundEditUser = this.editUser.bind(this);
        this.boundEditTask = this.editTask.bind(this);
        this.boundEditReward = this.editReward.bind(this);
        this.boundReactivateTask = this.reactivateTask.bind(this);
        this.boundDeactivateTask = this.deactivateTask.bind(this);
        this.boundShowUserProfile = this.showUserProfile.bind(this);
        this.boundShowRoomTasks = this.showRoomTasks.bind(this);
        this.boundStartTask = this.startTask.bind(this);
        this.boundStartTimer = this.startTimer.bind(this);
        this.boundStopTimer = this.stopTimer.bind(this);
        this.boundCloseModal = this.closeModal.bind(this);
        
        // Store the event handler function to be able to remove it later
        this.clickHandler = this.createClickHandler();
        
        // Initialize event listeners ONLY ONCE
        console.log('🔥 Initializing event listeners for the first and last time');
        this.initializeEventListeners();
        
        this.render();
    }

    createClickHandler() {
        return (e) => {
            console.log('🔥 Click detected on:', e.target, 'Closest button:', e.target.closest('button'));
            const target = e.target.closest('button') || e.target.closest('[data-action]') || e.target;
            
            // Handle edit user buttons
            if (target.hasAttribute('data-edit-user')) {
                console.log('🔥 Edit user clicked!', target.getAttribute('data-edit-user'));
                e.preventDefault();
                const userId = parseInt(target.getAttribute('data-edit-user'));
                this.boundEditUser(userId);
                return;
            }
            
            // Handle edit task buttons
            if (target.hasAttribute('data-edit-task')) {
                console.log('🔥 Edit task clicked!', target.getAttribute('data-edit-task'));
                e.preventDefault();
                const taskId = parseInt(target.getAttribute('data-edit-task'));
                this.boundEditTask(taskId);
                return;
            }
            
            // Handle edit reward buttons
            if (target.hasAttribute('data-edit-reward')) {
                console.log('🔥 Edit reward clicked!', target.getAttribute('data-edit-reward'));
                e.preventDefault();
                const rewardId = parseInt(target.getAttribute('data-edit-reward'));
                this.boundEditReward(rewardId);
                return;
            }
            
            // Handle reactivate task
            if (target.hasAttribute('data-reactivate-task')) {
                console.log('🔥 Reactivate task clicked!', target.getAttribute('data-reactivate-task'));
                e.preventDefault();
                const taskId = parseInt(target.getAttribute('data-reactivate-task'));
                this.boundReactivateTask(taskId);
                return;
            }
            
            // Handle deactivate task
            if (target.hasAttribute('data-deactivate-task')) {
                console.log('🔥 Deactivate task clicked!', target.getAttribute('data-deactivate-task'));
                e.preventDefault();
                const taskId = parseInt(target.getAttribute('data-deactivate-task'));
                this.boundDeactivateTask(taskId);
                return;
            }
            
            // Handle profile cards
            if (target.hasAttribute('data-show-profile')) {
                console.log('🔥 Show profile clicked!', target.getAttribute('data-show-profile'));
                e.preventDefault();
                const userId = parseInt(target.getAttribute('data-show-profile'));
                this.boundShowUserProfile(userId);
                return;
            }
            
            // Handle room cards
            if (target.hasAttribute('data-show-room')) {
                console.log('🔥 Show room clicked!', target.getAttribute('data-show-room'));
                e.preventDefault();
                const room = target.getAttribute('data-show-room');
                this.boundShowRoomTasks(room);
                return;
            }
            
            // Handle task cards
            if (target.hasAttribute('data-start-task')) {
                console.log('🔥 Start task clicked!', target.getAttribute('data-start-task'));
                e.preventDefault();
                const taskId = parseInt(target.getAttribute('data-start-task'));
                this.boundStartTask(taskId);
                return;
            }
            
            // Handle timer buttons
            if (target.hasAttribute('data-start-timer')) {
                console.log('🔥 Start timer clicked!');
                e.preventDefault();
                this.boundStartTimer();
                return;
            }
            
            if (target.hasAttribute('data-stop-timer')) {
                console.log('🔥 Stop timer clicked!');
                e.preventDefault();
                this.boundStopTimer();
                return;
            }
            
            // Handle modal close
            if (target.hasAttribute('data-close-modal')) {
                console.log('🔥 Close modal clicked!');
                e.preventDefault();
                this.boundCloseModal();
                return;
            }
            
            // Handle screen navigation
            if (target.hasAttribute('data-show-screen')) {
                console.log('🔥 Show screen clicked!', target.getAttribute('data-show-screen'));
                e.preventDefault();
                const screenId = target.getAttribute('data-show-screen');
                this.showScreen(screenId);
                return;
            }
            
            // Handle admin tabs
            if (target.hasAttribute('data-admin-tab')) {
                console.log('🔥 Admin tab clicked!', target.getAttribute('data-admin-tab'));
                e.preventDefault();
                const tabName = target.getAttribute('data-admin-tab');
                this.showAdminTab(tabName);
                return;
            }
        };
    }

    render() {
        console.log('🔥 render() called - STACK TRACE:', new Error().stack.split('\n').slice(1, 4));
        this.renderFamilyProfiles();
        this.renderRooms();
        this.renderRewards();
        this.renderAdminPanel();
        
        // Hide admin button initially when on home screen
        const adminBtn = document.getElementById('adminBtn');
        adminBtn.style.display = 'none';
        
        // DON'T re-initialize event listeners after render! This was causing duplicates!
        console.log('🔥 render() completed (no event listener re-init)');
    }

    renderFamilyProfiles() {
        console.log('🔥 renderFamilyProfiles called');
        const container = document.getElementById('familyProfiles');
        const users = this.taskManager.getUsers();
        console.log('🔥 Users to render:', users);
        
        container.innerHTML = users.map(user => {
            console.log('🔥 Rendering user:', user.name, 'ID:', user.id);
            const age = this.taskManager.calculateAge(user.birthDate);
            const performingStatus = this.taskManager.getUserPerformingStatus(user.id);
            const statusClass = performingStatus.isPerforming ? 'performing-task' : '';
            const statusText = performingStatus.isPerforming ? 'בביצוע משימה' : '';
            
            const profileHtml = `
                <div class="profile-card ${statusClass}" data-show-profile="${user.id}">
                    <div class="profile-avatar">
                        ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0)}
                        ${performingStatus.isPerforming ? '<div class="status-indicator"></div>' : ''}
                    </div>
                    <div class="profile-name">${user.name}</div>
                    <div class="profile-age">גיל ${age}</div>
                    ${statusText ? `<div class="profile-status">${statusText}</div>` : ''}
                    <div class="profile-points">
                        <i class="fas fa-star"></i>
                        ${user.points} נקודות
                    </div>
                </div>
            `;
            console.log('🔥 Profile HTML for', user.name, ':', profileHtml);
            return profileHtml;
        }).join('');
        console.log('🔥 renderFamilyProfiles completed');
    }

    renderRooms() {
        const container = document.getElementById('roomsGrid');
        const rooms = this.taskManager.data.rooms;
        
        container.innerHTML = rooms.map(room => {
            const taskCount = this.taskManager.getRoomTasks(room).length;
            return `
                <div class="room-card" data-show-room="${room}">
                    <div class="room-image">
                        ${this.getRoomIcon(room)}
                    </div>
                    <div class="room-name">${room}</div>
                    <div class="room-task-count">${taskCount} משימות זמינות</div>
                </div>
            `;
        }).join('');
    }

    getRoomIcon(room) {
        const icons = {
            'סלון': '<i class="fas fa-couch"></i>',
            'מטבח': '<i class="fas fa-utensils"></i>',
            'חדר ילדים': '<i class="fas fa-bed"></i>',
            'חדר רחצה': '<i class="fas fa-bath"></i>',
            'חצר': '<i class="fas fa-tree"></i>'
        };
        return icons[room] || '<i class="fas fa-home"></i>';
    }

    renderTasks(tasks, containerId) {
        const container = document.getElementById(containerId);
        
        container.innerHTML = tasks.map(task => {
            const isAvailable = this.taskManager.isTaskAvailable(task.id, this.taskManager.currentUser);
            const isBeingPerformed = task.currentlyPerformedBy !== null;
            const performerName = isBeingPerformed ? 
                this.taskManager.getUser(task.currentlyPerformedBy)?.name : null;
            
            const availabilityClass = !isAvailable ? 'task-unavailable' : '';
            const statusText = isBeingPerformed && !isAvailable ? 
                `המשימה כעת בביצוע על ידי ${performerName}` : '';
            
            return `
                <div class="task-card ${task.difficulty} ${availabilityClass}" 
                     ${isAvailable ? `data-start-task="${task.id}"` : ''}>
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <div class="task-difficulty ${task.difficulty}">${task.difficulty}</div>
                    </div>
                    <div class="task-description">${task.description}</div>
                    ${statusText ? `<div class="task-status">${statusText}</div>` : ''}
                    <div class="task-details">
                        <div class="task-detail">
                            <i class="fas fa-clock"></i>
                            ${task.duration} דקות
                        </div>
                        <div class="task-detail">
                            <i class="fas fa-home"></i>
                            ${task.room}
                        </div>
                        <div class="task-detail">
                            <i class="fas fa-star"></i>
                            ${task.points || 0} נקודות
                        </div>
                        <div class="task-detail">
                            <i class="fas fa-users"></i>
                            ${task.taskType === 'personal' ? 'אישית' : 'משותפת'}
                        </div>
                    </div>
                    ${!isAvailable && isBeingPerformed ? 
                        '<div class="task-overlay">המשימה כעת בביצוע</div>' : ''}
                </div>
            `;
        }).join('');
    }

    renderRewards() {
        const container = document.getElementById('rewardsList');
        const rewards = this.taskManager.data.rewards;
        
        container.innerHTML = rewards.map(reward => `
            <div class="reward-card">
                <div class="reward-image">
                    ${reward.image ? `<img src="${reward.image}" alt="${reward.title}">` : '<i class="fas fa-gift"></i>'}
                </div>
                <div class="reward-title">${reward.title}</div>
                <div class="reward-cost">
                    <i class="fas fa-star"></i>
                    ${reward.cost} נקודות
                </div>
            </div>
        `).join('');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        
        // Hide admin button when going to home screen
        if (screenId === 'homeScreen') {
            const adminBtn = document.getElementById('adminBtn');
            adminBtn.style.display = 'none';
        }
    }

    showUserProfile(userId) {
        console.log('🔥 showUserProfile called with userId:', userId, typeof userId);
        this.taskManager.currentUser = userId;
        const user = this.taskManager.getUser(userId);
        console.log('🔥 User found:', user);
        
        if (!user) {
            console.error('🔥 User not found for id:', userId);
            return;
        }
        
        // Check if user has an active task - if so, open timer directly
        const performingStatus = this.taskManager.getUserPerformingStatus(userId);
        console.log('🔥 User performing status:', performingStatus);
        if (performingStatus.isPerforming && performingStatus.taskId) {
            console.log('🔥 User has active task, opening timer');
            this.openActiveTaskTimer(performingStatus.taskId, userId);
            return;
        }
        
        const userTasks = this.taskManager.getUserTasks(userId);
        console.log('🔥 User tasks:', userTasks);
        
        // Show admin button only for parents
        const adminBtn = document.getElementById('adminBtn');
        console.log('🔥 User role:', user.role, 'Admin button:', adminBtn);
        if (user.role === 'הורה') {
            console.log('🔥 Showing admin button for parent');
            adminBtn.style.display = 'flex';
        } else {
            console.log('🔥 Hiding admin button for child');
            adminBtn.style.display = 'none';
        }
        
        // Update profile info
        console.log('🔥 Updating profile title');
        document.getElementById('profileTitle').textContent = `הפרופיל של ${user.name}`;
        
        // Update profile info section
        console.log('🔥 Updating profile info section');
        document.getElementById('profileInfo').innerHTML = `
            <div class="profile-avatar">
                ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0)}
            </div>
            <h3>${user.name}</h3>
            <p>${user.role}</p>
            <div class="profile-points">
                <i class="fas fa-star"></i>
                ${user.points} נקודות
            </div>
        `;
        
        // Update stats
        const weeklyStats = this.taskManager.getWeeklyStats();
        const userStats = weeklyStats[userId] || {};
        console.log('🔥 User stats:', userStats);
        
        document.getElementById('profileStats').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${userStats.tasksCompleted || 0}</div>
                <div class="stat-label">משימות השבוע</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round((userStats.totalTime || 0) / 60)}</div>
                <div class="stat-label">שעות עזרה</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${userStats.pointsEarned || 0}</div>
                <div class="stat-label">נקודות השבוע</div>
            </div>
        `;
        
        // Render user tasks
        console.log('🔥 Rendering user tasks');
        this.renderTasks(userTasks, 'userTasksList');
        
        this.previousScreen = 'homeScreen';
        console.log('🔥 About to show profile screen');
        this.showScreen('profileScreen');
        console.log('🔥 showUserProfile completed');
    }

    openActiveTaskTimer(taskId, userId) {
        const task = this.taskManager.data.tasks.find(t => t.id === taskId);
        let activeTimer = this.taskManager.activeTimers.get(userId);
        
        // If no active timer found, but user is performing task, restore from localStorage data
        if (!activeTimer && this.taskManager.getUserPerformingStatus(userId).isPerforming) {
            const user = this.taskManager.getUser(userId);
            if (user && user.activeTimerStartTime && user.activeTimerTaskId === taskId) {
                // Restore timer from saved data
                activeTimer = {
                    taskId: taskId,
                    startTime: user.activeTimerStartTime,
                    interval: null
                };
                this.taskManager.activeTimers.set(userId, activeTimer);
            } else {
                // Fallback: create a new timer entry if data is missing
                activeTimer = {
                    taskId: taskId,
                    startTime: Date.now() - 60000, // Assume started 1 minute ago as fallback
                    interval: null
                };
                this.taskManager.activeTimers.set(userId, activeTimer);
            }
        }
        
        if (!task || !activeTimer) {
            console.log('Task or timer not found:', { task: !!task, activeTimer: !!activeTimer, userId, taskId });
            return;
        }
        
        this.taskManager.currentTask = taskId;
        this.taskManager.selectedUserId = userId;
        
        // Set the timer object to match the active timer
        this.taskManager.timer = {
            start: activeTimer.startTime,
            elapsed: 0
        };
        
        const modal = document.getElementById('modal');
        modal.style.display = 'block';
        
        document.getElementById('modalBody').innerHTML = `
            <div class="task-timer-screen">
                <button class="close-btn" data-close-modal>&times;</button>
                <h2>${task.title}</h2>
                <div class="task-info">
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            זמן משוער: ${task.duration} דקות
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-star"></i>
                            ${task.points} נקודות
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            סוג: ${task.taskType === 'personal' ? 'אישית' : 'משותפת'}
                        </div>
                    </div>
                </div>
                
                <div class="timer-container">
                    <div class="timer-display" id="timerDisplay">00:00</div>
                    <div class="timer-controls">
                        <button class="timer-btn stop" id="stopTimerBtn" data-stop-timer>
                            סיים משימה
                        </button>
                    </div>
                    <div style="margin-top: 15px; color: #4CAF50; font-weight: bold;">
                        <i class="fas fa-play-circle"></i>
                        הטיימר כבר רץ
                    </div>
                </div>
                
                <div class="current-user-info">
                    <i class="fas fa-user"></i>
                    מבצע: ${this.taskManager.getUser(userId).name}
                </div>
            </div>
        `;
        
        // Update the timer display immediately and continue updating
        this.updateTimerDisplay();
        
        // Make sure the timer continues to update
        if (!activeTimer.interval) {
            const timerInterval = setInterval(() => {
                this.updateTimerDisplay();
            }, 1000);
            activeTimer.interval = timerInterval;
        }
    }

    showRoomTasks(room) {
        const roomTasks = this.taskManager.getRoomTasks(room);
        
        document.getElementById('roomTitle').textContent = `משימות ב${room}`;
        this.renderTasks(roomTasks, 'roomTasksList');
        
        this.previousScreen = 'homeScreen';
        this.showScreen('roomScreen');
    }

    startTask(taskId) {
        const task = this.taskManager.data.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Check if task is available
        if (!this.taskManager.isTaskAvailable(taskId, this.taskManager.currentUser)) {
            this.showMessage('משימה זו אינה זמינה כרגע', 'error');
            return;
        }

        this.taskManager.currentTask = taskId;
        this.taskManager.selectedUserId = this.taskManager.currentUser;
        
        // Start the task timer in the data
        const success = this.taskManager.startTaskTimer(taskId, this.taskManager.currentUser);
        if (!success) {
            this.showMessage('לא ניתן להתחיל את המשימה כרגע', 'error');
            return;
        }

        // Update UI to reflect changes
        this.render();
        
        const modal = document.getElementById('modal');
        modal.style.display = 'block';
        
        document.getElementById('modalBody').innerHTML = `
            <div class="task-timer-screen">
                <button class="close-btn" data-close-modal>&times;</button>
                <h2>${task.title}</h2>
                <div class="task-info">
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            זמן משוער: ${task.duration} דקות
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-star"></i>
                            ${task.points} נקודות
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            סוג: ${task.taskType === 'personal' ? 'אישית' : 'משותפת'}
                        </div>
                    </div>
                </div>
                
                <div class="timer-container">
                    <div class="timer-display" id="timerDisplay">00:00</div>
                    <div class="timer-controls">
                        <button class="timer-btn start" id="startTimerBtn" data-start-timer>
                            התחל טיימר
                        </button>
                        <button class="timer-btn stop" id="stopTimerBtn" data-stop-timer>
                            סיים משימה
                        </button>
                    </div>
                </div>
                
                <div class="current-user-info">
                    <i class="fas fa-user"></i>
                    מבצע: ${this.taskManager.getUser(this.taskManager.currentUser).name}
                </div>
            </div>
        `;
    }

    selectUser(userId) {
        // Remove previous selection
        document.querySelectorAll('.user-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked user
        event.target.closest('.user-option').classList.add('selected');
        this.taskManager.selectedUserId = userId;
    }

    startTimer() {
        this.taskManager.timer = { start: Date.now(), elapsed: 0 };
        
        // Store timer in active timers map
        this.taskManager.activeTimers.set(this.taskManager.currentUser, {
            taskId: this.taskManager.currentTask,
            startTime: Date.now(),
            interval: null
        });
        
        // Also save timer info to localStorage for persistence
        const user = this.taskManager.getUser(this.taskManager.currentUser);
        if (user) {
            user.activeTimerStartTime = Date.now();
            user.activeTimerTaskId = this.taskManager.currentTask;
            this.taskManager.saveData();
        }
        
        // Start the interval and store it
        const timerInterval = setInterval(() => {
            const activeTimer = this.taskManager.activeTimers.get(this.taskManager.currentUser);
            if (activeTimer) {
                const elapsed = Date.now() - activeTimer.startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                const timerDisplay = document.getElementById('timerDisplay');
                if (timerDisplay) {
                    timerDisplay.textContent = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
        
        // Store the interval
        this.taskManager.activeTimers.get(this.taskManager.currentUser).interval = timerInterval;
        
        // Show success message and return to home
        this.showMessage('המשימה התקבלה! הטיימר רץ ברקע', 'success');
        this.closeModal();
        this.showScreen('homeScreen');
        this.render(); // Update UI to show performing status
    }

    updateTimerDisplay() {
        const activeTimer = this.taskManager.activeTimers.get(this.taskManager.selectedUserId || this.taskManager.currentUser);
        if (activeTimer) {
            const elapsed = Date.now() - activeTimer.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                timerDisplay.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    stopTimer() {
        // Clear the active timer interval
        const userId = this.taskManager.selectedUserId || this.taskManager.currentUser;
        const activeTimer = this.taskManager.activeTimers.get(userId);
        if (activeTimer && activeTimer.interval) {
            clearInterval(activeTimer.interval);
        }
        
        if (!this.taskManager.timer || !this.taskManager.currentTask || !userId) {
            this.showMessage('אין משימה פעילה', 'error');
            return;
        }
        
        const actualDuration = Math.round((Date.now() - this.taskManager.timer.start) / 60000);
        const task = this.taskManager.data.tasks.find(t => t.id === this.taskManager.currentTask);
        const onTime = actualDuration <= task.duration;
        
        // Complete the task
        const success = this.taskManager.completeTask(
            this.taskManager.currentTask,
            userId,
            actualDuration,
            onTime
        );
        
        if (success) {
            const pointsEarned = this.taskManager.calculatePoints(task, onTime);
            const bonusText = onTime ? ' (כולל בונוס על זמן!)' : '';
            this.showMessage(
                `כל הכבוד! המשימה הושלמה בהצלחה. זכית ב-${pointsEarned} נקודות${bonusText}!`, 
                'success'
            );
            
            // Remove the timer from active timers
            this.taskManager.activeTimers.delete(userId);
            
            // Clear timer info from user data in localStorage
            const user = this.taskManager.getUser(userId);
            if (user) {
                delete user.activeTimerStartTime;
                delete user.activeTimerTaskId;
                this.taskManager.saveData();
            }
            
            // Close modal and update UI
            this.closeModal();
            this.render();
        } else {
            this.showMessage('שגיאה בסיום המשימה', 'error');
        }
        
        // Reset timer state
        this.taskManager.timer = null;
        this.taskManager.currentTask = null;
        this.taskManager.selectedUserId = null;
    }

    renderAdminPanel() {
        this.renderAdminTasks();
        this.renderAdminRewards();
        this.renderAdminUsers();
        this.renderWeeklyStats();
        
        // Add event listeners for admin buttons
        document.getElementById('addTaskBtn').onclick = () => this.showAddTaskForm();
        document.getElementById('addRewardBtn').onclick = () => this.showAddRewardForm();
        document.getElementById('addUserBtn').onclick = () => this.showAddUserForm();
        
        // Settings tab event listeners
        const weeklyResetBtn = document.getElementById('weeklyResetBtn');
        if (weeklyResetBtn) {
            weeklyResetBtn.onclick = () => {
                if (confirm('האם אתה בטוח שברצונך לאפס את הנתונים השבועיים?')) {
                    this.taskManager.resetWeeklyStats();
                    this.showMessage('הנתונים השבועיים אופסו בהצלחה!', 'success');
                    this.render();
                }
            };
        }
        
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.onclick = () => this.exportData();
        }
        
        const clearAllDataBtn = document.getElementById('clearAllDataBtn');
        if (clearAllDataBtn) {
            clearAllDataBtn.onclick = () => this.clearAllData();
        }
        
        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) {
            importDataBtn.onclick = () => this.triggerImportData();
        }
    }

    renderAdminTasks() {
        const container = document.getElementById('adminTasksList');
        const tasks = this.taskManager.data.tasks;
        
        container.innerHTML = tasks.map(task => `
            <div class="task-card ${task.isActive ? 'active' : ''}">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-difficulty ${task.difficulty}">${task.difficulty}</div>
                </div>
                <div class="task-description">${task.description}</div>
                <div class="task-details">
                    <div class="task-detail">
                        <i class="fas fa-clock"></i>
                        ${task.duration} דקות
                    </div>
                    <div class="task-detail">
                        <i class="fas fa-home"></i>
                        ${task.room}
                    </div>
                    <div class="task-detail">
                        <i class="fas fa-star"></i>
                        ${task.points || 0} נקודות
                    </div>
                </div>
                <div class="task-actions">
                    ${!task.isActive ? `
                        <button class="btn-primary" data-reactivate-task="${task.id}">
                            הפעל מחדש
                        </button>
                    ` : `
                        <button class="btn-secondary" data-deactivate-task="${task.id}">
                            השבת
                        </button>
                    `}
                    <button class="btn-secondary" data-edit-task="${task.id}">
                        ערוך
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAdminRewards() {
        const container = document.getElementById('adminRewardsList');
        const rewards = this.taskManager.data.rewards;
        
        container.innerHTML = rewards.map(reward => `
            <div class="reward-card">
                <div class="reward-image">
                    ${reward.image ? `<img src="${reward.image}" alt="${reward.title}">` : '<i class="fas fa-gift"></i>'}
                </div>
                <div class="reward-title">${reward.title}</div>
                <div class="reward-cost">
                    <i class="fas fa-star"></i>
                    ${reward.cost} נקודות
                </div>
                <div class="task-actions">
                    <button class="btn-secondary" data-edit-reward="${reward.id}">
                        ערוך
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAdminUsers() {
        const container = document.getElementById('adminUsersList');
        const users = this.taskManager.getUsers();
        
        container.innerHTML = users.map(user => `
            <div class="profile-card">
                <div class="profile-avatar">
                    ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0)}
                </div>
                <div class="profile-name">${user.name}</div>
                <div class="profile-role">${user.role}</div>
                <div class="profile-points">
                    <i class="fas fa-star"></i>
                    ${user.points} נקודות
                </div>
                <div class="task-actions">
                    <button class="btn-secondary" data-edit-user="${user.id}">
                        ערוך
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderWeeklyStats() {
        const container = document.getElementById('weeklyStats');
        const stats = this.taskManager.getWeeklyStats();
        
        container.innerHTML = Object.entries(stats).map(([userId, userStats]) => `
            <div class="user-stats">
                <h4>${userStats.name}</h4>
                <div class="stats-grid">
                    <div class="mini-stat">
                        <div class="mini-stat-value">${userStats.tasksCompleted}</div>
                        <div class="mini-stat-label">משימות</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-value">${Math.round(userStats.totalTime / 60)}</div>
                        <div class="mini-stat-label">שעות</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-value">${userStats.pointsEarned}</div>
                        <div class="mini-stat-label">נקודות</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-value">${userStats.onTimeCompletions}</div>
                        <div class="mini-stat-label">בזמן</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    reactivateTask(taskId) {
        this.taskManager.reactivateTask(taskId);
        this.showMessage('המשימה הופעלה מחדש!', 'success');
        this.render();
    }

    deactivateTask(taskId) {
        this.taskManager.updateTask(taskId, { isActive: false });
        this.showMessage('המשימה הושבתה!', 'success');
        this.render();
    }

    showAddTaskForm() {
        const users = this.taskManager.getUsers();
        const rooms = this.taskManager.data.rooms;
        
        const modalContent = `
            <h3>הוספת משימה חדשה</h3>
            <form id="addTaskForm">
                <div class="form-group">
                    <label>שם המשימה</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>תיאור</label>
                    <textarea name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label>זמן משוער (דקות)</label>
                    <select name="duration" required>
                        <option value="15">15 דקות</option>
                        <option value="30">30 דקות</option>
                        <option value="45">45 דקות</option>
                        <option value="60">60 דקות</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>טווח גילאים</label>
                    <input type="text" name="ageRange" placeholder="5-12" required>
                </div>
                <div class="form-group">
                    <label>חדר</label>
                    <select name="room" required>
                        ${rooms.map(room => `<option value="${room}">${room}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>רמת קושי</label>
                    <select name="difficulty" required>
                        <option value="קל">קל</option>
                        <option value="בינוני">בינוני</option>
                        <option value="קשה">קשה</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>נקודות</label>
                    <input type="number" name="points" min="1" required>
                </div>
                <div class="form-group">
                    <label>מיועד עבור</label>
                    ${users.map(user => `
                        <div>
                            <input type="checkbox" name="assignedUsers" value="${user.id}" id="user_${user.id}">
                            <label for="user_${user.id}">${user.name}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>ביטול</button>
                    <button type="submit" class="btn-primary">הוסף משימה</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        document.getElementById('addTaskForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const assignedUsers = Array.from(formData.getAll('assignedUsers')).map(id => parseInt(id));
            
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                duration: parseInt(formData.get('duration')),
                ageRange: formData.get('ageRange'),
                room: formData.get('room'),
                difficulty: formData.get('difficulty'),
                points: parseInt(formData.get('points')),
                assignedUsers: assignedUsers
            };
            
            this.taskManager.addTask(taskData);
            this.showMessage('המשימה נוספה בהצלחה!', 'success');
            this.closeModal();
            this.render();
        };
    }

    showAddRewardForm() {
        const modalContent = `
            <h3>הוספת פרס חדש</h3>
            <form id="addRewardForm">
                <div class="form-group">
                    <label>שם הפרס</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>עלות בנקודות</label>
                    <input type="number" name="cost" min="1" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>ביטול</button>
                    <button type="submit" class="btn-primary">הוסף פרס</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        document.getElementById('addRewardForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const rewardData = {
                title: formData.get('title'),
                cost: parseInt(formData.get('cost'))
            };
            
            this.taskManager.addReward(rewardData);
            this.showMessage('הפרס נוסף בהצלחה!', 'success');
            this.closeModal();
            this.render();
        };
    }

    showAddUserForm() {
        const modalContent = `
            <h3>הוספת משתמש חדש</h3>
            <form id="addUserForm">
                <div class="form-group">
                    <label>שם</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>תאריך לידה</label>
                    <input type="date" name="birthDate" required>
                </div>
                <div class="form-group">
                    <label>תפקיד</label>
                    <select name="role" required>
                        <option value="הורה">הורה</option>
                        <option value="ילד">ילד</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>תמונת פרופיל</label>
                    <input type="file" name="avatar" accept="image/*">
                    <small>אופציונלי - תמונה לפרופיל</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>ביטול</button>
                    <button type="submit" class="btn-primary">הוסף משתמש</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        document.getElementById('addUserForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const avatarFile = formData.get('avatar');
            
            const userData = {
                name: formData.get('name'),
                birthDate: formData.get('birthDate'),
                role: formData.get('role'),
                avatar: null
            };
            
            // Handle image upload
            if (avatarFile && avatarFile.size > 0) {
                console.log('🔥 Processing image file, size:', Math.round(avatarFile.size / 1024), 'KB');
                
                // Check file size - if too big, compress
                if (avatarFile.size > 500000) { // 500KB
                    console.log('🔥 Image is large, compressing...');
                    this.taskManager.compressImage(avatarFile).then((compressedDataUrl) => {
                        userData.avatar = compressedDataUrl;
                        this.taskManager.addUser(userData);
                        this.showMessage('המשתמש נוסף בהצלחה!', 'success');
                        this.closeModal();
                        this.render();
                    });
                } else {
                    console.log('🔥 Image is small enough, using as-is');
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        userData.avatar = event.target.result;
                        this.taskManager.addUser(userData);
                        this.showMessage('המשתמש נוסף בהצלחה!', 'success');
                        this.closeModal();
                        this.render();
                    };
                    reader.readAsDataURL(avatarFile);
                }
            } else {
                console.log('🔥 Updating user without avatar');
                this.taskManager.addUser(userData);
                this.showMessage('פרטי המשתמש עודכנו בהצלחה!', 'success');
                this.closeModal();
                this.render();
            }
        };
    }

    editUser(userId) {
        console.log('🔥 editUser called with userId:', userId);
        const user = this.taskManager.getUser(userId);
        if (!user) {
            console.error('🔥 User not found:', userId);
            return;
        }
        
        console.log('🔥 User found:', user);
        
        console.log('🔥 Creating modal content for user:', user.name);
        const modalContent = `
            <h3>עריכת משתמש</h3>
            <form id="editUserForm">
                <div class="form-group">
                    <label>שם</label>
                    <input type="text" name="name" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label>תאריך לידה</label>
                    <input type="date" name="birthDate" value="${user.birthDate}" required>
                </div>
                <div class="form-group">
                    <label>תפקיד</label>
                    <select name="role" required>
                        <option value="הורה" ${user.role === 'הורה' ? 'selected' : ''}>הורה</option>
                        <option value="ילד" ${user.role === 'ילד' ? 'selected' : ''}>ילד</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>תמונת פרופיל</label>
                    ${user.avatar ? `
                        <div style="margin-bottom: 1rem;">
                            <img src="${user.avatar}" alt="תמונה נוכחית" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                            <p style="font-size: 0.9rem; color: #666;">תמונה נוכחית</p>
                        </div>
                    ` : ''}
                    <input type="file" name="avatar" accept="image/*">
                    <small>אופציונלי - תמונה חדשה לפרופיל</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>ביטול</button>
                    <button type="submit" class="btn-primary">שמור שינויים</button>
                </div>
            </form>
        `;
        
        console.log('🔥 Modal content created, calling showModal');
        this.showModal(modalContent);
        console.log('🔥 showModal called, setting up form submit handler');
        
        const editUserForm = document.getElementById('editUserForm');
        console.log('🔥 editUserForm element:', editUserForm);
        if (!editUserForm) {
            console.error('🔥 editUserForm not found after showModal!');
            return;
        }
        
        editUserForm.onsubmit = (e) => {
            console.log('🔥 editUserForm onsubmit triggered');
            e.preventDefault();
            const formData = new FormData(e.target);
            const avatarFile = formData.get('avatar');
            
            const updates = {
                name: formData.get('name'),
                birthDate: formData.get('birthDate'),
                role: formData.get('role')
            };
            
            console.log('🔥 About to update user with:', updates);
            
            // Handle image upload
            if (avatarFile && avatarFile.size > 0) {
                console.log('🔥 Processing image file, size:', Math.round(avatarFile.size / 1024), 'KB');
                
                // Check file size - if too big, compress
                if (avatarFile.size > 500000) { // 500KB
                    console.log('🔥 Image is large, compressing...');
                    this.taskManager.compressImage(avatarFile).then((compressedDataUrl) => {
                        updates.avatar = compressedDataUrl;
                        console.log('🔥 Updating user with compressed avatar');
                        this.taskManager.updateUser(userId, updates);
                        this.showMessage('פרטי המשתמש עודכנו בהצלחה!', 'success');
                        this.closeModal();
                        console.log('🔥 About to render after user update');
                        this.render();
                    });
                } else {
                    console.log('🔥 Image is small enough, using as-is');
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        updates.avatar = event.target.result;
                        console.log('🔥 Updating user with avatar');
                        this.taskManager.updateUser(userId, updates);
                        this.showMessage('פרטי המשתמש עודכנו בהצלחה!', 'success');
                        this.closeModal();
                        console.log('🔥 About to render after user update');
                        this.render();
                    };
                    reader.readAsDataURL(avatarFile);
                }
            } else {
                console.log('🔥 Updating user without avatar');
                this.taskManager.updateUser(userId, updates);
                this.showMessage('פרטי המשתמש עודכנו בהצלחה!', 'success');
                this.closeModal();
                console.log('🔥 About to render after user update');
                this.render();
            }
        };
    }

    exportData() {
        const data = JSON.stringify(this.taskManager.data, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showMessage('הגיבוי הורד בהצלחה!', 'success');
    }

    clearAllData() {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו בלתי הפיכה!')) {
            if (confirm('אישור נוסף: כל הנתונים יימחקו לצמיתות. להמשיך?')) {
                localStorage.removeItem('familyTaskData');
                this.taskManager.initializeData();
                this.taskManager.loadData();
                this.showMessage('כל הנתונים נמחקו ואופס הקובץ למצב התחלתי', 'success');
                this.render();
                this.showScreen('homeScreen');
            }
        }
    }

    triggerImportData() {
        document.getElementById('importFileInput').click();
        
        document.getElementById('importFileInput').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
            }
        };
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate the data structure
                if (!importedData.users || !importedData.tasks || !importedData.rewards) {
                    throw new Error('קובץ לא תקין - חסרים נתונים חיוניים');
                }
                
                if (confirm('האם אתה בטוח שברצונך לייבא את הנתונים? הפעולה תחליף את כל הנתונים הנוכחיים!')) {
                    // Save the imported data
                    this.taskManager.saveData(importedData);
                    this.taskManager.loadData();
                    
                    this.showMessage('הנתונים יובאו בהצלחה! המערכת התעדכנה.', 'success');
                    this.render();
                    this.showScreen('homeScreen');
                    
                    // Reset file input
                    document.getElementById('importFileInput').value = '';
                }
            } catch (error) {
                this.showMessage('שגיאה בייבוא הנתונים: ' + error.message, 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.onerror = () => {
            this.showMessage('שגיאה בקריאת הקובץ', 'error');
        };
        
        reader.readAsText(file);
    }

    editTask(taskId) {
        const task = this.taskManager.data.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const users = this.taskManager.getUsers();
        const rooms = this.taskManager.data.rooms;
        
        const modalContent = `
            <h3>עריכת משימה</h3>
            <form id="editTaskForm">
                <div class="form-group">
                    <label>שם המשימה</label>
                    <input type="text" name="title" value="${task.title}" required>
                </div>
                <div class="form-group">
                    <label>תיאור</label>
                    <textarea name="description" required>${task.description}</textarea>
                </div>
                <div class="form-group">
                    <label>זמן משוער (דקות)</label>
                    <select name="duration" required>
                        <option value="15" ${task.duration === 15 ? 'selected' : ''}>15 דקות</option>
                        <option value="30" ${task.duration === 30 ? 'selected' : ''}>30 דקות</option>
                        <option value="45" ${task.duration === 45 ? 'selected' : ''}>45 דקות</option>
                        <option value="60" ${task.duration === 60 ? 'selected' : ''}>60 דקות</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>טווח גילאים</label>
                    <input type="text" name="ageRange" value="${task.ageRange}" required>
                </div>
                <div class="form-group">
                    <label>חדר</label>
                    <select name="room" required>
                        ${rooms.map(room => `<option value="${room}" ${task.room === room ? 'selected' : ''}>${room}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>רמת קושי</label>
                    <select name="difficulty" required>
                        <option value="קל" ${task.difficulty === 'קל' ? 'selected' : ''}>קל</option>
                        <option value="בינוני" ${task.difficulty === 'בינוני' ? 'selected' : ''}>בינוני</option>
                        <option value="קשה" ${task.difficulty === 'קשה' ? 'selected' : ''}>קשה</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>נקודות</label>
                    <input type="number" name="points" value="${task.points || 0}" min="1" required>
                </div>
                <div class="form-group">
                    <label>מיועד עבור</label>
                    ${users.map(user => `
                        <div>
                            <input type="checkbox" name="assignedUsers" value="${user.id}" id="edit_user_${user.id}" ${task.assignedUsers.includes(user.id) ? 'checked' : ''}>
                            <label for="edit_user_${user.id}">${user.name}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>ביטול</button>
                    <button type="submit" class="btn-primary">שמור שינויים</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        document.getElementById('editTaskForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const assignedUsers = Array.from(formData.getAll('assignedUsers')).map(id => parseInt(id));
            
            const updates = {
                title: formData.get('title'),
                description: formData.get('description'),
                duration: parseInt(formData.get('duration')),
                ageRange: formData.get('ageRange'),
                room: formData.get('room'),
                difficulty: formData.get('difficulty'),
                points: parseInt(formData.get('points')),
                assignedUsers: assignedUsers
            };
            
            this.taskManager.updateTask(taskId, updates);
            this.showMessage('המשימה עודכנה בהצלחה!', 'success');
            this.closeModal();
            this.render();
        };
    }

    editReward(rewardId) {
        const reward = this.taskManager.data.rewards.find(r => r.id === rewardId);
        if (!reward) return;
        
        const modalContent = `
            <h3>עריכת פרס</h3>
            <form id="editRewardForm">
                <div class="form-group">
                    <label>שם הפרס</label>
                    <input type="text" name="title" value="${reward.title}" required>
                </div>
                <div class="form-group">
                    <label>עלות בנקודות</label>
                    <input type="number" name="cost" value="${reward.cost}" min="1" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-close-modal>ביטול</button>
                    <button type="submit" class="btn-primary">שמור שינויים</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        document.getElementById('editRewardForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const updates = {
                title: formData.get('title'),
                cost: parseInt(formData.get('cost'))
            };
            
            const rewardIndex = this.taskManager.data.rewards.findIndex(r => r.id === rewardId);
            if (rewardIndex !== -1) {
                this.taskManager.data.rewards[rewardIndex] = { ...this.taskManager.data.rewards[rewardIndex], ...updates };
                this.taskManager.saveData();
                this.showMessage('הפרס עודכן בהצלחה!', 'success');
                this.closeModal();
                this.render();
            }
        };
    }

    showModal(content) {
        console.log('🔥 showModal called with content length:', content.length);
        console.log('🔥 Modal content preview:', content.substring(0, 100));
        const modalBody = document.getElementById('modalBody');
        console.log('🔥 modalBody element:', modalBody);
        if (!modalBody) {
            console.error('🔥 modalBody element not found!');
            return;
        }
        modalBody.innerHTML = content;
        console.log('🔥 modalBody content set');
        
        const modal = document.getElementById('modal');
        console.log('🔥 modal element:', modal);
        if (!modal) {
            console.error('🔥 modal element not found!');
            return;
        }
        modal.classList.add('active');
        console.log('🔥 modal active class added');
        console.log('🔥 showModal completed successfully');
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        
        // Only clear UI state if there's no active timer running
        // This allows the timer to continue in background
        const userId = this.taskManager.selectedUserId || this.taskManager.currentUser;
        const hasActiveTimer = userId && this.taskManager.activeTimers.has(userId);
        
        if (!hasActiveTimer) {
            this.taskManager.timer = null;
            this.taskManager.currentTask = null;
            this.taskManager.selectedUserId = null;
        } else {
            // Keep the timer state for active timers, just clear UI references
            this.taskManager.timer = null; // UI timer reference can be cleared
            // Keep currentTask and selectedUserId for active timers
        }
    }

    showMessage(text, type = 'info') {
        const container = document.getElementById('messageContainer');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        container.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    showAdminTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab content
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
        
        // Add active class to selected tab button
        event.target.classList.add('active');
    }

    initializeEventListeners() {
        // Remove existing event listener if it exists
        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler);
        }
        
        // Admin button - will be shown only for parents
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showScreen('adminScreen');
            });
        }

        // Modal close - check if exists
        const modalClose = document.querySelector('.modal-content .close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Click outside modal to close
        const modal = document.getElementById('modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'modal') {
                    this.closeModal();
                }
            });
        }

        // Add the main click handler
        document.addEventListener('click', this.clickHandler);
        console.log('🔥 Event listeners initialized/re-initialized');
    }
}

// Global functions for window scope - only keeping essential ones
window.showScreen = function(screenId) {
    ui.showScreen(screenId);
};

window.showAdminTab = function(tabName) {
    ui.showAdminTab(tabName);
};

window.goBackFromTask = function() {
    ui.showScreen(ui.previousScreen);
};

// Initialize the application
let taskManager, ui;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 DOMContentLoaded event fired!');
    if (!taskManager) {
        console.log('🔥 Creating new taskManager');
        taskManager = new FamilyTaskManager();
    }
    if (!ui) {
        console.log('🔥 Creating new UIManager');
        ui = new UIManager(taskManager);
    }
    console.log('🔥 Application initialized successfully!');
}); 