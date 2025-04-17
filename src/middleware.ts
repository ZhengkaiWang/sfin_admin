import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname)
  
  try {
    // 使用新的Supabase会话更新功能
    return await updateSession(request)
  } catch (err) {
    console.error('Unexpected error in middleware:', err)
    // 出错时允许访问，避免无限加载
    return NextResponse.next()
  }
}

// 配置中间件匹配的路由
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
