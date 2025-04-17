import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

// 自定义Hook，用于在组件中访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
