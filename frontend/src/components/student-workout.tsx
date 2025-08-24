import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Target, Dumbbell, CheckCircle, Play } from "lucide-react";
import { ExerciseDetail } from "@/pages/exercise-detail";
import { useToast } from "@/hooks/use-toast";
import { formatDateBR, createLocalDate } from "@/lib/date-utils";

interface StudentWorkoutProps {
  workout: any;
  onBack: () => void;
}

export function StudentWorkout({ workout, onBack }: StudentWorkoutProps) {
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['/api/exercises', workout.id],
    queryFn: async () => {
      const exercisesResponse = await fetch(`/api/exercises?workoutId=${workout.id}`);
      const exercisesData = await exercisesResponse.json();
      return exercisesData;
    },
    enabled: !!workout.id
  });

  // Separar a busca de resultados para evitar waterfall de requests
  const { data: allResults = {} } = useQuery({
    queryKey: ['/api/exercise-results', workout.id, exercises?.length],
    queryFn: async () => {
      if (!exercises || exercises.length === 0) return {};
      
      const resultsPromises = exercises.map(async (exercise: any) => {
        const response = await fetch(`/api/exercises/${exercise.id}/results`);
        const results = await response.json();
        return { [exercise.id]: results || [] };
      });
      
      const resultsArray = await Promise.all(resultsPromises);
      return resultsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: !!exercises && exercises.length > 0
  });

  // Combinar exercícios com resultados
  const exercisesWithResults = exercises?.map((exercise: any) => ({
    ...exercise,
    results: allResults[exercise.id] || []
  })) || [];

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workouts/${workout.id}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete workout');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Treino Concluído!",
        description: "Parabéns! Você finalizou o treino com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      onBack();
    },
    onError: () => {
      toast({
        title: "Erro ao finalizar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const allExercisesCompleted = exercisesWithResults && exercisesWithResults.length > 0 && exercisesWithResults.every((ex: any) => {
    // Check if exercise has results recorded (at least one set)
    return ex.results && ex.results.length > 0;
  });

  // If an exercise is selected, show the exercise detail component
  if (selectedExercise) {
    return (
      <ExerciseDetail 
        exercise={selectedExercise}
        onBack={() => {
          setSelectedExercise(null);
          // Invalidate queries to refresh exercise data when coming back
          queryClient.invalidateQueries({ queryKey: ['/api/exercises', workout.id] });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-yellow-400/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-yellow-400 hover:bg-yellow-400/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Dashboard
            </Button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-yellow-400">{workout.name}</h1>
              <p className="text-sm text-gray-400">
                {formatDateBR(workout.date)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">Status</p>
              <p className={`font-medium capitalize ${
                workout.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {workout.status === 'completed' ? 'Concluído' : 
                 workout.status === 'in_progress' ? 'Em Andamento' : 'Agendado'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Workout Progress Card */}
        {(() => {
          const completedExercises = exercisesWithResults?.filter((ex: any) => ex.results && ex.results.length > 0).length || 0;
          const totalExercises = exercisesWithResults?.length || 0;
          const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
          
          return (
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-400/30 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      progressPercentage === 100 ? 'bg-green-500' : 
                      progressPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}>
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{workout.name}</h3>
                      <p className="text-sm text-gray-300">
                        {formatDateBR(workout.date)} • {completedExercises} de {totalExercises} exercícios
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      progressPercentage === 100 ? 'text-green-400' : 
                      progressPercentage > 0 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {progressPercentage}%
                    </div>
                    <div className={`text-sm ${
                      workout.status === 'completed' ? 'text-green-300' : 
                      workout.status === 'in_progress' ? 'text-yellow-300' : 'text-gray-400'
                    }`}>
                      {workout.status === 'completed' ? 'Concluído' : 
                       workout.status === 'in_progress' ? 'Em Andamento' : 'Agendado'}
                    </div>
                  </div>
                </div>
                {workout.notes && (
                  <div className="mt-4 p-3 bg-black/20 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="text-yellow-400 font-medium">Observações:</span> {workout.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Exercises List */}
        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Dumbbell className="w-5 h-5 mr-2" />
              Exercícios ({exercisesWithResults?.length || 0})
              {exercisesLoading && (
                <div className="ml-2 animate-spin rounded-full h-4 w-4 border border-yellow-400 border-t-transparent"></div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exercisesLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-gray-800/30 rounded-lg border border-gray-700 animate-pulse">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-lg flex-shrink-0"></div>
                        <div>
                          <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 sm:h-4 w-32 sm:w-48 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-700 rounded ml-auto sm:ml-0"></div>
                    </div>
                  </div>
                ))
              ) : exercisesWithResults && exercisesWithResults.length > 0 ? (
                exercisesWithResults.map((exercise: any, index: number) => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-600 hover:border-yellow-400/50 hover:bg-gray-800/70 transition-all cursor-pointer group"
                  >
                    {/* Mobile-first responsive layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors flex-shrink-0">
                          <span className="text-yellow-400 font-bold text-sm sm:text-base">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-white truncate">{exercise.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-400 mt-1">
                            <span className="flex items-center">
                              <span className="font-medium">{exercise.sets}</span>
                              <span className="ml-1">séries</span>
                            </span>
                            <span className="flex items-center">
                              <span className="font-medium">{exercise.reps}</span>
                              <span className="ml-1">reps</span>
                            </span>
                            <span className="flex items-center">
                              <span className="font-medium">RPE {exercise.plannedRpe}</span>
                            </span>
                            {exercise.restTime && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="font-medium">
                                  {Math.floor(exercise.restTime / 60)}:{(exercise.restTime % 60).toString().padStart(2, '0')}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status - Mobile responsive */}
                      <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-2 sm:space-x-0">
                        <p className="text-xs sm:text-sm text-gray-400 sm:mb-1">Status</p>
                        <div className="flex items-center space-x-2">
                          {exercise.results && exercise.results.length > 0 ? (
                            <div className="flex items-center text-green-400">
                              <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium">Concluído</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-400">
                              <Play className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">Iniciar</span>
                            </div>
                          )}
                          <div className={`w-3 h-3 rounded-full transition-all flex-shrink-0 ${
                            exercise.results && exercise.results.length > 0 
                              ? 'bg-green-400 opacity-100' 
                              : 'bg-yellow-400 opacity-0 group-hover:opacity-100'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">Nenhum exercício encontrado</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Os exercícios podem ainda não ter sido adicionados pelo seu treinador
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {exercisesWithResults && exercisesWithResults.length > 0 && (
          <div className="mt-6">
            {workout.status === 'completed' ? (
              <Card className="bg-green-900/20 border border-green-400/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center text-green-400 mb-2">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Treino Concluído com Sucesso!</span>
                  </div>
                  <p className="text-gray-300 text-center text-sm">
                    Clique nos exercícios acima para revisar seus resultados
                  </p>
                </CardContent>
              </Card>
            ) : allExercisesCompleted ? (
              <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-400/30">
                <CardContent className="pt-4 text-center">
                  <p className="text-green-300 mb-3 font-medium">Parabéns! Todos os exercícios foram concluídos.</p>
                  <Button
                    onClick={() => completeWorkoutMutation.mutate()}
                    disabled={completeWorkoutMutation.isPending}
                    className="bg-green-500 text-white hover:bg-green-600 font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {completeWorkoutMutation.isPending ? 'Finalizando...' : 'Finalizar Treino'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800/30 border border-gray-600/50">
                <CardContent className="pt-4">
                  <p className="text-gray-400 text-center text-sm">
                    💪 Clique nos exercícios acima para registrar seus resultados
                  </p>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-500">
                      {exercisesWithResults?.filter((ex: any) => ex.results && ex.results.length > 0).length || 0} de {exercisesWithResults?.length || 0} concluídos
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}