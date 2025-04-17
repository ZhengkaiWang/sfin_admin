import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { type Database } from '../../types/database'

export async function updateSession(request: NextRequest) {
  // 创建响应对象
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 创建带有来自请求的cookies的Supabase客户端
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  
  // 使用 getUser() 替代 getSession() 以获取经过验证的用户信息
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 获取原始URL
  const url = request.nextUrl.clone()

  // 检查是否是受保护的路由
  const protectedRoutes = ['/manage', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route))

  // 如果是受保护的路由，但用户未登录，重定向到登录页面
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 如果是管理员路由，检查用户是否是管理员
  if (url.pathname.startsWith('/admin') && user && user.email) {
    try {
      // 检查用户是否是管理员
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single()
      
      if (error || !adminData) {
        return NextResponse.redirect(new URL('/manage', request.url))
      }
    } catch (err) {
      console.error('Error checking admin status:', err)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}
