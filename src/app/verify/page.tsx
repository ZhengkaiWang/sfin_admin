'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getVerificationRequest, 
  markVerificationRequestAsVerified, 
  markInviteCodeAsUsed,
  createApiToken
} from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [apiToken, setApiToken] = useState('');
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('验证令牌缺失，请检查链接是否完整。');
        setLoading(false);
        return;
      }
      
      try {
        // 获取验证请求
        const { data: verificationData, error: verificationError } = await getVerificationRequest(token);
        
        if (verificationError || !verificationData) {
          setError('无效的验证令牌或验证已过期，请重新申请。');
          setLoading(false);
          return;
        }
        
        // 标记验证请求已验证
        const { data: updatedVerification, error: updateError } = await markVerificationRequestAsVerified(verificationData.id);
        
        if (updateError || !updatedVerification) {
          setError('验证过程中出错，请稍后重试。');
          setLoading(false);
          return;
        }
        
        // 标记邀请码已使用
        const { data: updatedInviteCode, error: inviteCodeError } = await markInviteCodeAsUsed(verificationData.invite_code_id);
        
        if (inviteCodeError || !updatedInviteCode) {
          setError('更新邀请码状态时出错，请联系管理员。');
          setLoading(false);
          return;
        }
        
        // 生成API令牌
        const newToken = uuidv4();
        
        // 设置过期时间（1年后）
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        
        // 创建API令牌
        const { data: tokenData, error: tokenError } = await createApiToken({
          token: newToken,
          user_email: verificationData.email,
          invite_code_id: verificationData.invite_code_id,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });
        
        if (tokenError || !tokenData) {
          setError('创建API令牌时出错，请联系管理员。');
          setLoading(false);
          return;
        }
        
        // 调用Edge Function发送API令牌邮件
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-token-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            email: verificationData.email,
            token: newToken,
            expiresAt: expiresAt.toISOString()
          })
        });
        
        if (!response.ok) {
          // 即使发送邮件失败，我们也显示令牌
          console.error('发送API令牌邮件失败');
        }
        
        // 设置成功状态和API令牌
        setSuccess(true);
        setApiToken(newToken);
        setLoading(false);
      } catch (err) {
        console.error('验证处理错误:', err);
        setError('验证过程中出错，请稍后重试。');
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">验证邮箱</h1>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-600">正在验证您的邮箱...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">验证失败</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => router.push('/apply')}
                    >
                      返回申请页面
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">验证成功</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>您的邮箱已成功验证，API令牌已生成。我们已将API令牌发送到您的邮箱，您也可以在下方查看并复制。</p>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">您的API令牌：</p>
                    <div className="flex items-center">
                      <input
                        type="text"
                        readOnly
                        value={apiToken}
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm font-mono bg-white"
                      />
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          navigator.clipboard.writeText(apiToken);
                          alert('API令牌已复制到剪贴板');
                        }}
                      >
                        复制
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">请妥善保管您的API令牌，不要泄露给他人。</p>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => router.push('/')}
                    >
                      返回首页
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
