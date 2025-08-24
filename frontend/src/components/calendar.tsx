import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createLocalDate, isSameLocalDate } from "@/lib/date-utils";

interface Workout {
  id: number;
  date: string;
  status: string;
  name: string;
}

interface CalendarProps {
  workouts: Workout[];
  onDateClick: (date: Date) => void;
  studentView?: boolean;
}

export function Calendar({ workouts, onDateClick, studentView = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }

    // Next month's days
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day),
      });
    }

    return days;
  };

  const getWorkoutForDate = (date: Date) => {
    return workouts.find(workout => {
      // Use proper date comparison to avoid timezone issues
      return isSameLocalDate(workout.date, date);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'missed':
        return 'bg-red-500';
      case 'scheduled':
      default:
        return 'bg-primary';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <Card className="bg-dark-800 border-dark-700">
      <CardHeader className="border-b border-dark-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Calendário de Treinos</CardTitle>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-dark-700 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-lg font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-dark-700 text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-dark-400 font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayObj, index) => {
            const workout = getWorkoutForDate(dayObj.date);
            const isToday = isSameLocalDate(dayObj.date, today);
            
            return (
              <div
                key={index}
                className={`
                  aspect-square p-2 text-sm cursor-pointer transition-colors rounded-lg relative
                  ${dayObj.isCurrentMonth 
                    ? isToday 
                      ? 'bg-primary text-dark-900 font-semibold' 
                      : 'text-white hover:bg-dark-700'
                    : 'text-dark-500'
                  }
                  ${workout ? 'hover:bg-dark-600' : ''}
                `}
                onClick={() => onDateClick(dayObj.date)}
              >
                <span className="flex items-center justify-center h-full">
                  {dayObj.day}
                </span>
                
                {/* Workout indicator */}
                {workout && (
                  <div className={`
                    absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full
                    ${isToday ? 'bg-dark-900' : getStatusColor(workout.status)}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-dark-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-dark-300">Treino Agendado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-dark-300">Treino Concluído</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-dark-300">Em Progresso</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-dark-300">Treino Perdido</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
