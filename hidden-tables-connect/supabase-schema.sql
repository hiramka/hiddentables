-- ============================================================
-- FINAL RESET - Drop everything and start clean
-- ============================================================

-- Drop all policies first
DROP POLICY IF EXISTS "Public restaurants are viewable by everyone" ON restaurants;
DROP POLICY IF EXISTS "Public menu items are viewable by everyone" ON menu_items;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own chat messages and support messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Support can view all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Support can insert support messages" ON chat_messages;
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can insert" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can update" ON restaurants;
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- Drop trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all tables
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.restaurants CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================
-- RESTAURANTS TABLE
-- ============================================================
CREATE TABLE public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    location TEXT NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    delivery_time TEXT,
    minimum_order INTEGER DEFAULT 500,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- MENU ITEMS TABLE
-- price stored in CENTS (e.g. 120000 = 1200 KES)
-- ============================================================
CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    popular BOOLEAN DEFAULT FALSE,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ORDERS TABLE
-- user_id references auth.users directly (no public.users needed)
-- total_amount and price stored in CENTS
-- ============================================================
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    total_amount INTEGER NOT NULL DEFAULT 0,
    delivery_fee INTEGER DEFAULT 15000,
    service_fee INTEGER DEFAULT 5000,
    delivery_address TEXT,
    phone_number TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS TABLE
-- price stored in CENTS
-- name and restaurant_name stored as snapshots
-- ============================================================
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    name TEXT,
    restaurant_name TEXT,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- USER PROFILES TABLE
-- ============================================================
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CHAT MESSAGES TABLE
-- ============================================================
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Restaurants
CREATE POLICY "Public restaurants are viewable by everyone" ON public.restaurants
    FOR SELECT USING (true);

-- Menu items
CREATE POLICY "Public menu items are viewable by everyone" ON public.menu_items
    FOR SELECT USING (true);

-- Orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Order items
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- User profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users
CREATE POLICY "Users can view their own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own record" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Chat messages
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id OR is_support = true);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_support = false);

CREATE POLICY "Support can insert support messages" ON public.chat_messages
    FOR INSERT WITH CHECK (is_support = true);

-- ============================================================
-- SEED DATA
-- price in cents: 1200 KES = 120000 cents
-- ============================================================
INSERT INTO public.restaurants (name, cuisine, location, rating, reviews, delivery_time, minimum_order, description)
VALUES
    ('Mama Jane''s Kitchen', 'Traditional Swahili', 'Kilimani, Nairobi', 4.8, 234, '25-35 min', 500, 'Authentic Swahili cuisine passed down through generations.'),
    ('Kafe Central', 'Continental', 'Westlands, Nairobi', 4.5, 189, '20-30 min', 300, 'Modern European cuisine with a Kenyan twist.'),
    ('The Alley', 'Italian', 'Karen, Nairobi', 4.7, 156, '30-40 min', 600, 'Authentic Italian dishes made with fresh, local ingredients.');

INSERT INTO public.menu_items (restaurant_id, name, description, price, category, popular)
VALUES
    ((SELECT id FROM public.restaurants WHERE name = 'Mama Jane''s Kitchen'), 'Nyama Choma Platter', 'Grilled meat with kachumbari', 120000, 'popular', true),
    ((SELECT id FROM public.restaurants WHERE name = 'Mama Jane''s Kitchen'), 'Samosa (2 pcs)', 'Beef or vegetable', 15000, 'popular', true),
    ((SELECT id FROM public.restaurants WHERE name = 'Mama Jane''s Kitchen'), 'Pilau', 'Spiced rice with meat', 45000, 'mains', false),
    ((SELECT id FROM public.restaurants WHERE name = 'Kafe Central'), 'Cappuccino', 'Freshly brewed coffee', 25000, 'drinks', true),
    ((SELECT id FROM public.restaurants WHERE name = 'Kafe Central'), 'Club Sandwich', 'Triple decker with fries', 35000, 'mains', false),
    ((SELECT id FROM public.restaurants WHERE name = 'The Alley'), 'Pasta Carbonara', 'Creamy pasta with bacon', 40000, 'mains', true);

-- Verify
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT id, name, price FROM public.menu_items ORDER BY name;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;