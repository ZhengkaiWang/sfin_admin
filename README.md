# SFIN前端

这是SFIN (SuperFinancial) MCP服务器的前端项目，使用[Next.js](https://nextjs.org)构建。

## 功能特点

- 响应式设计，适配各种设备
- 用户友好的界面
- 令牌管理系统
- 管理员后台
- Supabase集成

## 开发环境设置

首先，运行开发服务器:

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 环境变量配置

在开发环境中，创建一个`.env.local`文件，包含以下变量:

```
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API配置
NEXT_PUBLIC_API_URL=https://sfin-mcp-server-production.up.railway.app

# 部署环境
NEXT_PUBLIC_ENVIRONMENT=development
```

## 部署到Vercel

### 自动部署

1. 在Vercel上创建一个新项目
2. 连接到GitHub仓库
3. 配置以下环境变量:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_ENVIRONMENT=production`
4. 点击部署

### 手动部署

1. 安装Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. 登录Vercel:
   ```bash
   vercel login
   ```

3. 部署项目:
   ```bash
   vercel
   ```

4. 按照提示操作，确保设置正确的环境变量

## 项目结构

```
frontend/
├── public/           # 静态资源
├── src/
│   ├── app/          # 页面组件
│   │   ├── admin/    # 管理员页面
│   │   ├── apply/    # 申请页面
│   │   ├── guide/    # 指南页面
│   │   ├── manage/   # 管理页面
│   │   └── page.tsx  # 首页
│   └── components/   # 可复用组件
├── .env.local        # 本地环境变量
├── next.config.ts    # Next.js配置
└── vercel.json       # Vercel配置
```

## 技术栈

- [Next.js](https://nextjs.org/) - React框架
- [React](https://reactjs.org/) - UI库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Supabase](https://supabase.io/) - 后端服务
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

## 了解更多

- [Next.js文档](https://nextjs.org/docs) - 了解Next.js特性和API
- [Supabase文档](https://supabase.io/docs) - 了解Supabase
- [Vercel部署文档](https://nextjs.org/docs/app/building-your-application/deploying) - 了解更多部署细节
