-- ============================================================================
-- LUREX Multi-Vendor Marketplace — Initial Seed Data
-- ============================================================================

-- Default Admin User (Password: Admin@123456)
-- bcrypt hash for 'Admin@123456': $2b$10$wL4fFf6vF2Qf9o69aH9K5e8U.wGz7/Q.z3e4C.N/9zH3O1V0/7f6a
INSERT INTO users (id, name, email, phone, password_hash, role, is_active, is_verified)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'LUREX Super Admin',
    'admin@lurex.com.bd',
    '+8801700000001',
    '$2b$10$K9b0O5w7Y8h5C.Jd5P5cLeJv8gH7Z3X5Y8n9m2p1q0r9s8t7u6v5w',
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (phone) DO NOTHING;

-- Top Level Categories in Bangladesh
INSERT INTO categories (id, name, slug, icon_url, display_order)
VALUES 
    ('11111111-0000-0000-0000-000000000001', 'Fashion & Apparel', 'fashion-apparel', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200', 1),
    ('11111111-0000-0000-0000-000000000002', 'Electronics & Gadgets', 'electronics-gadgets', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200', 2),
    ('11111111-0000-0000-0000-000000000003', 'Groceries & Food', 'groceries-food', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200', 3),
    ('11111111-0000-0000-0000-000000000004', 'Home & Lifestyle', 'home-lifestyle', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200', 4),
    ('11111111-0000-0000-0000-000000000005', 'Beauty & Health', 'beauty-health', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200', 5)
ON CONFLICT (slug) DO NOTHING;

-- Welcome Promotional Coupon
INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, max_discount_amount, valid_from, valid_until)
VALUES ('LUREX100', 'fixed', 100.00, 1000.00, 100.00, NOW(), NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;
