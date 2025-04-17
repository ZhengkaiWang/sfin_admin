'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApiTokens, updateApiToken, createApiToken } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function TokensPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    userName: '',
    email: '',
  });
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTokenData, setNewTokenData] = useState({
    userName: '',
    email: '',
    name: '',
    expiresIn: '365', // 默认365天
  });

  useEffect(() => {
    // 如果用户未登录或正在加载，不执行任何操作
    if (authLoading || !user || !isAdmin) return;
    
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await getApiTokens();
        
        if (fetchError) {
          throw fetchError;
        }
        
        // 处理令牌数据，添加状态和请求计数
        const processedTokens = data?.map(token => ({
          ...token,
          status: token.is_active ? 'active' : 'revoked',
          // 这里可以添加请求计数，实际项目中可能需要从日志表中获取
          requestCount: 0,
          userName: token.user_email.split('@')[0], // 临时使用邮箱前缀作为用户名
          created: token.created_at,
          expires: token.expires_at
        })) || [];
        
        setTokens(processedTokens);
        setIsLoading(false);
      } catch (err: any) {
        console.error('获取令牌列表失败:', err);
        setError(err.message || '获取令牌列表失败');
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [user, authLoading, isAdmin]);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewTokenChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTokenData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await getApiTokens();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // 处理令牌数据，添加状态和请求计数
      let processedTokens = data?.map(token => ({
        ...token,
        status: token.is_active ? 'active' : 'revoked',
        requestCount: 0,
        userName: token.user_email.split('@')[0], // 临时使用邮箱前缀作为用户名
        created: token.created_at,
        expires: token.expires_at
      })) || [];
      
      // 应用筛选条件
      if (filter.status !== 'all') {
        const isActive = filter.status === 'active';
        processedTokens = processedTokens.filter(token => token.is_active === isActive);
      }
      
      if (filter.userName) {
        processedTokens = processedTokens.filter(token => 
          token.userName.toLowerCase().includes(filter.userName.toLowerCase())
        );
      }
      
      if (filter.email) {
        processedTokens = processedTokens.filter(token => 
          token.user_email.toLowerCase().includes(filter.email.toLowerCase())
        );
      }
      
      setTokens(processedTokens);
      setIsLoading(false);
    } catch (err: any) {
      console.error('筛选令牌失败:', err);
      setError(err.message || '筛选令牌失败');
      setIsLoading(false);
    }
  };

  const resetFilters = async () => {
    setFilter({
      status: 'all',
      userName: '',
      email: '',
    });
    
    // 重新获取所有令牌
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await getApiTokens();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // 处理令牌数据，添加状态和请求计数
      const processedTokens = data?.map(token => ({
        ...token,
        status: token.is_active ? 'active' : 'revoked',
        requestCount: 0,
        userName: token.user_email.split('@')[0], // 临时使用邮箱前缀作为用户名
        created: token.created_at,
        expires: token.expires_at
      })) || [];
      
      setTokens(processedTokens);
      setIsLoading(false);
    } catch (err: any) {
      console.error('重置筛选失败:', err);
      setError(err.message || '重置筛选失败');
      setIsLoading(false);
    }
  };

  const handleRevoke = (tokenId: string) => {
    setTokenToRevoke(tokenId);
    setShowRevokeModal(true);
  };

  const confirmRevoke = async () => {
    if (!tokenToRevoke) return;
    
    try {
      const { data, error: updateError } = await updateApiToken(tokenToRevoke, {
        is_active: false
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // 更新本地状态
      setTokens(tokens.map(token => 
        token.id === tokenToRevoke 
          ? { ...token, status: 'revoked', is_active: false } 
          : token
      ));
      setShowRevokeModal(false);
      setTokenToRevoke(null);
    } catch (err: any) {
      console.error('撤销令牌失败:', err);
      setError(err.message || '撤销令牌失败');
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 生成新令牌
      const newTokenString = uuidv4();
      
      // 设置过期时间
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(newTokenData.expiresIn));
      
      // 创建新令牌
      const { data, error: createError } = await createApiToken({
        token: newTokenString,
        user_email: newTokenData.email,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true
      });
      
      if (createError) {
        throw createError;
      }
      
      // 更新本地状态
      if (data) {
        const newToken = {
          ...data,
          status: 'active',
          requestCount: 0,
          userName: newTokenData.userName,
          email: newTokenData.email,
          created: data.created_at,
          expires: data.expires_at
        };
        
        setTokens([newToken, ...tokens]);
      }
      
      setShowCreateModal(false);
      setNewTokenData({
        userName: '',
        email: '',
        name: '',
        expiresIn: '365',
      });
    } catch (err: any) {
      console.error('创建令牌失败:', err);
      setError(err.message || '创建令牌失败');
    }
  };

  // 检查用户是否未登录或不是管理员
  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">令牌管理</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">令牌管理</h1>
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
          
          <div className="flex justify-between mb-6">
            {/* 筛选器 */}
            <div className="bg-gray-50 p-4 rounded-lg flex-1 mr-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">筛选令牌</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    <option value="active">活跃</option>
                    <option value="revoked">已撤销</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700">用户名</label>
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">邮箱</label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    value={filter.email}
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
            
            {/* 创建令牌按钮 */}
            <div className="flex items-start">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                创建新令牌
              </button>
            </div>
          </div>
          
          {/* 令牌表格 */}
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
                          令牌
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          创建时间
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          过期时间
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          请求次数
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">操作</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tokens.map((token) => (
                        <tr key={token.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{token.userName}</div>
                            <div className="text-sm text-gray-500">{token.user_email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{token.name || '未命名令牌'}</div>
                            <div className="text-sm text-gray-500 font-mono">{token.token}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(token.created)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(token.expires)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {token.requestCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              token.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {token.status === 'active' ? '活跃' : '已撤销'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {token.status === 'active' && (
                              <button
                                onClick={() => handleRevoke(token.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                撤销
                              </button>
                            )}
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
      
      {/* 撤销确认模态框 */}
      {showRevokeModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform w-full max-w-lg">
              <div className="bg-white p-6">
                <h3 className="text-lg font-medium text-gray-900">撤销API令牌</h3>
                <p className="mt-2 text-sm text-gray-500">
                  您确定要撤销此API令牌吗？此操作无法撤销，撤销后令牌将无法使用。
                </p>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                  onClick={confirmRevoke}
                >
                  撤销
                </button>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md"
                  onClick={() => setShowRevokeModal(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 创建令牌模态框 */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform w-full max-w-lg">
              <form onSubmit={handleCreateToken}>
                <div className="bg-white p-6">
                  <h3 className="text-lg font-medium text-gray-900">创建新令牌</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                        用户名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="userName"
                        id="userName"
                        required
                        value={newTokenData.userName}
                        onChange={handleNewTokenChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        邮箱 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={newTokenData.email}
                        onChange={handleNewTokenChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        令牌名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={newTokenData.name}
                        onChange={handleNewTokenChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="expiresIn" className="block text-sm font-medium text-gray-700">
                        有效期 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="expiresIn"
                        name="expiresIn"
                        required
                        value={newTokenData.expiresIn}
                        onChange={handleNewTokenChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      >
                        <option value="30">30天</option>
                        <option value="90">90天</option>
                        <option value="180">180天</option>
                        <option value="365">365天</option>
                        <option value="730">730天</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    创建
                  </button>
                  <button 
                    type="button" 
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md"
                    onClick={() => setShowCreateModal(false)}
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
