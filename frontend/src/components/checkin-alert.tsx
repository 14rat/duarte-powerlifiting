import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";
import { WeeklyCheckinModal } from "./weekly-checkin-modal";
import { getWeekStart, formatDateToLocal } from "@/lib/date-utils";

function getWeekEndDate(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

function isCheckinAvailable() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check-in aparece apenas no sábado e domingo
  if (dayOfWeek === 6) {
    // Sábado - check-in disponível o dia todo
    return true;
  } else if (dayOfWeek === 0) {
    // Domingo - check-in disponível até 23:59
    const currentHour = today.getHours();
    return currentHour <= 23; // Disponível até as 23:59
  }
  
  return false;
}

export function CheckinAlert() {
  const [showModal, setShowModal] = useState(false);
  
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  const currentWeekEnd = getWeekEndDate(currentWeekStart);
  const weekStartString = formatDateToLocal(currentWeekStart);

  const { data: checkins = [] } = useQuery<any[]>({
    queryKey: ['/api/weekly-checkins'],
  });

  // Check if current week's checkin exists and is completed
  const currentWeekCheckin = checkins.find(checkin => 
    checkin.weekStartDate === weekStartString
  );

  const hasCompletedThisWeek = currentWeekCheckin?.completed;
  
  // Only show alert on Saturday or Sunday (until 23:59)
  if (!isCheckinAvailable()) {
    return null;
  }

  // Don't show if already completed
  if (hasCompletedThisWeek) {
    return (
      <Card className="mb-4 bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-400/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-green-400">Check-in Concluído</h3>
              <p className="text-xs text-green-300/80">Obrigado pelo feedback desta semana!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUrgent = today.getDay() === 0; // Sunday - último dia para responder

  return (
    <>
      <Card className={`mb-4 border-l-4 ${isUrgent ? 'bg-gradient-to-r from-red-900/40 to-red-800/20 border-red-400 border-l-red-400' : 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border-yellow-400 border-l-yellow-400'} shadow-lg`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isUrgent ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
              <MessageSquare className={`w-6 h-6 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-lg font-bold ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`}>
                  Check-in Semanal
                </h3>
                {isUrgent && (
                  <Badge variant="destructive" className="text-xs px-2 py-1 bg-red-500/20 text-red-300 border-red-400/50">
                    ÚLTIMO DIA
                  </Badge>
                )}
              </div>
              
              <p className={`text-sm mb-4 ${isUrgent ? 'text-red-200' : 'text-yellow-200'}`}>
                {isUrgent ? (
                  "Hoje é o último dia! Você tem até 23:59 para completar seu check-in semanal."
                ) : (
                  "Check-in semanal disponível! Conte para seu treinador como foi sua semana."
                )}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentWeekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {currentWeekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ~3 minutos
                  </span>
                </div>
                
                <Button
                  onClick={() => setShowModal(true)}
                  className={`w-full sm:w-auto ${isUrgent ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-black'} font-semibold shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  <span className="mr-2">Fazer Check-in</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <WeeklyCheckinModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        weekStartDate={weekStartString}
      />
    </>
  );
}