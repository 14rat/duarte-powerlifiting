import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar as CalendarIcon, Dumbbell, TrendingUp, Target, CheckCircle, Clock } from "lucide-react";
import { Logo } from "@/components/logo";
import { ParallaxBackground } from "@/components/parallax-background";
import { WorkoutDetailModal } from "@/components/workout-detail-modal";
import { createLocalDate, isSameLocalDate, formatDateBR } from "@/lib/date-utils";

export default function StudentProfile() {
  const [, params] = useRoute("/student/:id");
  const [, setLocation] = useLocation();
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const studentId = params?.id;

  const { data: student } = useQuery({
    queryKey: ["/api/students", studentId],
    queryFn: () => fetch(`/api/students/${studentId}`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!studentId
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["/api/workouts", "student", studentId],
    queryFn: () => fetch(`/api/workouts?studentId=${studentId}`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!studentId
  });

  if (!studentId || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Aluno não encontrado</h1>
          <Button onClick={() => setLocation("/")} className="bg-yellow-400 text-black">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const completedWorkouts = workouts.filter((w: any) => w.status === 'completed').length;
  const upcomingWorkouts = workouts.filter((w: any) => {
    const workoutDate = createLocalDate(w.date);
    const today = new Date();
    return workoutDate >= today && w.status === 'scheduled';
  }).length;

  return (
    <div className="min-h-screen text-white relative">
      <ParallaxBackground />
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-yellow-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:bg-yellow-400/10 px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
                  <Logo className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-yellow-400">Duarte Powerlifting</h1>
                  <p className="text-xs text-yellow-400/60">PERFIL DO ALUNO</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-black font-bold">
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">{student.firstName} {student.lastName}</p>
                <p className="text-xs text-yellow-400">{student.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Treinos Concluídos</p>
                  <p className="text-3xl font-bold text-yellow-400">{completedWorkouts}</p>
                  <p className="text-xs text-green-400">Total</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <CheckCircle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Próximos Treinos</p>
                  <p className="text-3xl font-bold text-yellow-400">{upcomingWorkouts}</p>
                  <p className="text-xs text-blue-400">Agendados</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Treinos</p>
                  <p className="text-3xl font-bold text-yellow-400">{workouts.length}</p>
                  <p className="text-xs text-blue-400">Prescritos</p>
                </div>
                <div className="p-3 bg-yellow-400/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-600 p-1 rounded-xl backdrop-blur-sm mb-6 h-12">
            <TabsTrigger 
              value="workouts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-300 rounded-lg transition-all duration-300 font-medium"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Treinos
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-300 rounded-lg transition-all duration-300 font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              Informações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-0">
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2" />
                  Treinos Prescritos ({workouts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workouts.length > 0 ? (
                    workouts.map((workout: any) => (
                      <div
                        key={workout.id}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-600 hover:border-yellow-400/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">
                              Data: {formatDateBR(workout.date)}
                            </p>
                            {workout.notes && (
                              <p className="text-gray-300 text-sm mt-2">Observações: {workout.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                              workout.status === 'completed' 
                                ? 'bg-green-400/20 text-green-400' 
                                : workout.status === 'in_progress'
                                ? 'bg-blue-400/20 text-blue-400'
                                : 'bg-yellow-400/20 text-yellow-400'
                            }`}>
                              {workout.status === 'completed' ? 'Concluído' 
                               : workout.status === 'in_progress' ? 'Em Andamento'
                               : 'Agendado'}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedWorkout(workout)}
                              className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 text-xs"
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg">Nenhum treino encontrado</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Este aluno ainda não possui treinos prescritos
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações do Aluno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Nome Completo</p>
                      <p className="text-white font-medium">{student.firstName} {student.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white">{student.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Tipo de Conta</p>
                      <p className="text-yellow-400 font-medium capitalize">{student.role}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Data de Cadastro</p>
                      <p className="text-white">
                        {student.createdAt ? formatDateBR(student.createdAt) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Última Atualização</p>
                      <p className="text-white">
                        {student.updatedAt ? formatDateBR(student.updatedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        workout={selectedWorkout}
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
    </div>
  );
}