import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Minus, Save, Timer, Target, Weight, Video, Upload, Play, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExerciseDetailProps {
  exercise: any;
  onBack: () => void;
}

interface ExerciseSet {
  setNumber: number;
  weight: string;
  reps: string;
  actualRpe: string;
}

export function ExerciseDetail({ exercise, onBack }: ExerciseDetailProps) {
  // Check if exercise already has results
  const hasResults = exercise.results && exercise.results.length > 0;
  
  const [isEditing, setIsEditing] = useState(!hasResults);
  const [sets, setSets] = useState<ExerciseSet[]>(() => {
    if (hasResults) {
      // Load existing results
      return exercise.results.map((result: any) => ({
        setNumber: result.setNumber,
        weight: result.weight?.toString() || '',
        reps: result.reps?.toString() || '',
        actualRpe: result.actualRpe?.toString() || ''
      }));
    } else {
      // Initialize empty sets based on exercise.sets
      const initialSets = [];
      for (let i = 1; i <= exercise.sets; i++) {
        initialSets.push({
          setNumber: i,
          weight: '',
          reps: '',
          actualRpe: ''
        });
      }
      return initialSets;
    }
  });
  
  const [notes, setNotes] = useState(hasResults ? (exercise.results[0]?.notes || '') : '');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoDescription, setVideoDescription] = useState('');
  const [selectedSetNumber, setSelectedSetNumber] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar vídeos existentes do exercício
  const { data: existingVideos = [] } = useQuery({
    queryKey: [`/api/exercises/${exercise.id}/videos`],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${exercise.id}/videos`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao buscar vídeos');
      return response.json();
    },
  });

  const saveResultsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/exercise-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to save results');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Exercício Confirmado!",
        description: "Seus resultados foram registrados e seu treinador foi notificado.",
        className: "bg-green-900/90 border-green-400/40 text-green-100",
      });
      // Wait a bit to show the success message before going back
      setTimeout(() => {
        onBack();
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const updateSet = (index: number, field: keyof ExerciseSet, value: string) => {
    const updatedSets = [...sets];
    updatedSets[index] = { ...updatedSets[index], [field]: value };
    setSets(updatedSets);
  };

  const addSet = () => {
    setSets([...sets, {
      setNumber: sets.length + 1,
      weight: '',
      reps: '',
      actualRpe: ''
    }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      const updatedSets = sets.filter((_, i) => i !== index);
      // Renumber sets
      updatedSets.forEach((set, i) => {
        set.setNumber = i + 1;
      });
      setSets(updatedSets);
    }
  };

  // Upload de vídeo
  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      if (videoDescription) {
        formData.append('description', videoDescription);
      }
      formData.append('setNumber', selectedSetNumber.toString());

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `/api/exercises/${exercise.id}/videos`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    },
    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onSuccess: () => {
      toast({
        title: "✅ Vídeo enviado!",
        description: "Seu vídeo foi salvo com sucesso.",
        className: "bg-green-900/90 border-green-400/40 text-green-100",
      });
      setSelectedVideo(null);
      setVideoDescription('');
      setSelectedSetNumber(1);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: [`/api/exercises/${exercise.id}/videos`] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no upload",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos de vídeo.",
          variant: "destructive",
        });
        return;
      }

      // Verificar tamanho (limite de 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O vídeo deve ter no máximo 100MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedVideo(file);
    }
  };

  const handleUploadVideo = () => {
    if (selectedVideo) {
      uploadVideoMutation.mutate(selectedVideo);
    }
  };

  const cancelVideoSelection = () => {
    setSelectedVideo(null);
    setVideoDescription('');
    setSelectedSetNumber(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    // Validate that at least one set has data
    const hasValidData = sets.some(set => set.weight && set.reps);
    
    if (!hasValidData) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos peso e repetições para uma série.",
        variant: "destructive",
      });
      return;
    }

    const results = sets
      .filter(set => set.weight && set.reps)
      .map(set => ({
        exerciseId: exercise.id,
        setNumber: set.setNumber,
        weight: parseFloat(set.weight),
        reps: parseInt(set.reps),
        actualRpe: set.actualRpe ? parseFloat(set.actualRpe) : null,
        oneRmEstimate: null // Will be calculated on backend if needed
      }));

    saveResultsMutation.mutate({
      exerciseId: exercise.id,
      results,
      notes
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-yellow-400/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-yellow-400 hover:bg-yellow-400/10 px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Voltar aos Exercícios</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
            
            <div className="text-center flex-1 min-w-0">
              <h1 className="text-lg lg:text-xl font-bold text-yellow-400 truncate">{exercise.name}</h1>
              <p className="text-xs lg:text-sm text-gray-400 capitalize">{exercise.category}</p>
            </div>

            {!isEditing && hasResults ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 font-semibold"
              >
                <Target className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Editar Resultados</span>
                <span className="sm:hidden">✏️</span>
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saveResultsMutation.isPending}
                size="sm"
                className={`px-3 py-2 font-semibold transition-all duration-200 ${
                  saveResultsMutation.isPending ? 
                  'bg-yellow-600 text-yellow-100 cursor-not-allowed' :
                  'bg-yellow-400 text-black hover:bg-yellow-500 hover:scale-[1.02]'
                }`}
              >
                <Save className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">{saveResultsMutation.isPending ? 'Salvando...' : (hasResults ? 'Atualizar' : 'Confirmar Exercício')}</span>
                <span className="sm:hidden">{saveResultsMutation.isPending ? '⏳' : '💾'}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
        {/* Exercise Info */}
        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 mb-6 lg:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-yellow-400 flex items-center text-lg">
              <Target className="w-5 h-5 mr-2" />
              Informações do Exercício
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center lg:text-left">
                <p className="text-xs lg:text-sm text-gray-400 mb-1">Séries Planejadas</p>
                <p className="text-white font-medium text-lg">{exercise.sets}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xs lg:text-sm text-gray-400 mb-1">Repetições</p>
                <p className="text-white font-medium text-lg">{exercise.reps}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xs lg:text-sm text-gray-400 mb-1">RPE Planejado</p>
                <p className="text-white font-medium text-lg">{exercise.plannedRpe}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xs lg:text-sm text-gray-400 mb-1">Descanso</p>
                <p className="text-white font-medium text-lg">
                  {exercise.restTime ? `${Math.floor(exercise.restTime / 60)}:${(exercise.restTime % 60).toString().padStart(2, '0')}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sets Recording/Results */}
        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-yellow-400 flex items-center">
              <Weight className="w-5 h-5 mr-2" />
              {!isEditing && hasResults ? 'Resultados Registrados' : 'Registro das Séries'}
            </CardTitle>
            {isEditing && (
              <Button
                onClick={addSet}
                variant="outline"
                size="sm"
                className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Série
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!isEditing && hasResults ? (
              // Results View - Show saved results in a beautiful display
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sets.map((set, index) => {
                  const oneRmEstimate = set.weight && set.reps ? 
                    Math.round(parseFloat(set.weight) * (1 + parseFloat(set.reps) / 30)) : null;
                  
                  return (
                    <div key={index} className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-400/30 rounded-lg p-4 text-center hover:border-green-400/50 transition-colors">
                      <div className="text-sm text-green-400 mb-2 font-medium">Série {set.setNumber}</div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {set.weight}kg × {set.reps}
                      </div>
                      {set.actualRpe && (
                        <div className="text-yellow-400 font-medium mb-2">RPE {set.actualRpe}</div>
                      )}
                      {oneRmEstimate && (
                        <div className="text-xs text-green-300">
                          1RM Est.: {oneRmEstimate}kg
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Editing View - Show input forms
              <div className="space-y-4">
                {sets.map((set, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Série {set.setNumber}</h3>
                      {sets.length > 1 && (
                        <Button
                          onClick={() => removeSet(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-400">Peso (kg)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) => updateSet(index, 'weight', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:border-yellow-400"
                          placeholder="Ex: 100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-400">Repetições</Label>
                        <Input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(index, 'reps', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:border-yellow-400"
                          placeholder="Ex: 8"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-400">RPE Real</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          value={set.actualRpe}
                          onChange={(e) => updateSet(index, 'actualRpe', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:border-yellow-400"
                          placeholder="Ex: 8.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {(isEditing || notes) && (
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Timer className="w-5 h-5 mr-2" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing && hasResults && notes ? (
                // Notes View - Show saved notes
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                  <p className="text-gray-300 italic">"{notes}"</p>
                </div>
              ) : isEditing ? (
                // Notes Edit - Show textarea
                <div className="space-y-2">
                  <Label className="text-gray-400">Notas sobre o exercício (opcional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white focus:border-yellow-400 min-h-[100px]"
                    placeholder="Como foi o exercício? Alguma dificuldade ou observação importante..."
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Video Upload Section - Integrated as another exercise statistic */}
        <Card className="bg-black/40 backdrop-blur-sm border border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Vídeos das Séries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Existing videos grouped by set */}
              {existingVideos.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-purple-300">Vídeos enviados por série:</h4>
                  {sets.map((set, setIndex) => {
                    const setVideos = existingVideos.filter((video: any) => video.setNumber === set.setNumber);
                    return (
                      <div key={set.setNumber} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-purple-200">Série {set.setNumber}</span>
                          {setVideos.length === 0 && (
                            <span className="text-xs text-gray-500 italic">Nenhum vídeo</span>
                          )}
                        </div>
                        {setVideos.map((video: any) => (
                          <div key={video.id} className="ml-6 flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                            <div className="flex items-center space-x-3">
                              <Video className="w-4 h-4 text-purple-400" />
                              <div>
                                <p className="text-sm font-medium text-white">{video.fileName}</p>
                                {video.description && (
                                  <p className="text-xs text-gray-400">{video.description}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(video.cloudinaryUrl, '_blank')}
                              className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload section - Always visible when editing */}
              {isEditing && (
                <div className="space-y-4 pt-4 border-t border-gray-600">
                  <h4 className="text-sm font-medium text-purple-300">Enviar novo vídeo para série:</h4>
                  
                  {!selectedVideo ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-gray-400 text-sm">Selecione a série:</Label>
                        <select
                          value={selectedSetNumber}
                          onChange={(e) => setSelectedSetNumber(parseInt(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:border-purple-400 focus:outline-none"
                        >
                          {sets.map((set, index) => (
                            <option key={index} value={set.setNumber}>
                              Série {set.setNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Vídeo da Série {selectedSetNumber}
                      </Button>
                      <p className="text-xs text-gray-400 text-center">
                        Formatos aceitos: MP4, MOV, AVI (max. 100MB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Video className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-white">
                              {selectedVideo.name}
                            </span>
                            <span className="text-xs text-purple-300 bg-purple-400/20 px-2 py-1 rounded">
                              Série {selectedSetNumber}
                            </span>
                          </div>
                          <Button
                            onClick={cancelVideoSelection}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                          {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-400">Descrição (opcional)</Label>
                        <Input
                          value={videoDescription}
                          onChange={(e) => setVideoDescription(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:border-purple-400"
                          placeholder="Ex: Série 1, vista lateral, técnica corrigida..."
                        />
                      </div>

                      {isUploading ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Enviando...</span>
                            <span className="text-purple-400">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      ) : (
                        <Button
                          onClick={handleUploadVideo}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={!selectedVideo}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Enviar Vídeo
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Show upload option even when not editing, but only upload button */}
              {!isEditing && (
                <div className="pt-4 border-t border-gray-600">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!selectedVideo ? (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Vídeo do Exercício
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Video className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-white">
                              {selectedVideo.name}
                            </span>
                            <span className="text-xs text-purple-300 bg-purple-400/20 px-2 py-1 rounded">
                              Série {selectedSetNumber}
                            </span>
                          </div>
                          <Button
                            onClick={cancelVideoSelection}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                          {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-400">Descrição (opcional)</Label>
                        <Input
                          value={videoDescription}
                          onChange={(e) => setVideoDescription(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:border-purple-400"
                          placeholder="Ex: Série 1, vista lateral, técnica corrigida..."
                        />
                      </div>

                      {isUploading ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Enviando...</span>
                            <span className="text-purple-400">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      ) : (
                        <Button
                          onClick={handleUploadVideo}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={!selectedVideo}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Enviar Vídeo
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}