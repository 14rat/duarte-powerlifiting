import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/calendar";
import { StudentWorkout } from "@/components/student-workout";
import { ParallaxBackground } from "@/components/parallax-background";
import { Calendar as CalendarIcon, Dumbbell, TrendingUp, LogOut, Target, Clock, Award, CheckCircle, Edit, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { CheckinAlert } from "@/components/checkin-alert";
import { isSameLocalDate, createLocalDate, formatDateBR } from "@/lib/date-utils";

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const { data: workouts = [] } = useQuery<any[]>({
    queryKey: ["/api/workouts"],
  });

  const handleDateClick = (date: Date) => {
    const workout = workouts.find((w: any) => {
      return isSameLocalDate(w.date, date);
    });
    
    if (workout) {
      setSelectedWorkout(workout);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete account');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Force a logout after successful deletion
      window.location.href = '/';
    },
  });

  const handleDeleteAccount = async () => {
    if (confirm('Tem certeza que deseja excluir sua conta? Todos os seus dados de treino serão perdidos permanentemente. Esta ação não pode ser desfeita.')) {
      try {
        await deleteAccountMutation.mutateAsync();
      } catch (error) {
        alert('Erro ao excluir conta: ' + (error as Error).message);
      }
    }
  };

  const todayWorkout = workouts.find((w: any) => {
    const today = new Date();
    return isSameLocalDate(w.date, today);
  });

  if (selectedWorkout) {
    return (
      <StudentWorkout 
        workout={selectedWorkout}
        onBack={() => setSelectedWorkout(null)}
      />
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <ParallaxBackground />
      {/* Navigation Header - Mobile Optimized */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-yellow-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Logo size="sm" className="bg-yellow-400 p-1" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-yellow-400">Duarte Powerlifting</h1>
                <p className="text-xs text-yellow-400/60 hidden sm:block">ALUNO</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4">
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors px-2 sm:px-3"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black font-bold text-xs sm:text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-white text-sm">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-yellow-400">Aluno</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Weekly Check-in Alert */}
        <CheckinAlert />
        
        {/* Today's Workout Card - Mobile Optimized */}
        {todayWorkout ? (
          <div className="mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/40 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-yellow-400 flex items-center text-lg sm:text-xl">
                  <Target className="w-5 h-5 mr-2" />
                  Treino de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{todayWorkout.name}</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Status: <span className="text-yellow-400 font-medium">{todayWorkout.status === 'scheduled' ? 'Agendado' : 'Em andamento'}</span></p>
                  </div>
                  <Button 
                    onClick={() => setSelectedWorkout(todayWorkout)}
                    className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
                  >
                    Começar Treino
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-6 sm:mb-8">
            <Card className="bg-black/40 backdrop-blur-sm border border-gray-600/20">
              <CardContent className="pt-6">
                <div className="text-center py-6 sm:py-8">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-base sm:text-lg">Nenhum treino agendado para hoje</p>
                  <p className="text-gray-500 text-sm mt-2">Verifique o calendário para os próximos treinos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Treinos Totais</p>
                  <p className="text-3xl font-bold text-yellow-400">{workouts.length}</p>
                  <p className="text-xs text-green-400">Prescritos pelo treinador</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <Dumbbell className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Treinos Concluídos</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {workouts.filter((w: any) => w.status === 'completed').length}
                  </p>
                  <p className="text-xs text-blue-400">Finalizados</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Próximos Treinos</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {workouts.filter((w: any) => {
                      const workoutDate = createLocalDate(w.date);
                      const today = new Date();
                      return workoutDate >= today && w.status === 'scheduled';
                    }).length}
                  </p>
                  <p className="text-xs text-green-400">Agendados</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Tabs Section */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-600 p-1 rounded-xl backdrop-blur-sm mb-6 h-12">
            <TabsTrigger 
              value="calendar"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-300 rounded-lg transition-all duration-300 font-medium"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-300 rounded-lg transition-all duration-300 font-medium"
            >
              <Clock className="w-4 h-4 mr-2" />
              Próximos
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-300 rounded-lg transition-all duration-300 font-medium"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Concluídos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Meus Treinos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar 
                  workouts={workouts}
                  onDateClick={handleDateClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Treinos Agendados ({workouts.filter((w: any) => w.status === 'scheduled').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workouts.filter((w: any) => w.status === 'scheduled').length > 0 ? (
                    workouts.filter((w: any) => w.status === 'scheduled').map((workout: any) => (
                      <div key={workout.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                           onClick={() => setSelectedWorkout(workout)}>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-yellow-400/10 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{workout.name}</p>
                            <p className="text-xs text-gray-400">{formatDateBR(workout.date)}</p>
                            {workout.notes && (
                              <p className="text-xs text-gray-500 mt-1">{workout.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-yellow-400">Agendado</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 text-xs mt-1"
                          >
                            Iniciar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Nenhum treino agendado</p>
                      <p className="text-gray-500 text-sm mt-2">Todos os treinos foram concluídos ou não há treinos disponíveis</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Treinos Concluídos ({workouts.filter((w: any) => w.status === 'completed').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workouts.filter((w: any) => w.status === 'completed').length > 0 ? (
                    workouts.filter((w: any) => w.status === 'completed').map((workout: any) => (
                      <div key={workout.id} className="flex items-center justify-between p-4 rounded-lg bg-green-900/20 border border-green-400/20 hover:bg-green-900/30 transition-colors cursor-pointer"
                           onClick={() => setSelectedWorkout(workout)}>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-400/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{workout.name}</p>
                            <p className="text-xs text-gray-400">{formatDateBR(workout.date)}</p>
                            {workout.notes && (
                              <p className="text-xs text-gray-500 mt-1">{workout.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-400 mb-1">Concluído</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-400/40 text-green-400 hover:bg-green-400/10 text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Revisar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Nenhum treino concluído</p>
                      <p className="text-gray-500 text-sm mt-2">Complete alguns treinos para vê-los aqui</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}