import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Play, 
  Pause, 
  Download, 
  Clock, 
  HardDrive, 
  Calendar,
  Dumbbell,
  User,
  FileVideo,
  X
} from "lucide-react";

interface StudentVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
}

interface EnrichedVideo {
  id: number;
  exerciseId: number;
  cloudinaryUrl: string;
  fileName: string;
  fileSize?: number;
  duration?: number;
  description?: string;
  createdAt: string;
  uploadedBy: number;
  exercise: {
    id: number;
    name: string;
    category: string;
  } | null;
  workout: {
    id: number;
    name: string;
    date: string;
  } | null;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export function StudentVideosModal({ isOpen, onClose, studentId, studentName }: StudentVideosModalProps) {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Buscar todos os vídeos dos treinos do aluno
  const { data: videos, isLoading } = useQuery({
    queryKey: ['/api/trainer/videos', studentId],
    queryFn: async () => {
      const response = await fetch('/api/trainer/videos', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao buscar vídeos');
      const allVideos = await response.json();
      // Filtrar apenas os vídeos deste aluno
      return allVideos.filter((video: EnrichedVideo) => video.student?.id === studentId);
    },
    enabled: isOpen && !!studentId,
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleVideo = (videoUrl: string) => {
    if (currentVideo === videoUrl) {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      setCurrentVideo(videoUrl);
      setIsPlaying(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play();
        }
      }, 100);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'squat': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'bench': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'deadlift': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'accessory': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'squat': return 'Agachamento';
      case 'bench': return 'Supino';
      case 'deadlift': return 'Levantamento Terra';
      case 'accessory': return 'Acessório';
      default: return category;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-black/95 backdrop-blur-md border border-purple-400/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-400 flex items-center">
            <Video className="w-6 h-6 mr-2" />
            Vídeos de Treino - {studentName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Video Player */}
          {currentVideo && (
            <Card className="bg-gray-900/50 border-purple-400/20">
              <CardContent className="pt-6">
                <video
                  ref={videoRef}
                  src={currentVideo}
                  controls
                  className="w-full rounded-lg"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </CardContent>
            </Card>
          )}

          {/* Videos List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <FileVideo className="w-5 h-5 mr-2 text-purple-400" />
                Vídeos Disponíveis ({videos?.length || 0})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Fechar
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
                <p>Carregando vídeos...</p>
              </div>
            ) : videos?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum vídeo encontrado para este aluno.</p>
                <p className="text-sm">O aluno ainda não enviou vídeos de exercícios.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {videos?.map((video: EnrichedVideo) => (
                  <Card key={video.id} className="bg-gray-800/50 border-gray-600 hover:border-purple-400/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          {/* Título e arquivo */}
                          <div className="flex items-center space-x-2">
                            <FileVideo className="w-4 h-4 text-purple-400" />
                            <span className="font-medium text-white">{video.fileName}</span>
                          </div>
                          
                          {/* Informações do treino e exercício */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {video.workout && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Dumbbell className="w-3 h-3 text-yellow-400" />
                                <span className="text-gray-300">{video.workout.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {formatDate(video.workout.date)}
                                </Badge>
                              </div>
                            )}
                            
                            {video.exercise && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getCategoryColor(video.exercise.category)}`}
                                >
                                  {getCategoryName(video.exercise.category)}
                                </Badge>
                                <span className="text-gray-300">{video.exercise.name}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Descrição */}
                          {video.description && (
                            <p className="text-sm text-gray-300 italic">{video.description}</p>
                          )}
                          
                          {/* Metadados do arquivo */}
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <HardDrive className="w-3 h-3" />
                              <span>{formatFileSize(video.fileSize)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(video.duration)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(video.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Controles */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleVideo(video.cloudinaryUrl)}
                            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                          >
                            {currentVideo === video.cloudinaryUrl && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(video.cloudinaryUrl, '_blank')}
                            className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}