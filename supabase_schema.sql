-- ============================================================================
-- BLOXYLUCY DATABASE SCHEMA & SEED SCRIPT
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/nyujlpufeslnxejestai/sql
-- ============================================================================

-- 1. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    store_name TEXT DEFAULT 'BloxyLucy Top Up Robux',
    whatsapp_number TEXT DEFAULT '6285828378025',
    qris_image_path TEXT DEFAULT '/images/qris.webp',
    logo_image_path TEXT DEFAULT '/images/logo.jpeg',
    banner_image_path TEXT DEFAULT '/images/pricelist.jpeg',
    promo_active BOOLEAN DEFAULT true,
    promo_tag TEXT DEFAULT 'PROMO SPESIAL BULAN INI',
    promo_badge TEXT DEFAULT 'LIMITED STOCK',
    promo_title TEXT DEFAULT 'ROBUX BULAN INI',
    promo_subtitle TEXT DEFAULT 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!',
    promo_robux_amount INT DEFAULT 2200,
    promo_original_label TEXT DEFAULT '2.000 Robux',
    promo_discount_price INT DEFAULT 45000,
    promo_end_date TIMESTAMP WITH TIME ZONE DEFAULT '2026-09-30T23:59:59.000Z',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on store_settings
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_active BOOLEAN DEFAULT true;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_tag TEXT DEFAULT 'PROMO SPESIAL BULAN INI';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_badge TEXT DEFAULT 'LIMITED STOCK';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_title TEXT DEFAULT 'ROBUX BULAN INI';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_subtitle TEXT DEFAULT 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_robux_amount INT DEFAULT 2200;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_original_label TEXT DEFAULT '2.000 Robux';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_discount_price INT DEFAULT 45000;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS promo_end_date TIMESTAMP WITH TIME ZONE DEFAULT '2026-09-30T23:59:59.000Z';


-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    robux INT NOT NULL,
    price INT NOT NULL,
    original_price INT,
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    is_best_value BOOLEAN DEFAULT false,
    is_promo BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'Robux',
    image_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price INT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_value BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Robux';


-- 3. PROFILES / CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    roblox_username TEXT NOT NULL,
    roblox_user_id TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'member',
    is_blacklisted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blacklisted BOOLEAN DEFAULT false;


-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    order_code TEXT UNIQUE NOT NULL,
    product_id BIGINT,
    user_id TEXT,
    roblox_username TEXT NOT NULL,
    roblox_user_id TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    robux INT NOT NULL,
    price INT NOT NULL,
    activation_fee INT DEFAULT 0,
    total_payment INT NOT NULL,
    payment_method TEXT DEFAULT 'Website',
    payment_status TEXT DEFAULT 'pending',
    payment_proof_path TEXT,
    order_status TEXT DEFAULT 'pending',
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS activation_fee INT DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_payment INT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;


-- 5. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id BIGSERIAL PRIMARY KEY,
    order_code TEXT,
    username TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    robux_package TEXT,
    comment TEXT NOT NULL,
    time_ago TEXT,
    proof_image TEXT,
    proof_amount TEXT,
    has_proof BOOLEAN DEFAULT false,
    admin_reply JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS order_code TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS proof_image TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS proof_amount TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS has_proof BOOLEAN DEFAULT false;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS admin_reply JSONB;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;


-- ============================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR DIRECT ACCESS
-- ============================================================================
ALTER TABLE public.store_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;


-- ============================================================================
-- SEED INITIAL DATA (REAL & READY TO USE)
-- ============================================================================

-- 1. Seed Store Settings
INSERT INTO public.store_settings (
    id, store_name, whatsapp_number, qris_image_path, logo_image_path, banner_image_path,
    promo_active, promo_tag, promo_badge, promo_title, promo_subtitle,
    promo_robux_amount, promo_original_label, promo_discount_price, promo_end_date
) VALUES (
    1,
    'BloxyLucy Top Up Robux',
    '6285828378025',
    '/images/qris.webp',
    '/images/logo.jpeg',
    '/images/pricelist.jpeg',
    true,
    'PROMO SPESIAL BULAN INI',
    'LIMITED STOCK',
    'ROBUX BULAN INI',
    'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!',
    2200,
    '2.000 Robux',
    45000,
    '2026-09-30T23:59:59.000Z'
) ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    whatsapp_number = EXCLUDED.whatsapp_number,
    qris_image_path = EXCLUDED.qris_image_path,
    logo_image_path = EXCLUDED.logo_image_path,
    promo_active = EXCLUDED.promo_active,
    promo_tag = EXCLUDED.promo_tag,
    promo_badge = EXCLUDED.promo_badge,
    promo_title = EXCLUDED.promo_title,
    promo_subtitle = EXCLUDED.promo_subtitle,
    promo_robux_amount = EXCLUDED.promo_robux_amount,
    promo_original_label = EXCLUDED.promo_original_label,
    promo_discount_price = EXCLUDED.promo_discount_price,
    promo_end_date = EXCLUDED.promo_end_date,
    updated_at = NOW();

-- 2. Seed Products Catalog
DELETE FROM public.products;
INSERT INTO public.products (id, name, robux, price, original_price, is_active, is_popular, is_best_value, is_promo, category) VALUES
(1, 'Paket Hemat', 400, 9000, 12000, true, false, false, false, 'Robux'),
(2, 'Paket Populer', 1000, 22000, 25000, true, true, false, false, 'Robux'),
(3, 'Paket Spesial Banner Promo', 2200, 45000, 55000, true, true, false, true, 'Promo'),
(4, 'Paket Sultan', 5000, 97000, 110000, true, false, true, false, 'Robux'),
(5, 'Paket Mega Sultan', 10000, 190000, 220000, true, false, true, false, 'Robux'),
(6, 'Paket Ultimate King', 30500, 500000, 600000, true, false, true, false, 'Robux');

-- 3. Seed Profiles / Customers
DELETE FROM public.profiles;
INSERT INTO public.profiles (id, roblox_username, roblox_user_id, email, phone, role, is_blacklisted) VALUES
('c-1', 'BloxyGamer99', '1234567890', 'bloxygamer@gmail.com', '081234567890', 'member', false),
('c-2', 'KawaiiQueen_RBX', '9876543210', 'kawaiiqueen@gmail.com', '081987654321', 'member', false),
('c-3', 'SpamUserFake99', '000111222', 'fakepayment@mail.com', '089999999999', 'member', true);

-- 4. Seed Orders
DELETE FROM public.orders;
INSERT INTO public.orders (
    id, order_code, roblox_username, roblox_user_id, customer_email, customer_phone,
    robux, price, activation_fee, total_payment, payment_method, payment_status,
    payment_proof_path, order_status, customer_notes, admin_notes, created_at
) VALUES
(1, 'BLX25051801', 'BloxyGamer99', '1234567890', 'bloxygamer@gmail.com', '081234567890', 2200, 45000, 10000, 55000, 'Website', 'paid', '/images/qris.webp', 'completed', 'Tolong proses kilat min, mau gacha', 'Sudah ditransfer ke Gamepass akun target.', NOW() - INTERVAL '2 hours'),
(2, 'BLX25051802', 'KawaiiQueen_RBX', '9876543210', 'kawaiiqueen@gmail.com', '087812345678', 5000, 97000, 0, 97000, 'WhatsApp', 'paid', '/images/qris.webp', 'processing', 'Server VIP Blox Fruits', 'Sedang pending roblox 5 hari.', NOW() - INTERVAL '1 hours'),
(3, 'BLX25051803', 'SuperNoobPro', '1122334455', 'supernoob@gmail.com', '085712345678', 1000, 22000, 0, 22000, 'Website', 'pending', null, 'pending', 'Paket hemat', '', NOW() - INTERVAL '30 minutes'),
(4, 'BLX25051804', 'MegaSultan_ID', '5544332211', 'megasultan@gmail.com', '081399887766', 10000, 190000, 10000, 200000, 'WhatsApp', 'paid', '/images/qris.webp', 'awaiting_activation', 'Butuh login aktivasi gamepass', 'Admin perlu request OTP ke pelanggan.', NOW() - INTERVAL '15 minutes'),
(5, 'BLX25051805', 'ShadowNinja7', '7788990011', 'shadowninja@gmail.com', '083811223344', 3200, 60000, 0, 60000, 'WhatsApp', 'failed', null, 'cancelled', 'Salah pilih paket nominal', 'Customer membatalkan pesanan.', NOW() - INTERVAL '5 hours');

-- 5. Seed Testimonials
DELETE FROM public.testimonials;
INSERT INTO public.testimonials (
    id, order_code, username, rating, robux_package, comment, time_ago,
    proof_amount, has_proof, admin_reply, is_active, created_at
) VALUES
(1, 'BLX25051801', 'Tengkurap420', 5, '10.500 Robux', '200k dapet masuk cmn 7 mnit uyyyyy, seller ramah banget mantul pol! Next order lagi disini langganan.', '10 menit yang lalu', '11.4K', true, '{"adminName": "Admin BloxyLucy Official", "message": "Makasih banyak kak sudah order di BloxyLucy! Ditunggu orderan sultan berikutnya yaa 💖✨"}', true, NOW() - INTERVAL '10 minutes'),
(2, 'BLX25051802', 'Rizky_RBXGamer', 5, '5.000 Robux', 'Awalnya ragu karena baru pertama kali beli, eh ternyata beneran masuk dan aman 100%. Recommended banget buat yang mau top up robux!', '1 jam yang lalu', '5.2K', true, null, true, NOW() - INTERVAL '1 hours'),
(3, 'BLX25051804', 'PutriBlox_Cute', 5, '2.200 Robux', 'Adminnya fast respon dan sabar jelasin caranya. Robux langsung landing tanpa nunggu lama-lama. Makasih min!', '3 jam yang lalu', '2.3K', true, '{"adminName": "Admin BloxyLucy Official", "message": "Sama-sama kak Putri! Selamat bermain Roblox yaa 🌸"}', true, NOW() - INTERVAL '3 hours');
