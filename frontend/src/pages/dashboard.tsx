import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/calendar";
import { WorkoutModal } from "@/components/workout-modal";
import { InviteModal } from "@/components/invite-modal";
import { WorkoutDetailModal } from "@/components/workout-detail-modal";
import { ParallaxBackground } from "@/components/parallax-background";
import { Users, Plus, Calendar as CalendarIcon, LogOut, Dumbbell, Target, TrendingUp, Eye, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { StudentCheckins } from "@/components/student-checkins";
import { CheckinAlert } from "@/components/checkin-alert";
import { CheckinNotificationSystem } from "@/components/checkin-notification-system";

import { formatDateToLocal, isSameLocalDate, getWeekStart, createLocalDate } from "@/lib/date-utils";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showStudentCheckins, setShowStudentCheckins] = useState<{ studentId: number; studentName: string } | null>(null);


  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/students"],
  });

  const { data: workouts = [] } = useQuery<any[]>({
    queryKey: ["/api/workouts"],
  });

  // Filter workouts based on selected student - memoized for performance
  const filteredWorkouts = useMemo(() => {
    return selectedStudentId 
      ? workouts.filter((w: any) => w.studentId === selectedStudentId)
      : workouts;
  }, [workouts, selectedStudentId]);

  const handleDateClick = useCallback((date: Date) => {
    // Use proper date formatting to avoid timezone issues
    const localDateString = formatDateToLocal(date);
    
    const workoutOnDate = filteredWorkouts.find((w: any) => {
      return isSameLocalDate(w.date, localDateString);
    });
    
    if (workoutOnDate) {
      // If workout exists, show workout details/modal
      setSelectedWorkout(workoutOnDate);
    } else {
      // If no workout, open create workout modal
      setSelectedDate(date);
      setShowWorkoutModal(true);
    }
  }, [filteredWorkouts]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete student');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
    },
  });

  const handleDeleteStudent = async (studentId: number) => {
    if (confirm('Tem certeza que deseja excluir este aluno? Todos os dados (treinos, exercícios, resultados) serão perdidos permanentemente.')) {
      try {
        await deleteStudentMutation.mutateAsync(studentId);
      } catch (error) {
        alert('Erro ao excluir aluno: ' + (error as Error).message);
      }
    }
  };

  // Show student checkins view if selected
  if (showStudentCheckins) {
    return (
      <StudentCheckins
        studentId={showStudentCheckins.studentId}
        studentName={showStudentCheckins.studentName}
        onBack={() => setShowStudentCheckins(null)}
      />
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <ParallaxBackground />
      {/* Navigation Header - Mobile Optimized */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-yellow-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <Logo size="sm" className="bg-yellow-400 p-1" />
              <div>
                <h1 className="text-xl font-bold text-yellow-400">Duarte Powerlifting</h1>
                <p className="text-xs text-yellow-400/60">TREINADOR</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black font-bold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-yellow-400">Treinador</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Alunos Ativos</p>
                  <p className="text-3xl font-bold text-yellow-400">{students.length}</p>
                  <p className="text-xs text-green-400">{students.length > 0 ? 'Ativos' : 'Nenhum aluno'}</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Treinos Esta Semana</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {workouts.filter((w: any) => {
                      const today = new Date();
                      const weekStart = getWeekStart(today);
                      const workoutDate = createLocalDate(w.date);
                      return workoutDate >= weekStart;
                    }).length}
                  </p>
                  <p className="text-xs text-blue-400">{workouts.filter((w: any) => w.status === 'completed').length} concluídos</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <CalendarIcon className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Treinos</p>
                  <p className="text-3xl font-bold text-yellow-400">{filteredWorkouts.length}</p>
                  <p className="text-xs text-blue-400">Este mês</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setShowWorkoutModal(true)}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Novo Treino
              </Button>
              <Button 
                onClick={() => setShowInviteModal(true)}
                variant="outline"
                className="w-full border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 font-medium py-3 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Convidar Aluno
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Meus Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.length > 0 ? (
                  students.slice(0, 5).map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors group">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black font-semibold text-sm">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-400">Ativo</div>
                          <div className="text-xs text-gray-400">Treinos prescritos</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowStudentCheckins({ studentId: student.id, studentName: `${student.firstName} ${student.lastName}` })}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2"
                          title="Ver check-ins do aluno"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/student/${student.id}`)}
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 p-2"
                          title="Ver perfil do aluno"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
                          title="Excluir aluno"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-3">Nenhum aluno cadastrado</p>
                    <Button 
                      onClick={() => setShowInviteModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10"
                    >
                      Convidar primeiro aluno
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check-in Notifications for Trainers */}
        {user?.role === "trainer" && (
          <div className="mb-8">
            <CheckinNotificationSystem />
          </div>
        )}

        {/* Calendar Section */}
        <div className="mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Calendário de Treinos
                </div>
                {students.length > 0 && (
                  <select
                    value={selectedStudentId || ''}
                    onChange={(e) => setSelectedStudentId(e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-gray-800 border border-yellow-400/20 text-white rounded px-3 py-1 text-sm focus:outline-none focus:border-yellow-400"
                  >
                    <option value="">Todos os Alunos</option>
                    {students.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar 
                workouts={filteredWorkouts}
                onDateClick={handleDateClick}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <WorkoutModal 
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        selectedDate={selectedDate}
        students={students}
      />
      
      <InviteModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      <WorkoutDetailModal
        workout={selectedWorkout}
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />

      {/* Student Check-ins Modal */}
      {showStudentCheckins && (
        <StudentCheckins
          studentId={showStudentCheckins.studentId}
          studentName={showStudentCheckins.studentName}
          onBack={() => setShowStudentCheckins(null)}
        />
      )}


    </div>
  );
}