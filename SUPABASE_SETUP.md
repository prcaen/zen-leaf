# Supabase Setup Guide

This guide will help you set up Supabase as the backend API for Zen Leaf.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note your project URL and anon/public key from Settings > API

## 2. Configure Environment Variables

Create a `.env` file in the root of your project (or use `app.json` extra config):

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** For Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## 2.1. Configure Authentication

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your redirect URLs:
   - For email confirmation: `zenleaf://auth/callback`
   - For password reset: `zenleaf://reset-password`
   - For development: 
     - `exp://localhost:8081/--/auth/callback` (if using Expo Go)
     - `exp://localhost:8081/--/reset-password` (if using Expo Go)
3. Enable Email authentication in Authentication > Providers > Email
4. Configure email templates if needed (Authentication > Email Templates)
5. Make sure "Confirm email" is enabled in Authentication > Providers > Email settings

## 3. Database Schema

Run the following SQL in your Supabase SQL Editor to create the necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location_name TEXT NOT NULL,
  unit_system TEXT NOT NULL CHECK (unit_system IN ('metric', 'imperial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plants table
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE SET NULL,
  image_url TEXT,
  watering_frequency_days INTEGER NOT NULL DEFAULT 7,
  last_watered_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  settings JSONB,
  care_info JSONB
);

-- Care Tasks table
CREATE TABLE IF NOT EXISTS care_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('water', 'fertilize', 'repot', 'prune', 'pest_check', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  frequency_days INTEGER NOT NULL,
  last_completed_date TIMESTAMPTZ,
  next_due_date TIMESTAMPTZ NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care History table
CREATE TABLE IF NOT EXISTS care_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('water', 'fertilize', 'repot', 'prune', 'pest_check', 'other')),
  title TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_room_id ON plants(room_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_user_id ON care_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_plant_id ON care_tasks(plant_id);
CREATE INDEX IF NOT EXISTS idx_care_history_user_id ON care_history(user_id);
CREATE INDEX IF NOT EXISTS idx_care_history_plant_id ON care_history(plant_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_next_due_date ON care_tasks(next_due_date);
CREATE INDEX IF NOT EXISTS idx_care_history_completed_at ON care_history(completed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see and modify their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Rooms: Users can only access their own rooms
CREATE POLICY "Users can view own rooms" ON rooms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rooms" ON rooms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rooms" ON rooms
  FOR DELETE USING (auth.uid() = user_id);

-- Plants: Users can only access their own plants
CREATE POLICY "Users can view own plants" ON plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants" ON plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants" ON plants
  FOR DELETE USING (auth.uid() = user_id);

-- Care Tasks: Users can only access their own tasks
CREATE POLICY "Users can view own care_tasks" ON care_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care_tasks" ON care_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care_tasks" ON care_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care_tasks" ON care_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Care History: Users can only access their own history
CREATE POLICY "Users can view own care_history" ON care_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care_history" ON care_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care_history" ON care_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care_history" ON care_history
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Update API Column Mappings

The API service (`src/lib/api.ts`) expects snake_case column names. If your database uses different naming, you'll need to update the column mappings in the API file.

## 5. Authentication (Optional)

If you want to add user authentication:

1. Enable authentication in Supabase Dashboard
2. Update the API calls to include user context
3. Add user_id columns to tables if you want multi-user support
4. Update RLS policies to restrict data by user_id

## 6. Testing

After setup, test the connection:

```typescript
import { supabase } from './src/lib/supabase';

// Test connection
const { data, error } = await supabase.from('rooms').select('count');
console.log('Supabase connection:', error ? 'Failed' : 'Success');
```

## 7. Migration from AsyncStorage

To migrate existing data from AsyncStorage to Supabase:

1. Export data from AsyncStorage
2. Use the API service to import data to Supabase
3. Update your context/provider to use the API service instead of storage

## Troubleshooting

- **Connection errors**: Verify your Supabase URL and anon key are correct
- **RLS errors**: Check your Row Level Security policies
- **Column errors**: Ensure column names match between TypeScript types and database schema
- **Date serialization**: The API handles Date serialization automatically

