'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  getDailyRequests, 
  getToolUsage, 
  getActiveUsers, 
  getResponseTimeDistribution, 
  getErrorRates 
} from '@/utils/supabase';

export default function StatsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'

  // 检查用户是否未登录或不是管理员
  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">统计数据</h1>
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

  useEffect(() => {
    // 如果用户未登录或正在加载，不执行任何操作
    if (authLoading || !user) return;
    
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // 根据时间范围确定天数
        let days = 7;
        switch (timeRange) {
          case 'day':
            days = 1;
            break;
          case 'week':
            days = 7;
            break;
          case 'month':
            days = 30;
            break;
          case 'year':
            days = 365;
            break;
        }
        
        // 获取每日请求数
        const dailyRequests = await getDailyRequests(days);
        
        // 获取工具使用情况
        const { toolUsage, error: toolUsageError } = await getToolUsage(5);
        
        // 获取响应时间分布
        const { distribution: responseTimeDistribution, error: responseTimeError } = await getResponseTimeDistribution();
        
        // 获取错误率
        const errorRates = await getErrorRates(days);
        
        // 获取活跃用户
        const { activeUsers: topUsers, error: topUsersError } = await getActiveUsers(5);
        
        if (toolUsageError || responseTimeError || topUsersError) {
          throw new Error('获取统计数据失败');
        }
        
        setStats({
          dailyRequests,
          toolUsage,
          topUsers,
          responseTimeDistribution,
          errorRates
        });
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('获取统计数据失败:', err);
        setError(err.message || '获取统计数据失败');
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeRange, user, authLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">统计数据</h1>
            <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              返回管理后台
            </Link>
          </div>
          
          {error && (
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
          )}
          
          {/* 时间范围选择器 */}
          <div className="mb-6">
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-0.5">
              <button
                onClick={() => setTimeRange('day')}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  timeRange === 'day'
                    ? 'bg-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                今日
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  timeRange === 'week'
                    ? 'bg-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                本周
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  timeRange === 'month'
                    ? 'bg-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                本月
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  timeRange === 'year'
                    ? 'bg-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                本年
              </button>
            </div>
          </div>
          
          {/* 每日请求数 */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">每日请求数</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow">
              <div className="px-6 py-5">
                <div className="h-64 flex items-end space-x-2">
                  {stats.dailyRequests.map((day: any) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-indigo-500 rounded-t"
                        style={{ 
                          height: `${(day.count / Math.max(...stats.dailyRequests.map((d: any) => d.count)) || 1) * 100}%` 
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{formatDate(day.date)}</div>
                      <div className="text-xs font-medium">{day.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 工具使用情况 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">工具使用情况</h2>
              <div className="bg-white border border-gray-200 rounded-lg shadow">
                <div className="px-6 py-5">
                  <ul className="divide-y divide-gray-200">
                    {stats.toolUsage.map((tool: any) => (
                      <li key={tool.name} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-sm text-gray-500">
                              {tool.count} 次 ({tool.percentage}%)
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${tool.percentage}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* 响应时间分布 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">响应时间分布</h2>
              <div className="bg-white border border-gray-200 rounded-lg shadow">
                <div className="px-6 py-5">
                  <ul className="divide-y divide-gray-200">
                    {stats.responseTimeDistribution.map((range: any) => (
                      <li key={range.range} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{range.range}</p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-sm text-gray-500">
                              {range.count} 次 ({range.percentage}%)
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${range.percentage}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            {/* 错误率 */}
            <h2 className="text-lg font-medium text-gray-900 mb-4">错误率</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow mb-8">
              <div className="px-6 py-5">
                <div className="h-64 flex items-end space-x-2">
                  {stats.errorRates.map((day: any) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-red-500 rounded-t"
                        style={{ 
                          height: `${(day.rate / Math.max(...stats.errorRates.map((d: any) => d.rate)) || 1) * 100}%` 
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{formatDate(day.date)}</div>
                      <div className="text-xs font-medium">{day.rate}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 活跃用户 */}
            <h2 className="text-lg font-medium text-gray-900 mb-4">活跃用户</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow">
              <div className="px-6 py-5">
                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                用户
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                请求次数
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                最后活跃时间
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {stats.topUsers.map((user: any) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.requestCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDateTime(user.lastActive)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
