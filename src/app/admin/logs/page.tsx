'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApiLogs } from '@/utils/supabase';

export default function LogsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    toolName: '',
    userName: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 10;

  useEffect(() => {
    // 如果用户未登录或正在加载，不执行任何操作
    if (authLoading || !user) return;
    
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * logsPerPage;
        const { data, error: fetchError } = await getApiLogs(logsPerPage, offset);
        
        if (fetchError) {
          throw fetchError;
        }
        
        // 处理日志数据
        const processedLogs = data?.map(log => {
          // 计算响应时间（如果有）
          let respTime = 0;
          if (log.request_time && log.response_time) {
            const requestTime = new Date(log.request_time).getTime();
            const responseTime = new Date(log.response_time).getTime();
            respTime = (responseTime - requestTime) / 1000; // 转换为秒
          }
          
          // 安全地获取用户邮箱
          const tokenData = log.api_tokens as any || {};
          const userEmail = tokenData.user_email || '未知邮箱';
          const userName = userEmail.split('@')[0] || '未知用户';
          
          return {
            ...log,
            userName,
            email: userEmail,
            timestamp: log.request_time,
            status: log.status || (log.error_message ? 'error' : 'success'),
            responseTime: respTime
          };
        }) || [];
        
        setLogs(processedLogs);
        
        // 估算总页数（实际项目中可能需要从API获取总数）
        // 这里假设总数是当前页数据的10倍，实际项目中应该从API获取
        setTotalLogs(data?.length ? data.length * 10 : 0);
        setTotalPages(Math.ceil(data?.length ? data.length * 10 : 0) / logsPerPage);
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('获取日志失败:', err);
        setError(err.message || '获取日志失败');
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user, authLoading, page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    try {
      setIsLoading(true);
      setPage(1); // 重置页码
      
      // 在实际项目中，这里应该将筛选条件传递给API
      // 这里简单模拟
      const offset = 0; // 第一页
      const { data, error: fetchError } = await getApiLogs(logsPerPage, offset);
      
      if (fetchError) {
        throw fetchError;
      }
      
      // 处理日志数据
      let processedLogs = data?.map(log => {
        // 计算响应时间（如果有）
        let respTime = 0;
        if (log.request_time && log.response_time) {
          const requestTime = new Date(log.request_time).getTime();
          const responseTime = new Date(log.response_time).getTime();
          respTime = (responseTime - requestTime) / 1000; // 转换为秒
        }
        
        // 安全地获取用户邮箱
        const tokenData = log.api_tokens as any || {};
        const userEmail = tokenData.user_email || '未知邮箱';
        const userName = userEmail.split('@')[0] || '未知用户';
        
        return {
          ...log,
          userName,
          email: userEmail,
          timestamp: log.request_time,
          status: log.status || (log.error_message ? 'error' : 'success'),
          responseTime: respTime
        };
      }) || [];
      
      // 应用筛选条件
      if (filter.status !== 'all') {
        processedLogs = processedLogs.filter(log => log.status === filter.status);
      }
      
      if (filter.toolName) {
        processedLogs = processedLogs.filter(log => 
          log.tool_name?.toLowerCase().includes(filter.toolName.toLowerCase())
        );
      }
      
      if (filter.userName) {
        processedLogs = processedLogs.filter(log => 
          log.userName.toLowerCase().includes(filter.userName.toLowerCase()) ||
          log.email.toLowerCase().includes(filter.userName.toLowerCase())
        );
      }
      
      // 日期筛选
      if (filter.dateFrom) {
        const fromDate = new Date(filter.dateFrom);
        processedLogs = processedLogs.filter(log => 
          new Date(log.timestamp) >= fromDate
        );
      }
      
      if (filter.dateTo) {
        const toDate = new Date(filter.dateTo);
        toDate.setHours(23, 59, 59, 999); // 设置为当天的最后一毫秒
        processedLogs = processedLogs.filter(log => 
          new Date(log.timestamp) <= toDate
        );
      }
      
      setLogs(processedLogs);
      setTotalLogs(processedLogs.length);
      setTotalPages(Math.ceil(processedLogs.length / logsPerPage));
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('筛选日志失败:', err);
      setError(err.message || '筛选日志失败');
      setIsLoading(false);
    }
  };

  const resetFilters = async () => {
    setFilter({
      status: 'all',
      toolName: '',
      userName: '',
      dateFrom: '',
      dateTo: '',
    });
    
    // 重新获取所有日志
    try {
      setIsLoading(true);
      setPage(1); // 重置页码
      
      const offset = 0; // 第一页
      const { data, error: fetchError } = await getApiLogs(logsPerPage, offset);
      
      if (fetchError) {
        throw fetchError;
      }
      
      // 处理日志数据
      const processedLogs = data?.map(log => {
        // 计算响应时间（如果有）
        let respTime = 0;
        if (log.request_time && log.response_time) {
          const requestTime = new Date(log.request_time).getTime();
          const responseTime = new Date(log.response_time).getTime();
          respTime = (responseTime - requestTime) / 1000; // 转换为秒
        }
        
        // 安全地获取用户邮箱
        const tokenData = log.api_tokens as any || {};
        const userEmail = tokenData.user_email || '未知邮箱';
        const userName = userEmail.split('@')[0] || '未知用户';
        
        return {
          ...log,
          userName,
          email: userEmail,
          timestamp: log.request_time,
          status: log.status || (log.error_message ? 'error' : 'success'),
          responseTime: respTime
        };
      }) || [];
      
      setLogs(processedLogs);
      setTotalLogs(data?.length ? data.length * 10 : 0);
      setTotalPages(Math.ceil(data?.length ? data.length * 10 : 0) / logsPerPage);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('重置筛选失败:', err);
      setError(err.message || '重置筛选失败');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">访问日志</h1>
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
          
          {/* 筛选器 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">筛选日志</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">状态</label>
                <select
                  id="status"
                  name="status"
                  value={filter.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">全部</option>
                  <option value="success">成功</option>
                  <option value="error">错误</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="toolName" className="block text-sm font-medium text-gray-700">工具名称</label>
                <input
                  type="text"
                  name="toolName"
                  id="toolName"
                  value={filter.toolName}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">用户名/邮箱</label>
                <input
                  type="text"
                  name="userName"
                  id="userName"
                  value={filter.userName}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">开始日期</label>
                <input
                  type="date"
                  name="dateFrom"
                  id="dateFrom"
                  value={filter.dateFrom}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">结束日期</label>
                <input
                  type="date"
                  name="dateTo"
                  id="dateTo"
                  value={filter.dateTo}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                onClick={applyFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                应用筛选
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                重置
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              {/* 日志表格 */}
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              时间
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              用户
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              工具
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IP地址
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              状态
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              响应时间
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {logs.length > 0 ? (
                            logs.map((log) => (
                              <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(log.timestamp)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                                  <div className="text-sm text-gray-500">{log.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{log.tool_name || '未知工具'}</div>
                                  <div className="text-sm text-gray-500">{log.endpoint}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.ip_address || '未知IP'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    log.status === 'success' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.status === 'success' ? '成功' : '错误'}
                                  </span>
                                  {log.error_message && (
                                    <div className="text-xs text-red-500 mt-1">{log.error_message}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.responseTime ? `${log.responseTime.toFixed(2)} 秒` : '未知'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                暂无日志数据
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 分页 */}
              {logs.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      下一页
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        显示第 <span className="font-medium">{(page - 1) * logsPerPage + 1}</span> 到 <span className="font-medium">{Math.min(page * logsPerPage, totalLogs)}</span> 条，共 <span className="font-medium">{totalLogs}</span> 条记录
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="sr-only">上一页</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // 显示当前页附近的页码
                          let pageNum = page;
                          if (page <= 3) {
                            // 如果当前页靠近开始，显示前5页
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            // 如果当前页靠近结束，显示最后5页
                            pageNum = totalPages - 4 + i;
                          } else {
                            // 否则显示当前页及其前后2页
                            pageNum = page - 2 + i;
                          }
                          
                          // 确保页码在有效范围内
                          if (pageNum > 0 && pageNum <= totalPages) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                  pageNum === page
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return null;
                        })}
                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="sr-only">下一页</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
