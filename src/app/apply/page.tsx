'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateInviteCode, createVerificationRequest } from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function ApplyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    invitationCode: '',
    email: '',
    name: '',
    organization: '',
    purpose: '',
    agreeTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // 验证邀请码
      const { data: inviteCode, error: inviteError } = await validateInviteCode(formData.invitationCode);
      
      if (inviteError || !inviteCode) {
        setError('无效的邀请码，请检查后重试。');
        setIsSubmitting(false);
        return;
      }
      
      // 创建验证令牌
      const verificationToken = uuidv4();
      
      // 设置过期时间（24小时后）
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // 创建验证请求
      const { data: verificationData, error: verificationError } = await createVerificationRequest({
        email: formData.email,
        token: verificationToken,
        invite_code_id: inviteCode.id,
        expires_at: expiresAt.toISOString(),
        is_verified: false
      });
      
      if (verificationError || !verificationData) {
        setError('创建验证请求失败，请稍后重试。');
        setIsSubmitting(false);
        return;
      }
      
      // 调用Edge Function发送验证邮件
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          verificationToken,
          verificationUrl: `${window.location.origin}/verify?token=${verificationToken}`
        })
      });
      
      if (!response.ok) {
        setError('发送验证邮件失败，请稍后重试。');
        setIsSubmitting(false);
        return;
      }
      
      // 成功处理
      setSuccess(true);
      setFormData({
        invitationCode: '',
        email: '',
        name: '',
        organization: '',
        purpose: '',
        agreeTerms: false,
      });
    } catch (err) {
      console.error('申请处理错误:', err);
      setError('提交申请时出错，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">申请API令牌</h1>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">申请已提交</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>我们已收到您的API令牌申请。请检查您的邮箱，我们将发送验证链接以完成申请流程。</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => setSuccess(false)}
                    >
                      提交新申请
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-gray-600">
                请填写以下表单申请API令牌。我们将通过邮件向您发送验证链接，完成验证后您将收到API令牌。
              </p>
              
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
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700">
                    邀请码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="invitationCode"
                    id="invitationCode"
                    required
                    value={formData.invitationCode}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">请输入您收到的邀请码</p>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    电子邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">我们将发送验证链接到此邮箱</p>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    组织/公司
                  </label>
                  <input
                    type="text"
                    name="organization"
                    id="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                    使用目的 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="purpose"
                    id="purpose"
                    rows={3}
                    required
                    value={formData.purpose}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">请简要描述您计划如何使用SFIN服务</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      required
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                      我同意服务条款和隐私政策 <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? '提交中...' : '提交申请'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
