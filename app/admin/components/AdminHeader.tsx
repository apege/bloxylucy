'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  LogOut,
  User,
  Hash,
  Clock,
  X
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

interface AutocompleteItem {
  label: string;
  sublabel?: string;
  type: 'order' | 'username' | 'recent';
  value: string;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
    } catch {}
  }, []);

  const saveRecentSearch = (q: string) => {
    try {
      const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('admin_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try { localStorage.removeItem('admin_recent_searches'); } catch {}
  };

  // Fetch autocomplete suggestions from orders API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/orders?q=${encodeURIComponent(searchQuery.trim())}&limit=6`);
        if (res.ok) {
          const json = await res.json();
          const orders: any[] = json.data || [];
          const items: AutocompleteItem[] = [];
          const seenUsernames = new Set<string>();

          for (const o of orders) {
            // Order code match
            if (
              o.order_code &&
              o.order_code.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
              items.push({
                label: `#${o.order_code}`,
                sublabel: `${o.roblox_username} • ${new Intl.NumberFormat('id-ID').format(o.robux)} Robux`,
                type: 'order',
                value: o.order_code,
              });
            }

            // Username match (deduplicated)
            if (
              o.roblox_username &&
              o.roblox_username.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !seenUsernames.has(o.roblox_username)
            ) {
              seenUsernames.add(o.roblox_username);
              items.push({
                label: `@${o.roblox_username}`,
                sublabel: 'Username Roblox',
                type: 'username',
                value: o.roblox_username,
              });
            }

            if (items.length >= 6) break;
          }

          setSuggestions(items);
        }
      } catch {}
      setIsLoading(false);
    }, 220);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setShowDropdown(false);
    setSearchQuery(trimmed);
    setActiveIndex(-1);
    router.push(`/admin/orders?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = suggestions.length > 0 ? suggestions.length : recentSearches.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const val =
        suggestions.length > 0
          ? suggestions[activeIndex]?.value
          : recentSearches[activeIndex];
      if (val) doSearch(val);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const displayRecents = !searchQuery.trim() && recentSearches.length > 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile Sidebar Trigger + Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Pink Hamburger Menu Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-xs transition-colors shrink-0 flex items-center justify-center"
            title="Menu Sidebar"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Search Bar with Autocomplete */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Cari order, username, ID..."
              autoComplete="off"
              className="w-full pl-9 pr-8 py-2 rounded-full border border-pink-200/80 bg-[#fffafc] focus:bg-white text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 transition-all shadow-2xs"
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {showDropdown && (displayRecents || suggestions.length > 0 || isLoading) && (
              <div
                ref={dropdownRef}
                className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-pink-100 rounded-2xl shadow-xl overflow-hidden z-50 text-xs"
              >
                {/* Loading state */}
                {isLoading && (
                  <div className="px-4 py-3 text-zinc-400 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Mencari...</span>
                  </div>
                )}

                {/* Suggestions from API */}
                {!isLoading && suggestions.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      Hasil Pencarian
                    </div>
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => doSearch(item.value)}
                        className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                          activeIndex === idx ? 'bg-pink-50' : 'hover:bg-pink-50/60'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          item.type === 'order' ? 'bg-pink-100 text-pink-600' : 'bg-violet-100 text-violet-600'
                        }`}>
                          {item.type === 'order'
                            ? <Hash className="w-3.5 h-3.5" />
                            : <User className="w-3.5 h-3.5" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-zinc-900 truncate">{item.label}</div>
                          {item.sublabel && (
                            <div className="text-[10px] text-zinc-400 truncate">{item.sublabel}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results */}
                {!isLoading && searchQuery.trim() && suggestions.length === 0 && (
                  <div className="px-4 py-3 text-zinc-400 text-center">
                    Tidak ditemukan untuk &ldquo;<strong className="text-zinc-600">{searchQuery}</strong>&rdquo;
                  </div>
                )}

                {/* Recent Searches */}
                {displayRecents && !searchQuery.trim() && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Pencarian Terakhir
                      </span>
                      <button
                        type="button"
                        onMouseDown={clearRecentSearches}
                        className="text-[10px] font-bold text-pink-400 hover:text-pink-600 cursor-pointer"
                      >
                        Hapus Semua
                      </button>
                    </div>
                    {recentSearches.map((r, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => doSearch(r)}
                        className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                          activeIndex === idx ? 'bg-pink-50' : 'hover:bg-pink-50/60'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-zinc-700 truncate">{r}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Right: Admin Profile Avatar & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 pl-2 border-r border-pink-100 pr-3">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-pink-200 shadow-xs shrink-0">
              <Image
                src="/images/logo.png"
                alt="Admin BloxyLucy"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-black text-zinc-800 leading-tight">
                Admin BloxyLucy
              </span>
              <span className="block text-[10px] text-pink-500 font-bold">
                Super Admin
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/admin/login');
              router.refresh();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
            title="Keluar dari Panel Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
