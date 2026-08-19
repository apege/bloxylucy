'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Sparkles
} from 'lucide-react';

interface CustomDateTimePickerProps {
  value: string; // ISO string or empty
  onChange: (isoString: string) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CustomDateTimePicker({
  value,
  onChange,
}: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsed current date/time
  const initialDate = value ? new Date(value) : new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedHour, setSelectedHour] = useState(initialDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState(initialDate.getMinutes());

  // Current view month & year for browsing calendar
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth());
        setSelectedDay(d.getDate());
        setSelectedHour(d.getHours());
        setSelectedMinute(d.getMinutes());
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const emitChange = (y: number, m: number, d: number, h: number, min: number) => {
    const newDate = new Date(y, m, d, h, min, 0);
    onChange(newDate.toISOString());
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedYear(viewYear);
    setSelectedMonth(viewMonth);
    setSelectedDay(day);
    emitChange(viewYear, viewMonth, day, selectedHour, selectedMinute);
  };

  const handleApplyPreset = (daysToAdd: number, hours: number = 23, minutes: number = 59) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    target.setHours(hours, minutes, 0, 0);

    setSelectedYear(target.getFullYear());
    setSelectedMonth(target.getMonth());
    setSelectedDay(target.getDate());
    setSelectedHour(hours);
    setSelectedMinute(minutes);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());

    emitChange(target.getFullYear(), target.getMonth(), target.getDate(), hours, minutes);
    setIsOpen(false);
  };

  const handleApplyEndOfMonth = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 0);

    setSelectedYear(endOfMonth.getFullYear());
    setSelectedMonth(endOfMonth.getMonth());
    setSelectedDay(endOfMonth.getDate());
    setSelectedHour(23);
    setSelectedMinute(59);
    setViewYear(endOfMonth.getFullYear());
    setViewMonth(endOfMonth.getMonth());

    emitChange(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate(), 23, 59);
    setIsOpen(false);
  };

  // Calendar Calculation
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Format label for display input
  const formatDisplay = () => {
    if (!value) return 'Pilih Waktu Berakhir Promo';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return 'Pilih Waktu Berakhir Promo';
      const day = d.getDate();
      const month = MONTH_NAMES[d.getMonth()];
      const year = d.getFullYear();
      const h = d.getHours().toString().padStart(2, '0');
      const min = d.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year} • ${h}:${min} WIB`;
    } catch {
      return 'Pilih Waktu Berakhir Promo';
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      
      {/* Trigger Button / Input Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-2xl border border-pink-200 bg-[#fffcfd] hover:border-pink-300 transition-all cursor-pointer flex items-center justify-between shadow-2xs group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-100/70 text-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-zinc-900 block">
              {formatDisplay()}
            </span>
            <span className="text-[10px] text-pink-500 font-semibold">
              Klik untuk mengatur tanggal &amp; jam hitung mundur
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
            {isOpen ? 'Tutup' : 'Ubah'}
          </span>
        </div>
      </div>

      {/* Popover Dropdown (Custom BloxyLucy Theme) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[380px] rounded-3xl bg-white border border-pink-200 shadow-2xl p-5 space-y-4 animate-fadeIn">
          
          {/* Quick Presets Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleApplyPreset(3)}
              className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              +3 Hari
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(7)}
              className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              +7 Hari
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(14)}
              className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              +14 Hari
            </button>
            <button
              type="button"
              onClick={handleApplyEndOfMonth}
              className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-pink-500 hover:bg-pink-600 text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              Akhir Bulan
            </button>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-sm font-black text-zinc-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg border border-pink-100 bg-pink-50/50 hover:bg-pink-100 text-pink-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg border border-pink-100 bg-pink-50/50 hover:bg-pink-100 text-pink-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_NAMES.map((d, i) => (
              <span
                key={d}
                className={`text-[10px] font-extrabold ${
                  i === 0 ? 'text-rose-500' : 'text-zinc-400'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Prev month fill */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-[11px] text-zinc-300 font-medium select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                selectedDay === dayNum &&
                selectedMonth === viewMonth &&
                selectedYear === viewYear;

              const today = new Date();
              const isToday =
                today.getDate() === dayNum &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              return (
                <button
                  key={`cur-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black shadow-sm shadow-pink-500/30 scale-105'
                      : isToday
                      ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100'
                      : 'text-zinc-700 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section */}
          <div className="pt-3 border-t border-pink-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-zinc-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-500" />
                <span>Atur Jam &amp; Menit Berakhir</span>
              </span>
              <span className="text-[11px] font-mono font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')} WIB
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Hour selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400">Jam (00 - 23)</span>
                <select
                  value={selectedHour}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10);
                    setSelectedHour(h);
                    emitChange(selectedYear, selectedMonth, selectedDay, h, selectedMinute);
                  }}
                  className="w-full p-2 rounded-xl border border-pink-200 text-xs font-mono font-bold text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')} : 00
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400">Menit (00 - 59)</span>
                <select
                  value={selectedMinute}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10);
                    setSelectedMinute(m);
                    emitChange(selectedYear, selectedMonth, selectedDay, selectedHour, m);
                  }}
                  className="w-full p-2 rounded-xl border border-pink-200 text-xs font-mono font-bold text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  {[0, 15, 30, 45, 50, 55, 59].map((m) => (
                    <option key={m} value={m}>
                      Menit {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Close / Apply */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                emitChange(selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute);
                setIsOpen(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Terapkan Waktu Promo</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
