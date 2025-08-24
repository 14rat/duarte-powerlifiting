import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Clock, Users, AlertCircle, CheckCircle2, X } from "lucide-react";
import { format, isAfter, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateToLocal, createLocalDate } from "@/lib/date-utils";

interface CheckinNotification {
  id: string;
  type: 'missing_checkin' | 'overdue_checkin' | 'pain_report' | 'low_scores';
  studentId: number;
  studentName: string;
  message: string;
  weekStartDate: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export const CheckinNotificationSystem = React.memo(() => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ['/api/students'],
  });

  const { data: checkinsData } = useQuery({
    queryKey: ['/api/weekly-checkins'],
  });

  // Handle both array and object responses from the API
  const allCheckins = useMemo(() => {
    return Array.isArray(checkinsData) ? checkinsData : (checkinsData as any)?.checkins || [];
  }, [checkinsData]);

  // Cache current date calculations to prevent recalculation on every render
  const dateConstants = useMemo(() => {
    const now = new Date();
    const currentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekString = formatDateToLocal(currentWeek);
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const threeWeeksAgo = Date.now() - 21 * 24 * 60 * 60 * 1000;
    const currentDay = now.getDay();
    
    return {
      currentWeek,
      currentWeekString,
      twoWeeksAgo,
      threeWeeksAgo,
      currentDay,
      showMissingAlert: currentDay >= 5 // Friday onwards
    };
  }, []); // Empty dependency array - only calculate once per component mount

  // Generate notifications efficiently
  const notifications = useMemo(() => {
    if (!students.length || !allCheckins.length) return [];

    const newNotifications: CheckinNotification[] = [];

    students.forEach((student: any) => {
      const studentCheckins = allCheckins.filter((c: any) => c.studentId === student.id);
      
      // Check for missing current week check-in
      if (dateConstants.showMissingAlert) {
        const currentWeekCheckin = studentCheckins.find((c: any) => 
          c.weekStartDate === dateConstants.currentWeekString
        );

        if (!currentWeekCheckin) {
          newNotifications.push({
            id: `missing-${student.id}-${dateConstants.currentWeekString}`,
            type: 'missing_checkin',
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            message: `${student.firstName} ainda não fez o check-in desta semana`,
            weekStartDate: dateConstants.currentWeekString,
            priority: dateConstants.currentDay === 0 ? 'high' : 'medium',
            createdAt: dateConstants.currentWeek
          });
        }
      }

      // Check for pain reports in recent check-ins
      const recentPainReports = studentCheckins.filter((c: any) => 
        c.painLevel && c.painLevel !== 'nenhuma' &&
        createLocalDate(c.createdAt).getTime() > dateConstants.twoWeeksAgo
      );

      if (recentPainReports.length > 0) {
        const latestPainReport = recentPainReports[0];
        newNotifications.push({
          id: `pain-${student.id}-${latestPainReport.weekStartDate}`,
          type: 'pain_report',
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          message: `${student.firstName} reportou dor em ${recentPainReports.length} check-in(s) recente(s)`,
          weekStartDate: latestPainReport.weekStartDate,
          priority: 'high',
          createdAt: createLocalDate(latestPainReport.createdAt)
        });
      }

      // Check for consistently low scores
      const recentCheckins = studentCheckins.filter((c: any) => 
        new Date(c.createdAt).getTime() > dateConstants.threeWeeksAgo
      );

      if (recentCheckins.length >= 2) {
        const totalCheckins = recentCheckins.length;
        const averages = {
          muscularRecovery: recentCheckins.reduce((sum: number, c: any) => sum + (c.muscularRecovery || 0), 0) / totalCheckins,
          mentalState: recentCheckins.reduce((sum: number, c: any) => sum + (c.mentalState || 0), 0) / totalCheckins,
          sleepQuality: recentCheckins.reduce((sum: number, c: any) => sum + (c.sleepQuality || 0), 0) / totalCheckins,
        };

        const lowScores = Object.entries(averages).filter(([_, avg]) => avg < 5);
        
        if (lowScores.length >= 2) {
          const latestCheckin = recentCheckins[0];
          newNotifications.push({
            id: `low-scores-${student.id}-${latestCheckin.weekStartDate}`,
            type: 'low_scores',
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            message: `${student.firstName} tem pontuações baixas em ${lowScores.length} categorias`,
            weekStartDate: latestCheckin.weekStartDate,
            priority: 'medium',
            createdAt: new Date(latestCheckin.createdAt)
          });
        }
      }
    });

    // Filter out dismissed notifications
    return newNotifications.filter(n => !dismissed.has(n.id));
  }, [students, allCheckins, dateConstants, dismissed]);

  const dismissNotification = useCallback((id: string) => {
    setDismissed(prev => new Set([...Array.from(prev), id]));
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-900/20';
      case 'medium': return 'border-yellow-500/50 bg-yellow-900/20';
      case 'low': return 'border-gray-500/50 bg-gray-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  }, []);

  const getPriorityIcon = useCallback((type: string, priority: string) => {
    switch (type) {
      case 'missing_checkin':
      case 'overdue_checkin':
        return <Calendar className="w-4 h-4" />;
      case 'pain_report':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'low_scores':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  }, []);

  if (notifications.length === 0) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <h3 className="text-sm font-semibold text-green-400">Tudo em ordem!</h3>
              <p className="text-xs text-green-300/80">Nenhuma notificação de check-in pendente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-yellow-400">
          Notificações de Check-in ({notifications.length})
        </h3>
      </div>
      
      {notifications.map(notification => (
        <Card key={notification.id} className={`${getPriorityColor(notification.priority)} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getPriorityIcon(notification.type, notification.priority)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">
                    {notification.studentName}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      notification.priority === 'high' ? 'border-red-500 text-red-400' :
                      notification.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                      'border-gray-500 text-gray-400'
                    }`}
                  >
                    {notification.priority.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-300 mb-2">
                  {notification.message}
                </p>
                
                <p className="text-xs text-gray-500">
                  Semana de {format(new Date(notification.weekStartDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 p-1 h-auto w-auto text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});