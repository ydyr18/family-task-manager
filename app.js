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
            console.log('💾 Saving data, size:', Math.round(dataString.length / 1024), 'KB');
            localStorage.setItem('familyTaskData', dataString);
            this.data = data;
            console.log('✅ Data saved successfully');
        } catch (error) {
            console.error('❌ Error saving data:', error);
            if (error.name === 'QuotaExceededError') {
                alert('🚫 אחסון מלא! התמונות גדולות מדי.\n\nפתרונות:\n1. השתמש בתמונות קטנות יותר\n2. מחק תמונות ישנות\n3. עשה גיבוי והתחל מחדש');
                
                // Try to save without the new avatar as fallback
                const dataWithoutNewAvatars = JSON.parse(JSON.stringify(data));
                dataWithoutNewAvatars.users.forEach(user => {
                    if (user.avatar && user.avatar.length > 100000) { // Remove very large avatars
                        console.log('🗑️ Removing large avatar for user:', user.name);
                        user.avatar = null;
                    }
                });
                
                try {
                    localStorage.setItem('familyTaskData', JSON.stringify(dataWithoutNewAvatars));
                    this.data = dataWithoutNewAvatars;
                    alert('✅ הנתונים נשמרו ללא התמונות הגדולות.');
                    return true;
                } catch (fallbackError) {
                    console.error('❌ Even fallback save failed:', fallbackError);
                    alert('💥 שגיאה קריטית! נסה לרענן את הדף או לעשות גיבוי.');
                    return false;
                }
            }
            return false;
        }
        return true;
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

    // Helper method to compress image
    compressImage(file, maxWidth = 200, quality = 0.7) {
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
                
                console.log('📷 Image compressed from', Math.round(file.size / 1024), 'KB to', Math.round(compressedDataUrl.length * 0.75 / 1024), 'KB');
                resolve(compressedDataUrl);
            };
            
            img.src = URL.createObjectURL(file);
        });
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
}

// Image Cropper Class
class ImageCropper {
    constructor() {
        this.image = null;
        this.canvas = null;
        this.ctx = null;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.cropCallback = null;
    }

    showCropper(file, callback) {
        console.log('🎯 ImageCropper.showCropper called with file:', file);
        this.cropCallback = callback;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'image-cropper-modal';
        console.log('🎯 Created modal element');
        modal.innerHTML = `
            <div class="cropper-container">
                <div class="cropper-header">
                    <h3>🎯 חיתוך תמונת פרופיל</h3>
                    <p>גרור את התמונה ושנה את הזום לבחירת האזור המושלם</p>
                </div>
                
                <div class="cropper-canvas-container" id="cropperCanvasContainer">
                    <canvas id="cropperCanvas" class="cropper-canvas"></canvas>
                    <div class="cropper-overlay"></div>
                </div>
                
                <div class="cropper-controls">
                    <div class="cropper-zoom-container">
                        <button class="zoom-btn" id="zoomOut">−</button>
                        <input type="range" id="zoomSlider" class="zoom-slider" min="0.3" max="2.5" step="0.1" value="1">
                        <button class="zoom-btn" id="zoomIn">+</button>
                    </div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                        גרור את התמונה • השתמש בזום
                    </div>
                </div>
                
                <div class="cropper-actions">
                    <button class="cancel-crop-btn" id="cancelCrop">ביטול</button>
                    <button class="crop-btn" id="confirmCrop">
                        <i class="fas fa-crop"></i>
                        שמור תמונה
                    </button>
                </div>
            </div>
        `;
        
        console.log('🎯 Appending modal to document body');
        document.body.appendChild(modal);
        
        // Debug: Make sure modal is visible
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '999999';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        console.log('🎯 Modal visibility forced, checking if visible...');
        
        // Check if modal was added
        const addedModal = document.querySelector('.image-cropper-modal');
        console.log('🎯 Modal found in DOM:', !!addedModal);
        
        // Initialize canvas and image
        this.canvas = document.getElementById('cropperCanvas');
        this.ctx = this.canvas.getContext('2d');
        console.log('🎯 Canvas initialized:', !!this.canvas, !!this.ctx);
        this.loadImage(file);
        
        // Event listeners
        this.setupEventListeners(modal);
        console.log('🎯 ImageCropper setup completed');
    }

    loadImage(file) {
        console.log('🎯 Loading image file:', file.name, file.size, file.type);
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('🎯 FileReader loaded image data');
            this.image = new Image();
            this.image.onload = () => {
                console.log('🎯 Image loaded, dimensions:', this.image.width, 'x', this.image.height);
                this.initializeCanvas();
                this.drawImage();
            };
            this.image.onerror = (error) => {
                console.error('🎯 Image load error:', error);
            };
            this.image.src = e.target.result;
        };
        reader.onerror = (error) => {
            console.error('🎯 FileReader error:', error);
        };
        reader.readAsDataURL(file);
    }

    initializeCanvas() {
        const containerSize = 300;
        this.canvas.width = containerSize;
        this.canvas.height = containerSize;
        
        // Calculate initial scale to fit image
        const imageAspect = this.image.width / this.image.height;
        if (imageAspect > 1) {
            // Landscape
            this.scale = containerSize / this.image.height;
        } else {
            // Portrait or square
            this.scale = containerSize / this.image.width;
        }
        
        // Center the image
        this.offsetX = 0;
        this.offsetY = 0;
        
        document.getElementById('zoomSlider').value = this.scale;
    }

    drawImage() {
        if (!this.image || !this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate scaled dimensions
        const scaledWidth = this.image.width * this.scale;
        const scaledHeight = this.image.height * this.scale;
        
        // Calculate position (centered + offset)
        const x = (this.canvas.width - scaledWidth) / 2 + this.offsetX;
        const y = (this.canvas.height - scaledHeight) / 2 + this.offsetY;
        
        // Draw image
        this.ctx.drawImage(this.image, x, y, scaledWidth, scaledHeight);
    }

    setupEventListeners(modal) {
        const container = document.getElementById('cropperCanvasContainer');
        const zoomSlider = document.getElementById('zoomSlider');
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        const confirmCrop = document.getElementById('confirmCrop');
        const cancelCrop = document.getElementById('cancelCrop');

        // Mouse events for dragging
        container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastX;
                const deltaY = e.clientY - this.lastY;
                
                this.offsetX += deltaX;
                this.offsetY += deltaY;
                
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                
                this.drawImage();
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                container.style.cursor = 'move';
            }
        });

        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.isDragging = true;
            this.lastX = touch.clientX;
            this.lastY = touch.clientY;
        });

        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging && e.touches.length === 1) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.lastX;
                const deltaY = touch.clientY - this.lastY;
                
                this.offsetX += deltaX;
                this.offsetY += deltaY;
                
                this.lastX = touch.clientX;
                this.lastY = touch.clientY;
                
                this.drawImage();
            }
        });

        container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
        });

        // Zoom controls
        zoomSlider.addEventListener('input', (e) => {
            this.scale = parseFloat(e.target.value);
            this.drawImage();
        });

        zoomIn.addEventListener('click', () => {
            this.scale = Math.min(3, this.scale + 0.1);
            zoomSlider.value = this.scale;
            this.drawImage();
        });

        zoomOut.addEventListener('click', () => {
            this.scale = Math.max(0.5, this.scale - 0.1);
            zoomSlider.value = this.scale;
            this.drawImage();
        });

        zoomReset.addEventListener('click', () => {
            this.scale = 1;
            zoomSlider.value = this.scale;
            this.drawImage();
        });

        // Action buttons
        confirmCrop.addEventListener('click', () => {
            console.log('🎯 Confirm crop clicked');
            const croppedDataUrl = this.getCroppedImage();
            console.log('🎯 Got cropped image, closing modal');
            this.closeCropper(modal);
            if (this.cropCallback) {
                console.log('🎯 Calling crop callback');
                this.cropCallback(croppedDataUrl);
            }
        });

        cancelCrop.addEventListener('click', () => {
            console.log('🎯 Cancel crop clicked');
            this.closeCropper(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCropper(modal);
            }
        });
    }

    getCroppedImage() {
        // Create a new canvas for the cropped result
        const resultCanvas = document.createElement('canvas');
        const resultCtx = resultCanvas.getContext('2d');
        
        // Set canvas size to desired output (200x200 for circular avatar)
        const outputSize = 200;
        resultCanvas.width = outputSize;
        resultCanvas.height = outputSize;
        
        // Calculate the crop area from the current view
        const sourceSize = 300; // Original canvas size
        const scaledWidth = this.image.width * this.scale;
        const scaledHeight = this.image.height * this.scale;
        
        // Calculate the source rectangle on the original image
        const centerX = (this.canvas.width - scaledWidth) / 2 + this.offsetX;
        const centerY = (this.canvas.height - scaledHeight) / 2 + this.offsetY;
        
        // Calculate crop area in original image coordinates
        const cropSize = sourceSize; // Use full canvas as crop area
        const cropX = (-centerX) / this.scale;
        const cropY = (-centerY) / this.scale;
        const cropWidth = cropSize / this.scale;
        const cropHeight = cropSize / this.scale;
        
        // Create circular clip
        resultCtx.beginPath();
        resultCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        resultCtx.clip();
        
        // Draw the cropped image
        resultCtx.drawImage(
            this.image,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, outputSize, outputSize
        );
        
        return resultCanvas.toDataURL('image/jpeg', 0.8);
    }

    closeCropper(modal) {
        document.body.removeChild(modal);
        this.image = null;
        this.canvas = null;
        this.ctx = null;
        this.cropCallback = null;
    }
}

// UI Manager Class
class UIManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        
        // Only initialize if not already done
        if (!this.isInitialized) {
            this.initializeEventListeners();
            this.isInitialized = true;
        }
        
        this.render();
    }

    initializeEventListeners() {
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
    }

    render() {
        this.renderFamilyProfiles();
        this.renderRooms();
        this.renderRewards();
        this.renderAdminPanel();
        
        // Hide admin button initially when on home screen
        const adminBtn = document.getElementById('adminBtn');
        adminBtn.style.display = 'none';
    }

    renderFamilyProfiles() {
        const container = document.getElementById('familyProfiles');
        const users = this.taskManager.getUsers();
        
        container.innerHTML = users.map(user => {
            const age = this.taskManager.calculateAge(user.birthDate);
            const performingStatus = this.taskManager.getUserPerformingStatus(user.id);
            const statusClass = performingStatus.isPerforming ? 'performing-task' : '';
            const statusText = performingStatus.isPerforming ? 'בביצוע משימה' : '';
            
            return `
                <div class="profile-card ${statusClass}" onclick="showUserProfile(${user.id})">
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
        }).join('');
    }

    renderRooms() {
        const container = document.getElementById('roomsGrid');
        const rooms = this.taskManager.data.rooms;
        
        container.innerHTML = rooms.map(room => {
            const taskCount = this.taskManager.getRoomTasks(room).length;
            return `
                <div class="room-card" onclick="showRoomTasks('${room}')">
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
                     ${isAvailable ? `onclick="startTask(${task.id})"` : ''}>
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
        this.taskManager.currentUser = userId;
        const user = this.taskManager.getUser(userId);
        
        // Check if user has an active task - if so, open timer directly
        const performingStatus = this.taskManager.getUserPerformingStatus(userId);
        if (performingStatus.isPerforming && performingStatus.taskId) {
            this.openActiveTaskTimer(performingStatus.taskId, userId);
            return;
        }
        
        const userTasks = this.taskManager.getUserTasks(userId);
        
        // Show admin button only for parents
        const adminBtn = document.getElementById('adminBtn');
        if (user.role === 'הורה') {
            adminBtn.style.display = 'flex';
        } else {
            adminBtn.style.display = 'none';
        }
        
        // Update profile info
        document.getElementById('profileTitle').textContent = `הפרופיל של ${user.name}`;
        
        // Update profile info section
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
        this.renderTasks(userTasks, 'userTasksList');
        
        this.previousScreen = 'homeScreen';
        this.showScreen('profileScreen');
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
                <button class="close-btn" onclick="closeModal()">&times;</button>
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
                        <button class="timer-btn stop" id="stopTimerBtn" onclick="stopTimer()">
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
                <button class="close-btn" onclick="closeModal()">&times;</button>
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
                        <button class="timer-btn start" id="startTimerBtn" onclick="startTimer()">
                            התחל טיימר
                        </button>
                        <button class="timer-btn stop" id="stopTimerBtn" onclick="stopTimer()" disabled>
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
        
        // Show storage usage
        const storageInfo = this.checkStorageUsage();
        const storageDisplay = document.getElementById('storageUsage');
        if (storageDisplay) {
            const colorClass = storageInfo.percentage > 80 ? 'danger' : storageInfo.percentage > 60 ? 'warning' : 'success';
            storageDisplay.innerHTML = `
                <div class="storage-info ${colorClass}">
                    <i class="fas fa-database"></i>
                    שימוש באחסון: ${storageInfo.used} KB / ${storageInfo.max} KB (${storageInfo.percentage}%)
                    ${storageInfo.percentage > 80 ? '<br><small style="color: #ff4444;">⚠️ אחסון כמעט מלא - מומלץ למחוק תמונות או לעשות גיבוי</small>' : ''}
                </div>
            `;
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
                        <button class="btn-primary" onclick="reactivateTask(${task.id})">
                            הפעל מחדש
                        </button>
                    ` : `
                        <button class="btn-secondary" onclick="deactivateTask(${task.id})">
                            השבת
                        </button>
                    `}
                    <button class="btn-secondary" onclick="editTask(${task.id})">
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
                    <button class="btn-secondary" onclick="editReward(${reward.id})">
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
                    <button class="btn-secondary" onclick="editUser(${user.id})">
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
                    <button type="button" class="btn-secondary" onclick="closeModal()">ביטול</button>
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
                    <button type="button" class="btn-secondary" onclick="closeModal()">ביטול</button>
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
                    <input type="file" name="avatar" accept="image/*" id="addAvatarFileInput">
                    <small>אופציונלי - תמונה לפרופיל</small>
                    <button type="button" id="addCropImageBtn" class="crop-btn-inline" style="display: none; margin-top: 10px;">
                        <i class="fas fa-crop"></i>
                        חתוך תמונה
                    </button>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">ביטול</button>
                    <button type="submit" class="btn-primary">הוסף משתמש</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        document.getElementById('addUserForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const userData = {
                name: formData.get('name'),
                birthDate: formData.get('birthDate'),
                role: formData.get('role'),
                avatar: null
            };
            
            // Only save form data - avatar is handled separately by crop button
            console.log('🔥 Adding user with form data only');
            this.taskManager.addUser(userData);
            this.showMessage('המשתמש נוסף בהצלחה!', 'success');
            this.closeModal();
            this.render();
        };
        
        // Handle file selection for add user form
        const addFileInput = document.getElementById('addAvatarFileInput');
        const addCropBtn = document.getElementById('addCropImageBtn');
        let addSelectedFile = null;
        
        addFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.size > 0) {
                addSelectedFile = file;
                addCropBtn.style.display = 'flex';
                console.log('🔥 Add form: File selected, showing crop button');
            } else {
                addSelectedFile = null;
                addCropBtn.style.display = 'none';
                console.log('🔥 Add form: No file selected, hiding crop button');
            }
        });
        
        // Handle crop button click for add user
        addCropBtn.addEventListener('click', () => {
            if (!addSelectedFile) {
                console.log('🔥 Add form: No file to crop');
                return;
            }
            
            console.log('🔥 Add form: Starting image cropper...');
            // Get current form data first
            const formData = new FormData(document.getElementById('addUserForm'));
            const userData = {
                name: formData.get('name'),
                birthDate: formData.get('birthDate'),
                role: formData.get('role'),
                avatar: null
            };
            
            // Close current modal first
            this.closeModal();
            
            // Use image cropper
            const cropper = new ImageCropper();
            cropper.showCropper(addSelectedFile, (croppedDataUrl) => {
                console.log('🔥 Add form: Cropped image received');
                
                // Add user with cropped avatar
                userData.avatar = croppedDataUrl;
                this.taskManager.addUser(userData);
                this.showMessage('המשתמש נוסף בהצלחה עם תמונה!', 'success');
                
                // Go back to home screen directly
                this.showScreen('homeScreen');
                this.render();
            });
        });
    }

    editUser(userId) {
        console.log('🔥 editUser STARTED with userId:', userId, 'Type:', typeof userId);
        const user = this.taskManager.getUser(userId);
        console.log('🔥 User retrieved:', user);
        if (!user) {
            console.error('🔥 User not found for ID:', userId);
            return;
        }
        
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
                    <input type="file" name="avatar" accept="image/*" id="avatarFileInput">
                    <small>אופציונלי - תמונה חדשה לפרופיל</small>
                    <button type="button" id="cropImageBtn" class="crop-btn-inline" style="display: none; margin-top: 10px;">
                        <i class="fas fa-crop"></i>
                        חתוך תמונה
                    </button>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">ביטול</button>
                    <button type="submit" class="btn-primary">שמור שינויים</button>
                </div>
            </form>
        `;
        
        console.log('🔥 About to call showModal with content length:', modalContent.length);
        this.showModal(modalContent);
        console.log('🔥 showModal called, setting up form handler');
        
        const form = document.getElementById('editUserForm');
        console.log('🔥 Form element found:', !!form);
        if (!form) {
            console.error('🔥 Form not found after showModal!');
            return;
        }
        
        form.onsubmit = (e) => {
            console.log('🔥 Form submit triggered');
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const updates = {
                name: formData.get('name'),
                birthDate: formData.get('birthDate'),
                role: formData.get('role')
            };
            
            // Only save form data - avatar is handled separately by crop button
            console.log('🔥 Saving form data only');
            this.taskManager.updateUser(userId, updates);
            this.showMessage('פרטי המשתמש עודכנו בהצלחה!', 'success');
            this.closeModal();
            this.render();
        };
        
        // Handle file selection to show/hide crop button
        const fileInput = document.getElementById('avatarFileInput');
        const cropBtn = document.getElementById('cropImageBtn');
        let selectedFile = null;
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.size > 0) {
                selectedFile = file;
                cropBtn.style.display = 'flex';
                console.log('🔥 File selected, showing crop button');
            } else {
                selectedFile = null;
                cropBtn.style.display = 'none';
                console.log('🔥 No file selected, hiding crop button');
            }
        });
        
        // Handle crop button click
        cropBtn.addEventListener('click', () => {
            if (!selectedFile) {
                console.log('🔥 No file to crop');
                return;
            }
            
            console.log('🔥 Starting image cropper...');
            // Close current modal first
            this.closeModal();
            
            // Use image cropper
            const cropper = new ImageCropper();
            cropper.showCropper(selectedFile, (croppedDataUrl) => {
                console.log('🔥 Cropped image received, size:', croppedDataUrl.length);
                
                // Update user with new avatar
                const avatarUpdate = { avatar: croppedDataUrl };
                this.taskManager.updateUser(userId, avatarUpdate);
                this.showMessage('תמונת הפרופיל עודכנה בהצלחה!', 'success');
                
                // Go back to home screen directly
                this.showScreen('homeScreen');
                this.render();
            });
        });
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

    checkStorageUsage() {
        try {
            const data = localStorage.getItem('familyTaskData');
            const used = data ? data.length : 0;
            const usedKB = Math.round(used / 1024);
            const maxKB = 5120; // ~5MB typical localStorage limit
            const percentage = Math.round((used / (maxKB * 1024)) * 100);
            
            console.log(`📊 localStorage usage: ${usedKB} KB / ${maxKB} KB (${percentage}%)`);
            
            return { used: usedKB, max: maxKB, percentage };
        } catch (error) {
            console.error('Error checking storage:', error);
            return { used: 0, max: 5120, percentage: 0 };
        }
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
                    <button type="button" class="btn-secondary" onclick="closeModal()">ביטול</button>
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
                    <button type="button" class="btn-secondary" onclick="closeModal()">ביטול</button>
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
        console.log('🔥 showModal STARTED, content length:', content.length);
        const modalBody = document.getElementById('modalBody');
        console.log('🔥 modalBody element:', !!modalBody);
        if (!modalBody) {
            console.error('🔥 modalBody not found!');
            return;
        }
        
        modalBody.innerHTML = content;
        console.log('🔥 modalBody content set');
        
        const modal = document.getElementById('modal');
        console.log('🔥 modal element:', !!modal);
        if (!modal) {
            console.error('🔥 modal not found!');
            return;
        }
        
        modal.classList.add('active');
        modal.style.display = 'block';
        console.log('🔥 modal display and class set');
        console.log('🔥 showModal COMPLETED');
    }

    closeModal() {
        console.log('🔥 closeModal called');
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
        
        // Clear modal body
        const modalBody = document.getElementById('modalBody');
        if (modalBody) {
            modalBody.innerHTML = '<span class="close">&times;</span>';
        }
        
        // Only clear timer state if no active timer is running
        const userId = this.taskManager.selectedUserId || this.taskManager.currentUser;
        const hasActiveTimer = userId && this.taskManager.activeTimers.has(userId);
        
        if (!hasActiveTimer) {
            this.taskManager.timer = null;
            this.taskManager.currentTask = null;
            this.taskManager.selectedUserId = null;
        }
        
        console.log('🔥 closeModal completed');
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
}

// Global functions for window scope
window.showScreen = function(screenId) {
    if (ui) ui.showScreen(screenId);
};

window.showAdminTab = function(tabName) {
    if (ui) ui.showAdminTab(tabName);
};

window.closeModal = function() {
    if (ui) ui.closeModal();
};

window.goBackFromTask = function() {
    if (ui) ui.showScreen(ui.previousScreen);
};

// User and Profile functions
window.showUserProfile = function(userId) {
    if (ui) ui.showUserProfile(userId);
};

window.showRoomTasks = function(room) {
    if (ui) ui.showRoomTasks(room);
};

window.startTask = function(taskId) {
    if (ui) ui.startTask(taskId);
};

window.startTimer = function() {
    if (ui) ui.startTimer();
};

window.stopTimer = function() {
    if (ui) ui.stopTimer();
};

// Admin functions - ENSURE THESE ARE ALWAYS AVAILABLE
window.editUser = function(userId) {
    console.log('🔥 window.editUser called with userId:', userId);
    if (ui && ui.editUser) {
        ui.editUser(userId);
    } else {
        console.error('🔥 ui or ui.editUser not available!');
    }
};

window.editTask = function(taskId) {
    console.log('🔥 window.editTask called with taskId:', taskId);
    if (ui && ui.editTask) {
        ui.editTask(taskId);
    } else {
        console.error('🔥 ui or ui.editTask not available!');
    }
};

window.editReward = function(rewardId) {
    console.log('🔥 window.editReward called with rewardId:', rewardId);
    if (ui && ui.editReward) {
        ui.editReward(rewardId);
    } else {
        console.error('🔥 ui or ui.editReward not available!');
    }
};

window.reactivateTask = function(taskId) {
    if (ui) ui.reactivateTask(taskId);
};

window.deactivateTask = function(taskId) {
    if (ui) ui.deactivateTask(taskId);
};

// Initialize the application
let taskManager, ui;

document.addEventListener('DOMContentLoaded', () => {
    if (!taskManager) {
        taskManager = new FamilyTaskManager();
    }
    if (!ui) {
        ui = new UIManager(taskManager);
    }
}); 