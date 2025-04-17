"use client";

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase/client';

// 创建认证上下文
interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
});

// 认证上下文提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();

  // 检查用户是否为管理员的函数
  const checkAdminStatus = async (userEmail: string | undefined) => {
    if (!userEmail) {
      setIsAdmin(false);
      return;
    }
    
    try {
      // 检查用户是否是管理员
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', userEmail)
        .single();
      
      setIsAdmin(!!adminData && !adminError);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  // 更新会话状态的函数
  const updateSessionState = async (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    if (newSession?.user?.email) {
      await checkAdminStatus(newSession.user.email);
    } else {
      setIsAdmin(false);
    }
    
    setLoading(false);
  };

  // 初始化用户会话
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // 使用 getUser 而不是 getSession，确保安全性
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        } else if (userData.user) {          
          // 获取完整会话信息
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            await updateSessionState(sessionData.session);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    initializeAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        await updateSessionState(newSession);
      }
    );

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 登录函数
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error during sign in') };
    }
  };

  // 注册函数
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error during sign up') };
    }
  };

  // 登出函数
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error during sign out') };
    }
  };

  // 重置密码函数
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error during password reset') };
    }
  };

  // 提供上下文值
  const value = {
    session,
    user,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
