import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Clock, Target, Dumbbell, User, Calendar, Video } from "lucide-react";
import { formatDateBR } from "@/lib/date-utils";

interface WorkoutDetailModalProps {
  workout: any;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkoutDetailModal({ workout, isOpen, onClose }: WorkoutDetailModalProps) {
  const { data: exercises = [] } = useQuery({
    queryKey: ['/api/exercises', workout?.id],
    queryFn: () => fetch(`/api/exercises?workoutId=${workout.id}`).then(res => res.json()),
    enabled: !!workout?.id
  });

  const { data: student } = useQuery({
    queryKey: ['/api/students', workout?.studentId],
    queryFn: () => fetch(`/api/students/${workout.studentId}`).then(res => res.json()),
    enabled: !!workout?.studentId
  });

  // Fetch exercise results for each exercise - Loading state while exercises load
  const { data: allExerciseResults = {}, isLoading: resultsLoading } = useQuery({
    queryKey: ['/api/exercise-results', workout?.id, exercises?.length],
    queryFn: async () => {
      if (!exercises || exercises.length === 0) return {};
      
      const resultsPromises = exercises.map(async (exercise: any) => {
        const response = await fetch(`/api/exercises/${exercise.id}/results`);
        const results = await response.json();
        return { [exercise.id]: results };
      });
      
      const resultsArray = await Promise.all(resultsPromises);
      return resultsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: !!workout?.id && exercises.length > 0
  });

  // Fetch exercise videos for each exercise - Loading state while exercises load  
  const { data: allExerciseVideos = {}, isLoading: videosLoading } = useQuery({
    queryKey: ['/api/exercise-videos', workout?.id, exercises?.length],
    queryFn: async () => {
      if (!exercises || exercises.length === 0) return {};
      
      const videosPromises = exercises.map(async (exercise: any) => {
        const response = await fetch(`/api/exercises/${exercise.id}/videos`);
        const videos = await response.json();
        return { [exercise.id]: videos };
      });
      
      const videosArray = await Promise.all(videosPromises);
      return videosArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: !!workout?.id && exercises.length > 0
  });

  if (!workout) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-black/95 backdrop-blur-md border border-yellow-400/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-400 flex items-center">
            <Dumbbell className="w-5 h-5 mr-2" />
            {workout.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Confirmation Status */}
          {(() => {
            const totalExercises = exercises.length;
            const exercisesWithResults = Object.keys(allExerciseResults).filter(
              exerciseId => allExerciseResults[exerciseId]?.length > 0
            ).length;
            const confirmationPercentage = totalExercises > 0 ? Math.round((exercisesWithResults / totalExercises) * 100) : 0;
            const isLoadingData = resultsLoading || videosLoading;
            
            return (
              <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-400/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        confirmationPercentage === 100 ? 'bg-green-500' : 
                        confirmationPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Status de Confirmação do Aluno</h3>
                        <p className="text-sm text-gray-300">
                          {isLoadingData ? (
                            <span className="inline-flex items-center">
                              <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-2"></div>
                              Carregando dados...
                            </span>
                          ) : (
                            `${exercisesWithResults} de ${totalExercises} exercícios confirmados`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isLoadingData ? 'text-gray-400' :
                        confirmationPercentage === 100 ? 'text-green-400' : 
                        confirmationPercentage > 0 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {isLoadingData ? '...' : `${confirmationPercentage}%`}
                      </div>
                      <div className={`text-sm font-medium ${
                        confirmationPercentage === 100 ? 'text-green-300' : 
                        confirmationPercentage > 0 ? 'text-yellow-300' : 'text-gray-400'
                      }`}>
                        {confirmationPercentage === 100 ? 'Treino Confirmado' : 
                         confirmationPercentage > 0 ? 'Confirmação Parcial' : 'Aguardando Confirmação'}
                      </div>
                    </div>
                  </div>
                  {confirmationPercentage > 0 && confirmationPercentage < 100 && (
                    <div className="mt-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                      <p className="text-yellow-300 text-sm">
                        O aluno confirmou alguns exercícios, mas ainda há exercícios pendentes.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          {/* Workout Info */}
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Aluno</p>
                    <p className="font-medium text-white">
                      {student ? `${student.firstName} ${student.lastName}` : 'Carregando...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Data</p>
                    <p className="font-medium text-white">
                      {formatDateBR(workout.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className={`font-medium capitalize ${
                      workout.status === 'completed' ? 'text-green-400' :
                      workout.status === 'scheduled' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {workout.status === 'completed' ? 'Concluído' :
                       workout.status === 'scheduled' ? 'Agendado' :
                       workout.status}
                    </p>
                  </div>
                </div>
              </div>
              {workout.notes && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Observações</p>
                  <p className="text-white">{workout.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercises */}
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Dumbbell className="w-5 h-5 mr-2" />
                Exercícios ({exercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercises.length > 0 ? (
                  exercises.map((exercise: any, index: number) => (
                    <div
                      key={exercise.id}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-400 font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                              <span>{exercise.sets} séries</span>
                              <span>{exercise.reps} repetições</span>
                              <span>RPE {exercise.plannedRpe}</span>
                              {exercise.restTime && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {Math.floor(exercise.restTime / 60)}:{(exercise.restTime % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            {exercise.notes && (
                              <p className="text-sm text-gray-300 mt-2">{exercise.notes}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {allExerciseResults[exercise.id]?.length > 0 ? (
                            <div>
                              <div className="text-sm font-medium text-green-400 flex items-center justify-end">
                                Confirmado pelo Aluno
                                {allExerciseVideos[exercise.id]?.length > 0 && (
                                  <div 
                                    className="inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                                    title={`Ver ${allExerciseVideos[exercise.id].length} vídeo${allExerciseVideos[exercise.id].length > 1 ? 's' : ''} do exercício`}
                                    onClick={() => {
                                      // Abrir primeiro vídeo em nova janela
                                      if (allExerciseVideos[exercise.id][0]?.cloudinaryUrl) {
                                        window.open(allExerciseVideos[exercise.id][0].cloudinaryUrl, '_blank');
                                      }
                                    }}
                                  >
                                    <Video className="w-4 h-4 ml-2 text-purple-400" />
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-yellow-400 mt-1">
                                {allExerciseResults[exercise.id].length} série{allExerciseResults[exercise.id].length > 1 ? 's' : ''} registrada{allExerciseResults[exercise.id].length > 1 ? 's' : ''}
                              </div>
                              {(() => {
                                // Contar apenas vídeos únicos por série para evitar duplicação
                                const uniqueSetNumbers = new Set(
                                  allExerciseVideos[exercise.id]?.map((video: any) => video.setNumber)
                                );
                                const uniqueVideoCount = uniqueSetNumbers.size;
                                
                                return uniqueVideoCount > 0 && (
                                  <div className="text-xs text-purple-300 mt-1">
                                    {uniqueVideoCount} série{uniqueVideoCount > 1 ? 's' : ''} com vídeo{uniqueVideoCount > 1 ? 's' : ''}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-400">
                              Aguardando Confirmação
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Show actual results if student has recorded them */}
                      {allExerciseResults[exercise.id]?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            Resultados Confirmados pelo Aluno:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {allExerciseResults[exercise.id].map((result: any, setIndex: number) => {
                              // Encontrar vídeos desta série específica
                              const setVideos = allExerciseVideos[exercise.id]?.filter((video: any) => video.setNumber === result.setNumber) || [];
                              
                              return (
                                <div key={setIndex} className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-400/30 rounded-lg p-4 text-center hover:border-green-400/50 transition-colors">
                                  <div className="text-xs text-green-400 mb-2 font-medium flex items-center justify-center">
                                    <span>Série {result.setNumber}</span>
                                    {setVideos.length > 0 && (
                                      <div className="ml-2 flex space-x-1">
                                        {setVideos.map((video: any, videoIndex: number) => (
                                          <button
                                            key={video.id}
                                            onClick={() => window.open(video.cloudinaryUrl, '_blank')}
                                            className="p-1 rounded-full bg-purple-500/20 hover:bg-purple-500/40 transition-colors"
                                            title={`Ver vídeo: ${video.fileName}`}
                                          >
                                            <Video className="w-3 h-3 text-purple-400" />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xl font-bold text-white mb-1">
                                    {result.weight}kg × {result.reps}
                                  </div>
                                  {result.actualRpe && (
                                    <div className="text-sm text-yellow-400 font-medium">RPE {result.actualRpe}</div>
                                  )}
                                  {result.oneRmEstimate && (
                                    <div className="text-xs text-green-300 mt-2 font-medium">
                                      1RM Est.: {result.oneRmEstimate}kg
                                    </div>
                                  )}
                                  {setVideos.length > 0 && (
                                    <div className="text-xs text-purple-300 mt-2 font-medium">
                                      {setVideos.length} vídeo{setVideos.length > 1 ? 's' : ''}
                                    </div>
                                  )}
                                  {result.notes && (
                                    <div className="text-xs text-gray-300 mt-3 p-2 bg-black/20 rounded italic">
                                      "{result.notes}"
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Nenhum exercício adicionado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}