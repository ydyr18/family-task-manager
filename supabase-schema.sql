-- Family Task Manager Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    birth_date DATE,
    role TEXT NOT NULL DEFAULT 'ילד',
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    is_performing_task BOOLEAN DEFAULT false,
    current_task_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    room TEXT NOT NULL,
    points INTEGER DEFAULT 10,
    duration INTEGER DEFAULT 15,
    difficulty TEXT DEFAULT 'קל',
    age_range TEXT DEFAULT '5-15',
    task_type TEXT DEFAULT 'personal',
    assigned_user_ids INTEGER[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cost INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS task_completions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    user_id INTEGER REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_taken INTEGER, -- in minutes
    points_earned INTEGER,
    on_time BOOLEAN DEFAULT true
);

-- Create reward_purchases table
CREATE TABLE IF NOT EXISTS reward_purchases (
    id SERIAL PRIMARY KEY,
    reward_id INTEGER REFERENCES rewards(id),
    user_id INTEGER REFERENCES users(id),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_spent INTEGER
);

-- Create weekly_stats table
CREATE TABLE IF NOT EXISTS weekly_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    week_start DATE,
    tasks_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('user-avatars', 'user-avatars', true);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, you can restrict later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on rewards" ON rewards FOR ALL USING (true);
CREATE POLICY "Allow all operations on task_completions" ON task_completions FOR ALL USING (true);
CREATE POLICY "Allow all operations on reward_purchases" ON reward_purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations on weekly_stats" ON weekly_stats FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tasks_room ON tasks(room);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_weekly_stats_user_week ON weekly_stats(user_id, week_start);

-- Insert default data
INSERT INTO users (name, birth_date, role, points) VALUES 
('אמא', '1987-09-30', 'הורה', 0),
('אבא', '1987-09-11', 'הורה', 0)
ON CONFLICT DO NOTHING;

-- Insert default tasks
INSERT INTO tasks (title, description, room, points, duration, difficulty, age_range, task_type) VALUES 
('לסדר את החדר', 'לסדר את החדר, להחזיר חפצים למקום, לכבס בגדים מלוכלכים', 'חדר ילדים', 15, 20, 'בינוני', '6-12', 'personal'),
('לנקות את המטבח', 'לשטוף כלים, לנקות השיש, לנגב את הרצפה', 'מטבח', 20, 25, 'בינוני', '8-15', 'shared'),
('לסדר את הסלון', 'לסדר את הכריות, לנגב אבק, לשאוב את הרצפה', 'סלון', 15, 15, 'קל', '5-12', 'shared'),
('לטפל בחיות מחמד', 'להאכיל, לנקות, לטייל עם הכלב', 'חצר', 10, 10, 'קל', '6-15', 'personal')
ON CONFLICT DO NOTHING;

-- Insert default rewards
INSERT INTO rewards (name, description, cost) VALUES 
('זמן מסך נוסף', '30 דקות נוספות של זמן מסך', 50),
('בחירת ארוחת ערב', 'לבחור מה נאכל הערב', 30),
('פעילות משפחתית', 'לבחור פעילות משפחתית לסוף השבוע', 100),
('דמי כיס', '10 ש"ח דמי כיס', 75)
ON CONFLICT DO NOTHING;
