"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 如果用户已登录，重定向到管理页面
  useEffect(() => {
    if (user && !loading) {
      router.push('/manage');
    }
  }, [user, loading, router]);

  // 如果正在加载或用户已登录，显示加载状态
  if (loading || user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">登录到SFIN管理后台</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">关于SFIN管理后台</h2>
              <p className="text-gray-700 mb-4">
                SFIN管理后台提供以下功能：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>管理API令牌</li>
                <li>查看API使用统计</li>
                <li>查看访问日志</li>
                <li>创建和管理邀请码</li>
              </ul>
              <p className="text-gray-700">
                如果您需要申请API令牌，请前往<a href="/apply" className="text-blue-600 hover:underline">申请页面</a>。
              </p>
            </div>
          </div>
          <div className="flex-1">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
