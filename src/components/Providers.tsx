"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';

interface ProvidersProps {
  children: ReactNode;
}

// 客户端提供者组件，包含所有上下文提供者
export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
