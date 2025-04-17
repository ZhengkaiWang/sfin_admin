// 设置管理员账户脚本
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // 需要在.env.local中添加

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置。请确保在.env.local文件中设置了NEXT_PUBLIC_SUPABASE_URL和SUPABASE_SERVICE_KEY。');
  process.exit(1);
}

// 创建Supabase客户端（使用服务端密钥）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 管理员信息
const adminEmail = process.argv[2];
const adminPassword = process.argv[3];

if (!adminEmail || !adminPassword) {
  console.error('请提供管理员邮箱和密码。');
  console.error('用法: node scripts/setup-admin.js admin@example.com password123');
  process.exit(1);
}

async function setupAdmin() {
  try {
    console.log(`正在创建管理员账户: ${adminEmail}`);

    // 1. 创建用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // 自动确认邮箱
    });

    if (authError) {
      throw authError;
    }

    console.log('用户创建成功');

    // 2. 将用户添加到admins表
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .insert([
        { email: adminEmail }
      ])
      .select();

    if (adminError) {
      throw adminError;
    }

    console.log('管理员权限设置成功');
    console.log('管理员设置完成！');
    console.log(`邮箱: ${adminEmail}`);
    console.log(`密码: ${adminPassword}`);
    console.log('请使用这些凭据登录系统。');

  } catch (error) {
    console.error('设置管理员时出错:', error.message);
    process.exit(1);
  }
}

setupAdmin();
