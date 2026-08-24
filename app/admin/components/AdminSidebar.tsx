'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Home,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  PlusCircle,
  Tag,
  Users,
  ShieldAlert,
  CreditCard,
  BarChart3,
  Settings,
  MessageCircle,
  X,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { getOrders, getStoreSettings, getCachedStoreSettings } from '@/lib/supabase-service';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: number;
}

interface NavSection {
  title: string | null;
  items: NavItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

function SidebarInner({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const actionParam = searchParams.get('action');
  const tabParam = searchParams.get('tab');

  const [pendingCount, setPendingCount] = useState<number>(3);
  const [processingCount, setProcessingCount] = useState<number>(1);
  const [csPhone, setCsPhone] = useState<string>('6285828378025');

  useEffect(() => {
    getStoreSettings().then((s) => {
      if (s?.whatsapp_number) setCsPhone(s.whatsapp_number);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadCounts() {
      try {
        const orders = await getOrders();
        const pending = orders.filter(
          (o) => o.order_status === 'pending' || o.order_status === 'awaiting_activation'
        ).length;
        const processing = orders.filter((o) => o.order_status === 'processing').length;
        setPendingCount(pending);
        setProcessingCount(processing);
      } catch (err) {
        console.warn('Failed to count orders:', err);
      }
    }
    loadCounts();
  }, [pathname, statusParam]);

  const isOrderPage = pathname === '/admin/orders';

  const navSections: NavSection[] = [
    {
      title: null,
      items: [
        {
          label: 'Dashboard',
          href: '/admin',
          icon: Home,
          active: pathname === '/admin',
        },
      ],
    },
    {
      title: 'ORDER MANAGEMENT',
      items: [
        {
          label: 'Order Masuk',
          href: '/admin/orders?status=pending',
          icon: CalendarCheck2,
          badge: pendingCount,
          active: isOrderPage && (!statusParam || statusParam === 'pending'),
        },
        {
          label: 'Order Diproses',
          href: '/admin/orders?status=processing',
          icon: Clock,
          badge: processingCount,
          active: isOrderPage && statusParam === 'processing',
        },
        {
          label: 'Order Selesai',
          href: '/admin/orders?status=completed',
          icon: CheckCircle2,
          active: isOrderPage && statusParam === 'completed',
        },
        {
          label: 'Order Dibatalkan',
          href: '/admin/orders?status=cancelled',
          icon: XCircle,
          active: isOrderPage && statusParam === 'cancelled',
        },
      ],
    },
    {
      title: 'PRICELIST',
      items: [
        {
          label: 'Pricelist Robux',
          href: '/admin/products',
          icon: Tag,
          active: pathname === '/admin/products',
        },
      ],
    },
    {
      title: 'PELANGGAN',
      items: [
        {
          label: 'Daftar Pelanggan',
          href: '/admin/customers',
          icon: Users,
          active: pathname === '/admin/customers' && !tabParam,
        },
        {
          label: 'Blacklist',
          href: '/admin/customers?tab=blacklist',
          icon: ShieldAlert,
          active: pathname === '/admin/customers' && tabParam === 'blacklist',
        },
      ],
    },
    {
      title: 'KONTEN & ULASAN',
      items: [
        {
          label: 'Kelola Testimoni',
          href: '/admin/testimonials',
          icon: MessageCircle,
          active: pathname === '/admin/testimonials',
        },
      ],
    },
    {
      title: 'KEUANGAN',
      items: [
        {
          label: 'Riwayat Pembayaran',
          href: '/admin/finance',
          icon: CreditCard,
          active: pathname === '/admin/finance',
        },
      ],
    },
    {
      title: 'PENGATURAN',
      items: [
        {
          label: 'Pengaturan Toko',
          href: '/admin/settings',
          icon: Settings,
          active: pathname === '/admin/settings',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-md border-r border-pink-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header Logo (Centered) */}
        <div className="relative p-4 py-4 border-b border-pink-100/60 flex items-center justify-center">
          <Link href="/admin" className="flex items-center justify-center group w-full">
            <Image
              src="/images/logo_admin.png"
              alt="BloxyLucy Admin"
              width={364}
              height={148}
              className="w-full max-w-[210px] h-auto object-contain mx-auto"
              priority
              unoptimized
            />
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-pink-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.active;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                        isActive
                          ? 'bg-pink-50 text-pink-600 shadow-2xs font-extrabold'
                          : 'text-zinc-600 hover:bg-pink-50/50 hover:text-pink-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-pink-600 stroke-[2.5]' : 'text-zinc-500 stroke-[2]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-600">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Help Widget */}
        <div className="p-4 border-t border-pink-100/60 bg-[#fff9fb]">
          <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-pink-50 to-rose-50/80 border border-pink-200/80 shadow-2xs overflow-hidden text-center space-y-2">
            
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-black text-pink-600">Butuh Bantuan?</h4>
              <p className="text-[10px] text-zinc-500 leading-tight">
                Tim BloxyLucy siap membantu kamu!
              </p>
            </div>

            <a
              href={`https://wa.me/${csPhone}?text=Halo%20Admin%20BloxyLucy,%20saya%20butuh%20bantuan`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded-xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-500 hover:text-white text-[11px] font-bold shadow-2xs transition-colors gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Admin</span>
            </a>
          </div>

          <div className="mt-2 flex items-center justify-between pt-2 border-t border-pink-100/60 px-1">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-pink-600 transition-colors"
            >
              <span>Lihat Toko</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/admin/login';
              }}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              title="Keluar dari Admin"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AdminSidebar(props: AdminSidebarProps) {
  return (
    <Suspense fallback={
      <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-pink-100 hidden lg:block" />
    }>
      <SidebarInner {...props} />
    </Suspense>
  );
}
