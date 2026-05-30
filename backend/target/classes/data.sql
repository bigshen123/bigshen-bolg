-- 初始化示例数据
-- 注意：JPA使用ddl-auto=update，这里只插入示例数据

-- 示例用户数据（密码为 'password123' 经BCrypt加密）
-- 实际使用中会在应用启动时通过代码生成

-- 插入示例用户密码：123456
INSERT INTO users (username, email, password, avatar, theme_color, bio, article_count, follower_count, following_count, created_at, updated_at)
SELECT 'travel_bear', 'bear@blog.com', '$2a$10$EixZaYVK1fsbw1ZfbXeo0Oe8h7EkxzBJAgJhK1/JdUzGsGMLTq5Ga', '🐻', '#FF6B8B', '热爱露营的旅行熊，探索世界每个角落', 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'travel_bear');

INSERT INTO users (username, email, password, avatar, theme_color, bio, article_count, follower_count, following_count, created_at, updated_at)
SELECT 'bunny_travel', 'bunny@blog.com', '$2a$10$EixZaYVK1fsbw1ZfbXeo0Oe8h7EkxzBJAgJhK1/JdUzGsGMLTq5Ga', '🐰', '#4ECDC4', '蹦蹦跳跳闯天涯，用相机记录美好', 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'bunny_travel');

INSERT INTO users (username, email, password, avatar, theme_color, bio, article_count, follower_count, following_count, created_at, updated_at)
SELECT 'wander_cat', 'cat@blog.com', '$2a$10$EixZaYVK1fsbw1ZfbXeo0Oe8h7EkxzBJAgJhK1/JdUzGsGMLTq5Ga', '🐱', '#FFD166', '懒洋洋的城市漫游者，发现隐藏的美好', 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'wander_cat');
