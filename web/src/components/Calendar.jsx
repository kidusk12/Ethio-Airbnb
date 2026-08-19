import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

/**
 * Compact, reusable Calendar component for EthioStays.
 *
 * Props:
 * - selectedDate: Date | null (for single select)
 * - onSelectDate: (date: Date) => void
 * - rangeStart: Date | null (for range mode)
 * - rangeEnd: Date | null (for range mode)
 * - onSelectRange: ({ start, end }: { start: Date, end: Date | null }) => void
 * - blockedDates: Date[] | string[]
 * - onToggleDate: (date: Date) => void (for host block/unblock mode)
 * - minDate: Date | null (defaults to today)
 * - position: 'top' | 'bottom' | 'inline' (default: 'inline')
 * - compact: boolean (default: true)
 * - className: string
 */
export const Calendar = ({
  selectedDate = null,
  onSelectDate,
  rangeStart = null,
  rangeEnd = null,
  onSelectRange,
  blockedDates = [],
  onToggleDate,
  minDate = new Date(),
  position = 'inline',
  compact = true,
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate instanceof Date && !isNaN(selectedDate)) return new Date(selectedDate);
    if (rangeStart instanceof Date && !isNaN(rangeStart)) return new Date(rangeStart);
    return new Date();
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const resetToToday = () => {
    setCurrentMonth(new Date());
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = d1 instanceof Date ? d1 : new Date(d1);
    const date2 = d2 instanceof Date ? d2 : new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isDateBlocked = (date) => {
    return blockedDates.some((b) => isSameDay(b, date));
  };

  const isDateInRange = (date) => {
    if (!rangeStart || !rangeEnd) return false;
    const time = date.getTime();
    const start = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate()).getTime();
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate()).getTime();
    return time > start && time < end;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (onToggleDate) {
      onToggleDate(clickedDate);
      return;
    }

    if (onSelectRange) {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        onSelectRange({ start: clickedDate, end: null });
      } else if (rangeStart && !rangeEnd) {
        if (clickedDate < rangeStart) {
          onSelectRange({ start: clickedDate, end: rangeStart });
        } else {
          onSelectRange({ start: rangeStart, end: clickedDate });
        }
      }
      return;
    }

    if (onSelectDate) {
      onSelectDate(clickedDate);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const days = [];
  const monthName = currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
  const today = new Date();

  // Empty preceding cells
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="w-7 h-7" />);
  }

  // Month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isToday = isSameDay(date, today);
    const isPast = minDate ? date < new Date(minDate.setHours(0, 0, 0, 0)) : false;
    const isSelected = isSameDay(date, selectedDate);
    const isRangeStart = isSameDay(date, rangeStart);
    const isRangeEnd = isSameDay(date, rangeEnd);
    const inRange = isDateInRange(date);
    const blocked = isDateBlocked(date);

    let dayClasses = 'w-7 h-7 text-[12px] flex items-center justify-center rounded-lg transition-all select-none ';

    if (blocked) {
      dayClasses += 'bg-red-50 text-primary line-through font-medium border border-primary/20 hover:bg-red-100 cursor-pointer ';
    } else if (isSelected || isRangeStart || isRangeEnd) {
      dayClasses += 'bg-primary text-white font-semibold shadow-sm scale-105 ';
    } else if (inRange) {
      dayClasses += 'bg-primary/10 text-primary font-medium rounded-none ';
    } else if (isToday) {
      dayClasses += 'border border-primary/40 text-primary font-bold hover:bg-primary/10 ';
    } else if (isPast) {
      dayClasses += 'text-gray-300 cursor-not-allowed ';
    } else {
      dayClasses += 'text-foreground hover:bg-gray-100 cursor-pointer ';
    }

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => (!isPast || onToggleDate) && handleDateClick(day)}
        disabled={isPast && !onToggleDate}
        className={dayClasses}
        title={date.toDateString()}
      >
        {day}
      </button>
    );
  }

  const positionClasses =
    position === 'bottom'
      ? 'absolute top-full left-0 mt-2 z-[100]'
      : position === 'top'
      ? 'absolute bottom-full left-0 mb-2 z-[100]'
      : 'relative';

  return (
    <div
      className={`${positionClasses} bg-white rounded-xl shadow-lg border border-border p-3 w-[245px] text-foreground font-sans ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[13px] tracking-tight">{monthName}</span>
          <button
            type="button"
            onClick={resetToToday}
            title="Go to current month"
            className="text-muted-foreground hover:text-primary transition-colors p-0.5"
          >
            <RotateCcw size={11} />
          </button>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="w-7 text-[10px] font-semibold text-muted-foreground uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 justify-items-center">{days}</div>

      {/* Mini legend / helper */}
      {blockedDates.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-border/70 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary/20 border border-primary inline-block" /> Blocked
          </span>
          <span className="font-medium text-foreground">{blockedDates.length} days blocked</span>
        </div>
      )}
    </div>
  );
};

export default Calendar;
