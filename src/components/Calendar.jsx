import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Calendar = ({ isOwner }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { calendarEntries, setCalendarStatus } = useAppStore();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getStatusForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = (calendarEntries || []).find((e) => e.entry_date === dateStr);
    return entry ? entry.status : 'none';
  };

  const handleCellClick = (day) => {
    if (!isOwner) return;
    const dateStr = format(day, 'yyyy-MM-dd');
    const currentStatus = getStatusForDate(day);

    const statusCycle = {
      none: 'green',
      green: 'yellow',
      yellow: 'red',
      red: 'none'
    };

    const nextStatus = statusCycle[currentStatus] || 'green';
    setCalendarStatus(dateStr, nextStatus);
  };

  const statusStyles = {
    green: {
      bgColor: 'var(--color-green-light)',
      borderColor: 'var(--color-green)',
      dotColor: 'var(--color-green)',
      textColor: '#065f46'
    },
    yellow: {
      bgColor: 'var(--color-yellow-light)',
      borderColor: 'var(--color-yellow)',
      dotColor: 'var(--color-yellow)',
      textColor: '#92400e'
    },
    red: {
      bgColor: 'var(--color-red-light)',
      borderColor: 'var(--color-red)',
      dotColor: 'var(--color-red)',
      textColor: '#991b1b'
    },
    none: {
      bgColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      dotColor: 'transparent',
      textColor: 'var(--color-text-main)'
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{format(currentMonth, 'MMMM yyyy')}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {isOwner ? 'Tap date to toggle status' : 'Schedule View (Read-only)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <button onClick={goToToday} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--border-radius-full)', width: 'auto' }}>
            Today
          </button>
          <button onClick={prevMonth} style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} style={{ padding: '0.35rem', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid - Clean Heatmap Styling (Pills Removed) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const status = getStatusForDate(day);
          const style = statusStyles[status] || statusStyles.none;

          return (
            <div
              key={day.toString()}
              onClick={() => handleCellClick(day)}
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                border: isDayToday ? '2px solid var(--color-primary)' : `1.5px solid ${style.borderColor}`,
                backgroundColor: isCurrentMonth ? style.bgColor : 'var(--color-background)',
                opacity: isCurrentMonth ? 1 : 0.35,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'center',
                position: 'relative',
                cursor: isOwner ? 'pointer' : 'default',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: isDayToday ? '0 0 12px var(--color-primary-light)' : 'none'
              }}
            >
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: isDayToday ? 800 : 600,
                color: style.textColor 
              }}>
                {format(day, 'd')}
              </span>

              {/* Glowing Color Dot Indicator */}
              {status !== 'none' && (
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: style.dotColor,
                  boxShadow: `0 0 8px ${style.dotColor}`
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
