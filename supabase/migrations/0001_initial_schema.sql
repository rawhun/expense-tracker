-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    merchant TEXT,
    category TEXT,
    subcategory TEXT,
    payment_method TEXT,
    notes TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    confidence DECIMAL(3,2),
    is_recurring BOOLEAN DEFAULT FALSE,
    is_impulse BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insights Table
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    -- If using pgvector: embedding vector(1536)
    importance DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read and update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Expenses: Users can perform all operations on their own expenses
CREATE POLICY "Users can manage their own expenses" 
    ON public.expenses FOR ALL 
    USING (auth.uid() = user_id);

-- Goals: Users can perform all operations on their own goals
CREATE POLICY "Users can manage their own goals" 
    ON public.goals FOR ALL 
    USING (auth.uid() = user_id);

-- Insights: Users can manage their own insights
CREATE POLICY "Users can manage their own insights" 
    ON public.insights FOR ALL 
    USING (auth.uid() = user_id);

-- Memories: Users can manage their own memories
CREATE POLICY "Users can manage their own memories" 
    ON public.memories FOR ALL 
    USING (auth.uid() = user_id);
