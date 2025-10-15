// Supabase Database Manager
class SupabaseManager {
    constructor() {
        this.isConnected = false;
        this.init();
    }

    async init() {
        try {
            // Test connection
            const { data, error } = await supabaseClient.from('users').select('count').limit(1);
            if (error) {
                console.error('🔥 Supabase connection failed:', error);
                this.isConnected = false;
                return;
            }
            this.isConnected = true;
            console.log('🔥 Supabase connected successfully');
        } catch (err) {
            console.error('🔥 Supabase initialization failed:', err);
            this.isConnected = false;
        }
    }

    // User Management
    async getUsers() {
        if (!this.isConnected) return this.getLocalUsers();
        
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .order('id');
            
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('🔥 Error fetching users:', err);
            return this.getLocalUsers();
        }
    }

    async addUser(userData) {
        if (!this.isConnected) return this.addLocalUser(userData);
        
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .insert([userData])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (err) {
            console.error('🔥 Error adding user:', err);
            return this.addLocalUser(userData);
        }
    }

    async updateUser(userId, userData) {
        if (!this.isConnected) return this.updateLocalUser(userId, userData);
        
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .update(userData)
                .eq('id', userId)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (err) {
            console.error('🔥 Error updating user:', err);
            return this.updateLocalUser(userId, userData);
        }
    }

    // Task Management
    async getTasks() {
        if (!this.isConnected) return this.getLocalTasks();
        
        try {
            const { data, error } = await supabaseClient
                .from('tasks')
                .select('*')
                .eq('is_active', true)
                .order('id');
            
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('🔥 Error fetching tasks:', err);
            return this.getLocalTasks();
        }
    }

    async addTask(taskData) {
        if (!this.isConnected) return this.addLocalTask(taskData);
        
        try {
            const { data, error } = await supabaseClient
                .from('tasks')
                .insert([taskData])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (err) {
            console.error('🔥 Error adding task:', err);
            return this.addLocalTask(taskData);
        }
    }

    async updateTask(taskId, taskData) {
        if (!this.isConnected) return this.updateLocalTask(taskId, taskData);
        
        try {
            const { data, error } = await supabaseClient
                .from('tasks')
                .update(taskData)
                .eq('id', taskId)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (err) {
            console.error('🔥 Error updating task:', err);
            return this.updateLocalTask(taskId, taskData);
        }
    }

    // Rewards Management
    async getRewards() {
        if (!this.isConnected) return this.getLocalRewards();
        
        try {
            const { data, error } = await supabaseClient
                .from('rewards')
                .select('*')
                .eq('is_active', true)
                .order('id');
            
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('🔥 Error fetching rewards:', err);
            return this.getLocalRewards();
        }
    }

    async addReward(rewardData) {
        if (!this.isConnected) return this.addLocalReward(rewardData);
        
        try {
            const { data, error } = await supabaseClient
                .from('rewards')
                .insert([rewardData])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (err) {
            console.error('🔥 Error adding reward:', err);
            return this.addLocalReward(rewardData);
        }
    }

    // Task Completion
    async completeTask(taskId, userId, timeTaken, pointsEarned, onTime) {
        if (!this.isConnected) return this.completeLocalTask(taskId, userId, timeTaken, pointsEarned, onTime);
        
        try {
            const { data, error } = await supabaseClient
                .from('task_completions')
                .insert([{
                    task_id: taskId,
                    user_id: userId,
                    time_taken: timeTaken,
                    points_earned: pointsEarned,
                    on_time: onTime
                }])
                .select();
            
            if (error) throw error;
            
            // Update user points
            await this.updateUserPoints(userId, pointsEarned);
            
            return data[0];
        } catch (err) {
            console.error('🔥 Error completing task:', err);
            return this.completeLocalTask(taskId, userId, timeTaken, pointsEarned, onTime);
        }
    }

    async updateUserPoints(userId, pointsToAdd) {
        if (!this.isConnected) return this.updateLocalUserPoints(userId, pointsToAdd);
        
        try {
            // Get current points
            const { data: user, error: fetchError } = await supabaseClient
                .from('users')
                .select('points')
                .eq('id', userId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // Update points
            const { data, error } = await supabaseClient
                .from('users')
                .update({ points: (user.points || 0) + pointsToAdd })
                .eq('id', userId)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (err) {
            console.error('🔥 Error updating user points:', err);
            return this.updateLocalUserPoints(userId, pointsToAdd);
        }
    }

    // Image Upload
    async uploadUserAvatar(userId, file) {
        if (!this.isConnected) return this.uploadLocalAvatar(userId, file);
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabaseClient.storage
                .from('user-avatars')
                .upload(fileName, file);
            
            if (error) throw error;
            
            // Get public URL
            const { data: urlData } = supabaseClient.storage
                .from('user-avatars')
                .getPublicUrl(fileName);
            
            return urlData.publicUrl;
        } catch (err) {
            console.error('🔥 Error uploading avatar:', err);
            return this.uploadLocalAvatar(userId, file);
        }
    }

    // Local storage fallbacks
    getLocalUsers() {
        const data = localStorage.getItem('familyTaskData');
        return data ? JSON.parse(data).users : [];
    }

    addLocalUser(userData) {
        const data = JSON.parse(localStorage.getItem('familyTaskData') || '{}');
        const newId = Math.max(...(data.users || []).map(u => u.id), 0) + 1;
        const newUser = { ...userData, id: newId };
        data.users = [...(data.users || []), newUser];
        localStorage.setItem('familyTaskData', JSON.stringify(data));
        return newUser;
    }

    updateLocalUser(userId, userData) {
        const data = JSON.parse(localStorage.getItem('familyTaskData') || '{}');
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            data.users[userIndex] = { ...data.users[userIndex], ...userData };
            localStorage.setItem('familyTaskData', JSON.stringify(data));
            return data.users[userIndex];
        }
        return null;
    }

    getLocalTasks() {
        const data = localStorage.getItem('familyTaskData');
        return data ? JSON.parse(data).tasks || [] : [];
    }

    addLocalTask(taskData) {
        const data = JSON.parse(localStorage.getItem('familyTaskData') || '{}');
        const newId = Math.max(...(data.tasks || []).map(t => t.id), 0) + 1;
        const newTask = { ...taskData, id: newId };
        data.tasks = [...(data.tasks || []), newTask];
        localStorage.setItem('familyTaskData', JSON.stringify(data));
        return newTask;
    }

    updateLocalTask(taskId, taskData) {
        const data = JSON.parse(localStorage.getItem('familyTaskData') || '{}');
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...taskData };
            localStorage.setItem('familyTaskData', JSON.stringify(data));
            return data.tasks[taskIndex];
        }
        return null;
    }

    getLocalRewards() {
        const data = localStorage.getItem('familyTaskData');
        return data ? JSON.parse(data).rewards || [] : [];
    }

    addLocalReward(rewardData) {
        const data = JSON.parse(localStorage.getItem('familyTaskData') || '{}');
        const newId = Math.max(...(data.rewards || []).map(r => r.id), 0) + 1;
        const newReward = { ...rewardData, id: newId };
        data.rewards = [...(data.rewards || []), newReward];
        localStorage.setItem('familyTaskData', JSON.stringify(data));
        return newReward;
    }

    completeLocalTask(taskId, userId, timeTaken, pointsEarned, onTime) {
        // Implementation for local storage
        return { id: Date.now(), task_id: taskId, user_id: userId, points_earned: pointsEarned };
    }

    updateLocalUserPoints(userId, pointsToAdd) {
        const data = JSON.parse(localStorage.getItem('familyTaskData') || '{}');
        const user = data.users.find(u => u.id === userId);
        if (user) {
            user.points = (user.points || 0) + pointsToAdd;
            localStorage.setItem('familyTaskData', JSON.stringify(data));
            return user;
        }
        return null;
    }

    uploadLocalAvatar(userId, file) {
        // Convert file to base64 for local storage
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }
}

// Initialize global instance
window.supabaseManager = new SupabaseManager();
