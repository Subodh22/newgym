-- Fitness Tracking App Database Schema
-- Run this in your Supabase SQL Editor

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT
);

-- Create mesocycles table
CREATE TABLE mesocycles (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  number_of_weeks INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT FALSE
);

-- Create weeks table
CREATE TABLE weeks (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mesocycle_id BIGINT REFERENCES mesocycles(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE
);

-- Create workouts table (days)
CREATE TABLE workouts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  week_id BIGINT REFERENCES weeks(id) ON DELETE CASCADE NOT NULL,
  day_name TEXT NOT NULL,
  workout_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Create exercises table
CREATE TABLE exercises (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workout_id BIGINT REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,
  notes TEXT
);

-- Create sets table
CREATE TABLE sets (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exercise_id BIGINT REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(5,2),
  reps INTEGER,
  duration INTEGER, -- in seconds
  distance DECIMAL(8,2), -- in meters/km
  rest_time INTEGER, -- in seconds
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Mesocycles policies
CREATE POLICY "Users can view own mesocycles" ON mesocycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mesocycles" ON mesocycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mesocycles" ON mesocycles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mesocycles" ON mesocycles FOR DELETE USING (auth.uid() = user_id);

-- Weeks policies
CREATE POLICY "Users can view own weeks" ON weeks FOR SELECT USING (
  EXISTS (SELECT 1 FROM mesocycles WHERE mesocycles.id = weeks.mesocycle_id AND mesocycles.user_id = auth.uid())
);
CREATE POLICY "Users can insert own weeks" ON weeks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM mesocycles WHERE mesocycles.id = weeks.mesocycle_id AND mesocycles.user_id = auth.uid())
);
CREATE POLICY "Users can update own weeks" ON weeks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM mesocycles WHERE mesocycles.id = weeks.mesocycle_id AND mesocycles.user_id = auth.uid())
);
CREATE POLICY "Users can delete own weeks" ON weeks FOR DELETE USING (
  EXISTS (SELECT 1 FROM mesocycles WHERE mesocycles.id = weeks.mesocycle_id AND mesocycles.user_id = auth.uid())
);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM weeks 
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE weeks.id = workouts.week_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM weeks 
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE weeks.id = workouts.week_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM weeks 
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE weeks.id = workouts.week_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM weeks 
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE weeks.id = workouts.week_id AND mesocycles.user_id = auth.uid()
  )
);

-- Exercises policies
CREATE POLICY "Users can view own exercises" ON exercises FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM workouts 
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE workouts.id = exercises.workout_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own exercises" ON exercises FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM workouts 
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE workouts.id = exercises.workout_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own exercises" ON exercises FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM workouts 
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE workouts.id = exercises.workout_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own exercises" ON exercises FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM workouts 
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE workouts.id = exercises.workout_id AND mesocycles.user_id = auth.uid()
  )
);

-- Sets policies
CREATE POLICY "Users can view own sets" ON sets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exercises 
    JOIN workouts ON workouts.id = exercises.workout_id
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE exercises.id = sets.exercise_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own sets" ON sets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM exercises 
    JOIN workouts ON workouts.id = exercises.workout_id
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE exercises.id = sets.exercise_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own sets" ON sets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM exercises 
    JOIN workouts ON workouts.id = exercises.workout_id
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE exercises.id = sets.exercise_id AND mesocycles.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own sets" ON sets FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM exercises 
    JOIN workouts ON workouts.id = exercises.workout_id
    JOIN weeks ON weeks.id = workouts.week_id
    JOIN mesocycles ON mesocycles.id = weeks.mesocycle_id 
    WHERE exercises.id = sets.exercise_id AND mesocycles.user_id = auth.uid()
  )
);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_mesocycles_user_id ON mesocycles(user_id);
CREATE INDEX idx_weeks_mesocycle_id ON weeks(mesocycle_id);
CREATE INDEX idx_workouts_week_id ON workouts(week_id);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);
