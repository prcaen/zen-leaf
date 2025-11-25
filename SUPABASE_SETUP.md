# Supabase Setup Guide

This guide will help you set up your Supabase project for the Zen-Leaf app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: zen-leaf (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project" and wait for it to be ready (2-3 minutes)

## 2. Get Your API Keys

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" > "anon public")

3. Update your `app.json` file with these values:
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "YOUR_PROJECT_URL",
      "supabaseAnonKey": "YOUR_ANON_KEY",
      "supabaseStorageBucketPlants": "plants",
      "supabaseStorageBucketUsers": "users"
    }
  }
}
```

## 3. Database Schema Setup

**Important**: This app uses Supabase Auth for user authentication. User data (name and email) comes from `auth.users` (managed by Supabase Auth), while user preferences (location and unit system) are stored in the `user_settings` table.

Run the following SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query):

```sql
-- User Settings table
-- Note: User name and email are stored in auth.users (Supabase Auth)
-- This table only stores user preferences/settings (location, unit system)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL DEFAULT 'Paris',
  unit_system TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  humidity INTEGER, -- percentage
  is_indoor BOOLEAN, -- indoor or outdoor
  temperature INTEGER, -- in Celsius
  light_level TEXT CHECK (light_level IN ('sun', 'part sun', 'shade', 'dark')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plants table
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE SET NULL,
  image_url TEXT,
  watering_frequency_days INTEGER NOT NULL DEFAULT 7,
  last_watered_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  distance_from_window INTEGER, -- in centimeters (from light settings)
  pot_size INTEGER, -- Pot size in cm (diameter) (from pot settings)
  has_drainage BOOLEAN, -- (from pot settings)
  pot_material TEXT, -- e.g., "ceramic", "plastic", "terracotta" (from pot settings)
  soil TEXT, -- e.g., "all-purpose-potting-mix" (from pot settings)
  plant_size INTEGER, -- Plant height in cm (from plantType settings)
  variety TEXT, -- (from plantType settings)
  category TEXT, -- e.g., "succulent", "fern", "tropical" (from plantType settings)
  age INTEGER, -- Plant age in years (0 = less than a year, 50 = 50+ years) (from plantType settings)
  is_near_ac BOOLEAN, -- (from positionInRoom settings)
  is_near_heater BOOLEAN, -- (from positionInRoom settings)
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

-- Plant Catalog table (public catalog, not user-specific)
CREATE TABLE IF NOT EXISTS plant_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT DEFAULT '',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Advanced')),
  light_level TEXT NOT NULL CHECK (light_level IN ('sun', 'part_sun', 'shade', 'dark')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_room_id ON plants(room_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_user_id ON care_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_plant_id ON care_tasks(plant_id);
CREATE INDEX IF NOT EXISTS idx_care_history_user_id ON care_history(user_id);
CREATE INDEX IF NOT EXISTS idx_care_history_plant_id ON care_history(plant_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_next_due_date ON care_tasks(next_due_date);
CREATE INDEX IF NOT EXISTS idx_care_history_completed_at ON care_history(completed_at);
CREATE INDEX IF NOT EXISTS idx_plant_catalog_name ON plant_catalog(name);

-- Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_history ENABLE ROW LEVEL SECURITY;
-- Note: plant_catalog is public and does not need RLS (all users can read it)

-- RLS Policies
-- User Settings: Users can only see and modify their own settings
-- Note: User name and email are managed through Supabase Auth (auth.users)
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- Care Tasks: Users can only access their own care tasks
CREATE POLICY "Users can view own care_tasks" ON care_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care_tasks" ON care_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care_tasks" ON care_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care_tasks" ON care_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Care History: Users can only access their own care history
CREATE POLICY "Users can view own care_history" ON care_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care_history" ON care_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care_history" ON care_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care_history" ON care_history
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Populate Plant Catalog

After creating the `plant_catalog` table, run this SQL to populate it with the initial plant data:

```sql
-- Insert plant catalog data
INSERT INTO plant_catalog (id, name, aliases, difficulty, light_level, image_url) VALUES
('monstera', 'Monstera', 'Swiss Cheese Plant, Fruit Salad Plant, Hurricane plant', 'Easy', 'part_sun', NULL),
('aloe-vera', 'Aloe Vera', 'Medicinal Aloe, Barbados Aloe, Bitter Aloe', 'Easy', 'sun', NULL),
('moth-orchid', 'Moth orchid', '', 'Easy', 'shade', NULL),
('chinese-money-sugar', 'Chinese money plant ''Sugar''', '', 'Easy', 'part_sun', NULL),
('golden-pothos', 'Golden Pothos', '', 'Easy', 'shade', NULL),
('spider-plant', 'Spider Plant', '', 'Easy', 'part_sun', NULL),
('spineless-yucca', 'Spineless Yucca', '', 'Easy', 'sun', NULL),
('dragon-tree', 'Dragon Tree', '', 'Easy', 'part_sun', NULL),
('parlor-palm', 'Parlor Palm', '', 'Moderate', 'shade', NULL),
('jade-plant', 'Jade Plant', '', 'Easy', 'sun', NULL),
('ginseng-ficus', 'Ginseng Ficus ''Ginseng''', '', 'Advanced', 'part_sun', NULL),
('zz-plant', 'Zz Plant', '', 'Easy', 'shade', NULL),
('peace-lily', 'Peace Lily', '', 'Moderate', 'shade', NULL),
('money-tree', 'Money Tree', '', 'Advanced', 'part_sun', NULL),
('avocado', 'Avocado', '', 'Advanced', 'sun', NULL),
('basil', 'Basil', '', 'Moderate', 'sun', 'https://hlcieyhydqncunaxffgt.supabase.co/storage/v1/object/public/main/basil.jpeg'),
('silver-inch-plant', 'Silver Inch Plant', '', 'Moderate', 'part_sun', NULL),
('monkey-mask', 'Monkey Mask', '', 'Advanced', 'part_sun', NULL),
('areca-palm', 'Areca Palm', '', 'Easy', 'part_sun', NULL),
('mother-in-law-tongue', 'Mother-in-law''s tongue ''Futura Superba''', '', 'Easy', 'part_sun', NULL),
('flamingo-lily', 'Flamingo Lily', '', 'Moderate', 'shade', NULL),
('peacock-plant', 'Peacock Plant', '', 'Moderate', 'shade', NULL),
('echeveria', 'Echeveria - mixed varieties', '', 'Easy', 'sun', NULL),
('prayer-plant', 'Prayer Plant', '', 'Moderate', 'shade', NULL),
('moth-orchid-white', 'Moth Orchid ''Younghome White Apple''', '', 'Moderate', 'shade', NULL),
('chinese-money', 'Chinese Money Plant', '', 'Moderate', 'part_sun', NULL),
('polka-dot', 'Polka Dot Plant', '', 'Moderate', 'part_sun', NULL),
('polka-dot-pink', 'Polka Dot Plant ''Pink Splash''', '', 'Moderate', 'part_sun', NULL),
('weeping-fig', 'Weeping Fig', '', 'Moderate', 'part_sun', NULL),
('haworthia', 'Haworthia - Mixed Varieties', '', 'Moderate', 'sun', NULL)
ON CONFLICT (id) DO NOTHING;
```

## 5. Storage Bucket Setup

To enable image uploads for plants, you need to create storage buckets and configure Row Level Security policies.

### 5.1. Create Storage Buckets

1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Create two buckets:
   - **Name**: `plants` (for plant images)
   - **Name**: `users` (for user profile images)
4. Make both buckets **Public** (so images can be accessed via public URLs)
5. Click "Create bucket" for each

### 5.2. Configure Storage Policies

Run the following SQL in your Supabase SQL Editor to set up RLS policies for the storage buckets:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload files to their own folder in plants bucket
CREATE POLICY "Users can upload own plant images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'plants' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own plant images
CREATE POLICY "Users can view own plant images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'plants' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own plant images
CREATE POLICY "Users can update own plant images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'plants' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own plant images
CREATE POLICY "Users can delete own plant images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'plants' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can upload files to their own folder in users bucket
CREATE POLICY "Users can upload own user images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'users' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own user images
CREATE POLICY "Users can view own user images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'users' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own user images
CREATE POLICY "Users can update own user images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'users' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own user images
CREATE POLICY "Users can delete own user images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'users' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 6. Testing Your Setup

1. **Test Authentication**: Try signing up and logging in through your app
2. **Test Database**: Create a room and a plant to verify data is being saved
3. **Test Storage**: Upload a plant image to verify storage is working
4. **Test Plant Catalog**: Open the plant creation screen to verify the catalog loads

## 7. Troubleshooting

### Common Issues

1. **"new row violates row-level security policy"**
   - Make sure you've run all the RLS policies from section 3
   - Verify the user is authenticated before making requests

2. **"Could not find the 'user_id' column" or "relation 'user_settings' does not exist"**
   - Make sure you've run the complete schema setup from section 3
   - Verify the `user_settings` table was created (not the old `users` table)
   - Refresh your Supabase schema cache (Settings > API > Refresh schema)
   - Note: User name and email come from Supabase Auth (`auth.users`), not from a database table

3. **Storage upload fails**
   - Verify the storage bucket exists and is public
   - Check that the RLS policies for storage are set up correctly
   - Ensure the bucket name matches what's in your `app.json` config

4. **Plant catalog not loading**
   - Verify the `plant_catalog` table exists
   - Check that you've populated it with data (section 4)
   - Ensure the table doesn't have RLS enabled (it should be public)

## 8. Updating Plant Catalog Data

To update plant catalog data on the server:

1. Go to Supabase Dashboard > Table Editor > `plant_catalog`
2. You can add, edit, or delete plant entries directly
3. Changes will be reflected in the app immediately (no app update needed)

Alternatively, you can use SQL to update:

```sql
-- Update an existing plant
UPDATE plant_catalog 
SET name = 'New Name', aliases = 'New Aliases', difficulty = 'Easy', light_level = 'sun'
WHERE id = 'plant-id';

-- Add a new plant
INSERT INTO plant_catalog (id, name, aliases, difficulty, light_level, image_url)
VALUES ('new-plant-id', 'New Plant', 'Aliases', 'Easy', 'sun', NULL);

-- Delete a plant
DELETE FROM plant_catalog WHERE id = 'plant-id';
```
