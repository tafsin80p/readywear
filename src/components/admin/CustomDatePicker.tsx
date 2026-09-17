"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CustomDatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  className?: string;
}

export function CustomDatePicker({ selectedDate, onSelect, className = "" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  
  // Set current month to selected date if exists
  useEffect(() => {
    if (selectedDate && isOpen) {
      setCurrentMonth(new Date(selectedDate));
    } else if (!selectedDate && isOpen) {
      setCurrentMonth(new Date());
    }
  }, [selectedDate, isOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // adjust for timezone offset to prevent picking the day before
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    onSelect(adjustedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const displayDateText = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl w-fit group hover:bg-white/20 transition-colors cursor-pointer overflow-hidden"
      >
        <CalendarIcon className="w-5 h-5 text-white" />
        <div>
          <p className="text-[10px] font-bold text-pink-100 uppercase tracking-wider">
            {selectedDate ? "Selected Date" : "Today's Date"}
          </p>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            {displayDateText} 
            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 px-1.5 py-0.5 rounded ml-1">Change</span>
          </p>
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 w-72 origin-top-left animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-[#1a2b4b]">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-[11px] font-bold text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12).toISOString().split('T')[0];
              const isSelected = selectedDate === dateString;
              const isToday = !selectedDate && day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
              
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isSelected ? 'bg-[#F5426A] text-white shadow-md shadow-pink-200' : 
                      isToday ? 'bg-pink-50 text-[#F5426A]' : 
                      'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          {selectedDate && (
            <button 
              onClick={() => {
                onSelect("");
                setIsOpen(false);
              }}
              className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-[#F5426A] transition-colors py-1"
            >
              Clear Selection
            </button>
          )}

        </div>
      )}
    </div>
  );
}
