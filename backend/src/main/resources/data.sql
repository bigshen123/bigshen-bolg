-- 数据初始化（账号数据由 DataInitializer 通过 PasswordEncoder 创建，确保密码哈希正确）
UPDATE users SET role = 'USER', status = 'ACTIVE' WHERE role IS NULL OR status IS NULL;
