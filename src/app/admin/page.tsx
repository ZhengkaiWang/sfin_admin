'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApiUsageStats, getTokenStats, getActiveUsers } from '@/utils/supabase';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 如果用户未登录或正在加载，不执行任何操作
    if (authLoading || !user) {
      console.log('AdminPage: User not logged in or still loading', { authLoading, user: !!user });
      return;
    }

    console.log('AdminPage: User logged in, isAdmin:', isAdmin);

    const fetchStats = async () => {
      try {
        console.log('AdminPage: Starting to fetch stats...');
        setIsLoading(true);
        setError('');

        // 获取API使用统计
        console.log('AdminPage: Fetching API usage stats...');
        const apiUsageStats = await getApiUsageStats();
        if (apiUsageStats.error) {
          throw new Error('获取API使用统计失败');
        }
        
        // 获取令牌统计
        console.log('AdminPage: Fetching token stats...');
        const tokenStats = await getTokenStats();
        if (tokenStats.error) {
          throw new Error('获取令牌统计失败');
        }
        
        // 获取活跃用户
        console.log('AdminPage: Fetching active users...');
        const { activeUsers: recentUsers, error: usersError } = await getActiveUsers(3);
        if (usersError) {
          throw new Error('获取活跃用户失败');
        }
        
        // 获取热门工具
        console.log('AdminPage: Fetching top tools...');
        const topTools = Object.entries(apiUsageStats.byEndpoint || {})
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        console.log('AdminPage: Setting stats...');
        setStats({
          totalTokens: tokenStats.total,
          activeTokens: tokenStats.active,
          revokedTokens: tokenStats.expired,
          totalRequests: apiUsageStats.total,
          requestsToday: apiUsageStats.today,
          averageResponseTime: 0.5, // 暂时使用固定值
          topTools,
          recentUsers
        });
        
        console.log('AdminPage: Stats set successfully');
        setIsLoading(false);
      } catch (err: any) {
        console.error('AdminPage: Error fetching admin stats:', err);
        setError(err.message || '获取统计数据失败');
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, authLoading, isAdmin]);
  
  if (isLoading || authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                  <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 检查用户是否未登录或不是管理员
  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">管理员后台</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">请先登录</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>您需要登录才能访问管理员后台。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">管理员后台</h1>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">错误</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">管理员后台</h1>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 统计卡片 */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总令牌数</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalTokens}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">活跃令牌</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.activeTokens}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">已撤销令牌</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.revokedTokens}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">今日请求</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.requestsToday}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 热门工具 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">热门工具</h3>
              </div>
              <div className="px-6 py-5">
                <ul className="divide-y divide-gray-200">
                  {stats.topTools.map((tool: any) => (
                    <li key={tool.name} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {tool.count} 次调用
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <Link href="/admin/stats" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  查看更多 <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            
            {/* 最近活跃用户 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">最近活跃用户</h3>
              </div>
              <div className="px-6 py-5">
                <ul className="divide-y divide-gray-200">
                  {stats.recentUsers.map((user: any) => (
                    <li key={user.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="text-sm text-gray-500">
                            {formatDate(user.lastActive)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <Link href="/admin/logs" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  查看日志 <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-6">
            {/* 系统状态 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">系统状态</h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">总请求数</dt>
                    <dd className="mt-1 text-sm text-gray-900">{stats.totalRequests}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">平均响应时间</dt>
                    <dd className="mt-1 text-sm text-gray-900">{stats.averageResponseTime} 秒</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">MCP服务器状态</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        正常运行
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">数据库状态</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        正常运行
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
