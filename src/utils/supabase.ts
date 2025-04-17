import { createClient } from '@supabase/supabase-js';
import { VerificationRequestInsert, ApiTokenInsert, ApiTokenUpdate } from '@/types';

// 创建Supabase客户端
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// 验证邀请码
export const validateInviteCode = async (code: string) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code)
    .eq('is_used', false)
    .single();
};

// 创建验证请求
export const createVerificationRequest = async (data: VerificationRequestInsert) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('verification_requests')
    .insert(data)
    .select()
    .single();
};

// 获取验证请求
export const getVerificationRequest = async (token: string) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('verification_requests')
    .select('*')
    .eq('token', token)
    .eq('is_verified', false)
    .lt('expires_at', new Date().toISOString())
    .single();
};

// 标记验证请求已验证
export const markVerificationRequestAsVerified = async (id: string) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('verification_requests')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
};

// 标记邀请码已使用
export const markInviteCodeAsUsed = async (id: string) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('invite_codes')
    .update({
      is_used: true,
      used_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
};

// 创建API令牌
export const createApiToken = async (data: ApiTokenInsert) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('api_tokens')
    .insert(data)
    .select()
    .single();
};

// 获取API令牌列表
export const getApiTokens = async () => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('api_tokens')
    .select('*')
    .order('created_at', { ascending: false });
};

// 更新API令牌
export const updateApiToken = async (id: string, data: ApiTokenUpdate) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('api_tokens')
    .update(data)
    .eq('id', id)
    .select()
    .single();
};

// 获取API日志列表
export const getApiLogs = async (limit: number = 10, offset: number = 0) => {
  const supabase = createSupabaseClient();
  
  return await supabase
    .from('api_logs')
    .select(`
      *,
      api_tokens (
        id,
        user_email
      )
    `)
    .order('request_time', { ascending: false })
    .range(offset, offset + limit - 1);
};

// 获取API使用统计
export const getApiUsageStats = async () => {
  const supabase = createSupabaseClient();
  
  // 获取总请求数
  const { count: total, error: totalError } = await supabase
    .from('api_logs')
    .select('*', { count: 'exact', head: true });
  
  // 获取今日请求数
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayCount, error: todayError } = await supabase
    .from('api_logs')
    .select('*', { count: 'exact', head: true })
    .gte('request_time', today.toISOString());
  
  // 获取本周请求数
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
  thisWeek.setHours(0, 0, 0, 0);
  const { count: weekCount, error: weekError } = await supabase
    .from('api_logs')
    .select('*', { count: 'exact', head: true })
    .gte('request_time', thisWeek.toISOString());
  
  // 获取本月请求数
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const { count: monthCount, error: monthError } = await supabase
    .from('api_logs')
    .select('*', { count: 'exact', head: true })
    .gte('request_time', thisMonth.toISOString());
  
  // 获取按端点分组的请求数
  const { data: endpointData, error: endpointError } = await supabase.rpc(
    'get_endpoint_counts',
    { limit_count: 10 }
  );
  
  const byEndpoint: Record<string, number> = {};
  endpointData?.forEach((item: { endpoint: string; count: number }) => {
    byEndpoint[item.endpoint] = item.count;
  });
  
  return {
    total: total || 0,
    today: todayCount || 0,
    thisWeek: weekCount || 0,
    thisMonth: monthCount || 0,
    byEndpoint,
    error: totalError || todayError || weekError || monthError || endpointError
  };
};

// 获取令牌统计
export const getTokenStats = async () => {
  const supabase = createSupabaseClient();
  
  // 获取总令牌数
  const { count: total, error: totalError } = await supabase
    .from('api_tokens')
    .select('*', { count: 'exact', head: true });
  
  // 获取活跃令牌数
  const { count: active, error: activeError } = await supabase
    .from('api_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  
  // 获取过期令牌数
  const { count: expired, error: expiredError } = await supabase
    .from('api_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false);
  
  // 获取按用户分组的令牌数
  const { data: userData, error: userError } = await supabase
    .from('api_tokens')
    .select('user_email')
    .order('created_at', { ascending: false });
  
  // 统计每个用户的令牌数
  const byUser: Record<string, number> = {};
  userData?.forEach(item => {
    const email = item.user_email;
    if (email) {
      byUser[email] = (byUser[email] || 0) + 1;
    }
  });
  
  return {
    total: total || 0,
    active: active || 0,
    expired: expired || 0,
    byUser,
    error: totalError || activeError || expiredError || userError
  };
};

// 获取每日请求数
export const getDailyRequests = async (days: number = 7) => {
  const supabase = createSupabaseClient();
  
  // 使用SQL函数获取每日请求数
  const { data, error } = await supabase.rpc(
    'get_daily_requests',
    { days_count: days }
  );
  
  // 处理请求数据
  const dailyRequests = data?.map((item: { 
    request_date: string; 
    request_count: number;
  }) => {
    return {
      date: item.request_date,
      count: item.request_count
    };
  }) || [];
  
  return dailyRequests;
};

// 获取工具使用情况
export const getToolUsage = async (limit: number = 5) => {
  const supabase = createSupabaseClient();
  
  // 获取总请求数
  const { count: total, error: totalError } = await supabase
    .from('api_logs')
    .select('*', { count: 'exact', head: true });
  
  // 获取按工具分组的请求数
  const { data, error } = await supabase.rpc(
    'get_tool_usage_counts',
    { limit_count: limit }
  );
  
  const toolUsage = data?.map((item: { tool_name: string; count: number }) => {
    return {
      name: item.tool_name,
      count: item.count,
      percentage: total ? Math.round((item.count / total) * 1000) / 10 : 0
    };
  }) || [];
  
  return {
    toolUsage,
    error: error || totalError
  };
};

// 获取响应时间分布
export const getResponseTimeDistribution = async () => {
  const supabase = createSupabaseClient();
  
  // 获取总请求数
  const { count: total, error: totalError } = await supabase
    .from('api_logs')
    .select('*', { count: 'exact', head: true })
    .not('response_time', 'is', null);
  
  // 定义响应时间范围
  const ranges = [
    { range: '0-0.2秒', min: 0, max: 0.2 },
    { range: '0.2-0.5秒', min: 0.2, max: 0.5 },
    { range: '0.5-1秒', min: 0.5, max: 1 },
    { range: '1-2秒', min: 1, max: 2 },
    { range: '2秒以上', min: 2, max: null }
  ];
  
  // 获取每个范围的请求数
  const distribution = [];
  for (const range of ranges) {
    let query = supabase
      .from('api_logs')
      .select('*', { count: 'exact', head: true })
      .not('response_time', 'is', null);
    
    if (range.min !== null) {
      query = query.gte('response_time', range.min);
    }
    
    if (range.max !== null) {
      query = query.lt('response_time', range.max);
    }
    
    const { count, error } = await query;
    
    distribution.push({
      range: range.range,
      count: count || 0,
      percentage: total ? Math.round((count || 0) / total * 1000) / 10 : 0
    });
  }
  
  return {
    distribution,
    error: totalError
  };
};

// 获取错误率
export const getErrorRates = async (days: number = 7) => {
  const supabase = createSupabaseClient();
  
  // 使用SQL函数获取每日错误率
  const { data, error } = await supabase.rpc(
    'get_daily_error_rates',
    { days_count: days }
  );
  
  // 处理错误率数据
  const errorRates = data?.map((item: { 
    error_date: string; 
    error_rate: number;
  }) => {
    return {
      date: item.error_date,
      rate: item.error_rate
    };
  }) || [];
  
  return errorRates;
};

// 获取活跃用户
export const getActiveUsers = async (limit: number = 5) => {
  const supabase = createSupabaseClient();
  
  // 使用SQL函数获取最活跃的用户
  const { data, error } = await supabase.rpc(
    'get_active_users',
    { limit_count: limit }
  );
  
  // 处理用户数据
  const activeUsers = data?.map((user: { 
    token_id: string; 
    user_email: string; 
    request_count: number;
    last_active: string;
  }) => {
    const userEmail = user.user_email || '未知邮箱';
    const userName = userEmail.split('@')[0] || '未知用户';
    
    return {
      id: user.token_id,
      name: userName,
      email: userEmail,
      requestCount: user.request_count,
      lastActive: user.last_active
    };
  }) || [];
  
  return {
    activeUsers,
    error
  };
};
