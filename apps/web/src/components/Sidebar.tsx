'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Newspaper,
  Users,
  FolderOpen,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  submenu?: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      href: '/articles',
      label: 'Artikel',
      icon: <Newspaper className="w-5 h-5" />,
      badge: 12,
      submenu: [
        {
          href: '/articles',
          label: 'Semua Artikel',
          icon: <Newspaper className="w-4 h-4" />,
        },
        {
          href: '/articles/create',
          label: 'Buat Artikel',
          icon: <Newspaper className="w-4 h-4" />,
        },
        {
          href: '/articles/featured',
          label: 'Unggulan',
          icon: <Newspaper className="w-4 h-4" />,
        },
      ],
    },
    {
      href: '/authors',
      label: 'Penulis',
      icon: <Users className="w-5 h-5" />,
      submenu: [
        {
          href: '/authors',
          label: 'Daftar Penulis',
          icon: <Users className="w-4 h-4" />,
        },
        {
          href: '/authors/create',
          label: 'Tambah Penulis',
          icon: <Users className="w-4 h-4" />,
        },
      ],
    },
    {
      href: '/categories',
      label: 'Kategori',
      icon: <FolderOpen className="w-5 h-5" />,
    },
    {
      href: '/comments',
      label: 'Komentar',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: 5,
    },
    {
      href: '/calendar',
      label: 'Kalender Editorial',
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-gradient-to-br from-[#1F2937] to-[#3B82F6] text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-gradient-to-br from-[#1F2937] to-[#111827] text-white transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 overflow-y-auto`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1F2937] flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Berita</h1>
              <p className="text-xs text-gray-400">Enterprise</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      expandedMenu === item.label || isActive(item.href)
                        ? 'bg-[#3B82F6] text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedMenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Submenu */}
                  {expandedMenu === item.label && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-3">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive(subitem.href)
                              ? 'bg-[#3B82F6] text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {subitem.icon}
                          <span className="text-sm">{subitem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/settings')
                ? 'bg-[#3B82F6] text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Pengaturan</span>
          </Link>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}