'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: '首页', href: '/' },
  { name: '使用指南', href: '/guide' },
  { name: '申请令牌', href: '/apply' },
];

const adminNavigation = [
  { name: '管理后台', href: '/admin' },
  { name: '令牌管理', href: '/admin/tokens' },
  { name: '日志查看', href: '/admin/logs' },
  { name: '统计数据', href: '/admin/stats' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  {/* Logo */}
                  <span className="text-xl font-bold text-gray-900">SFIN</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {/* 主导航链接 */}
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* 管理员导航链接 - 只有管理员才能看到 */}
                {isAdmin && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? 'border-indigo-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
                
                {/* 用户菜单 */}
                {!loading && (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">打开用户菜单</span>
                        <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {user ? (
                          <>
                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                              {user.email}
                            </div>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/manage"
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  管理令牌
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleSignOut}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  登出
                                </button>
                              )}
                            </Menu.Item>
                          </>
                        ) : (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/login"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                登录
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* 移动端菜单按钮 */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">打开主菜单</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {/* 移动端主导航链接 */}
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              {/* 移动端管理员导航链接 - 只有管理员才能看到 */}
              {isAdmin && (
                <div className="space-y-1">
                  {adminNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                      )}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              )}
              
              {/* 移动端用户菜单 */}
              {!loading && (
                <div className="space-y-1 mt-3">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-500">
                        {user.email}
                      </div>
                      <Disclosure.Button
                        as={Link}
                        href="/manage"
                        className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                      >
                        管理令牌
                      </Disclosure.Button>
                      <Disclosure.Button
                        as="button"
                        onClick={handleSignOut}
                        className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                      >
                        登出
                      </Disclosure.Button>
                    </>
                  ) : (
                    <Disclosure.Button
                      as={Link}
                      href="/login"
                      className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    >
                      登录
                    </Disclosure.Button>
                  )}
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
