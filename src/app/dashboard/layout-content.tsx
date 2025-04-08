'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Users, Bell, Menu, ChevronRight, Database, LayoutDashboard, Settings, LogOut } from 'lucide-react';

export default function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const wl_id = searchParams.get('wl_id') || '1';

  // Close sidebar on mobile automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      href: `/dashboard/users?wl_id=${wl_id}`,
      title: 'Usuários',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: `/dashboard/notifications?wl_id=${wl_id}`,
      title: 'Notificações',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      href: `/dashboard/modelos?wl_id=${wl_id}`,
      title: 'Modelos CRM',
      icon: <Database className="w-5 h-5" />,
    },
  ];

  const bottomMenuItems = [
    {
      href: `/dashboard/settings?wl_id=${wl_id}`,
      title: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      href: '/',
      title: 'Sair',
      icon: <LogOut className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } bg-gray-900/90 backdrop-blur-md border-r border-gray-800/50 shadow-xl`}
      >
        <div className="h-full flex flex-col py-6 overflow-y-auto">
          <div className="flex items-center justify-between px-4 mb-8">
            <div className={`flex items-center gap-2.5 ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                WaSpeed
              </span>
            </div>
            {isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/70 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Center-aligned icon for collapsed state */}
          {!isSidebarOpen && (
            <div className="hidden lg:flex justify-center mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Main menu items */}
          <ul className="space-y-1.5 px-3 flex-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg group transition-colors ${
                    pathname === item.href.split('?')[0]
                      ? 'bg-gray-800/70 text-white font-medium'
                      : 'text-gray-400 hover:bg-gray-800/40 hover:text-white'
                  }`}
                >
                  <div className={`p-2.5 ${!isSidebarOpen ? 'mx-auto' : ''}`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && <span className="ml-1">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Bottom menu items */}
          <ul className="space-y-1.5 px-3 pt-4 border-t border-gray-800/50">
            {bottomMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg group transition-colors ${
                    pathname === item.href.split('?')[0]
                      ? 'bg-gray-800/70 text-white font-medium'
                      : 'text-gray-400 hover:bg-gray-800/40 hover:text-white'
                  }`}
                >
                  <div className={`p-2.5 ${!isSidebarOpen ? 'mx-auto' : ''}`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && <span className="ml-1">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-gray-900/70 backdrop-blur-md border-b border-gray-800/50 shadow-md">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/70 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-medium">
                {pathname.includes('/users') ? 'Usuários' : 
                 pathname.includes('/notifications') ? 'Notificações' :
                 pathname.includes('/modelos') ? 'Modelos CRM' : 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
                <span className="text-xs font-semibold">WL</span>
              </div>
              <span className="text-sm text-gray-300 hidden sm:inline-block">
                White Label: {wl_id}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 