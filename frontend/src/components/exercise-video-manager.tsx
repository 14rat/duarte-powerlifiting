import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Video, 
  Trash2, 
  Play, 
  Pause, 
  Download,
  FileVideo,
  Clock,
  HardDrive,
  User
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface ExerciseVideoManagerProps {
  exerciseId: number;
  exerciseName: string;
}

interface ExerciseVideo {
  id: number;
  exerciseId: number;
  cloudinaryUrl: string;
  fileName: string;
  fileSize?: number;
  duration?: number;
  description?: string;
  createdAt: string;
  uploadedBy: number;
}

export function ExerciseVideoManager({ exerciseId, exerciseName }: ExerciseVideoManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar vídeos do exercício
  const { data: videos, isLoading } = useQuery({
    queryKey: ['/api/exercises', exerciseId, 'videos'],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${exerciseId}/videos`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao buscar vídeos');
      return response.json();
    },
  });

  // Mutation para upload de vídeo
  const uploadMutation = useMutation({
    mutationFn: async ({ file, description }: { file: File, description: string }) => {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('description', description);

      const response = await fetch(`/api/exercises/${exerciseId}/videos`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no upload');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Vídeo Enviado!",
        description: "O vídeo foi carregado com sucesso para o Cloudinary.",
        className: "bg-green-900/90 border-green-400/40 text-green-100",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exercises', exerciseId, 'videos'] });
      setSelectedFile(null);
      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Upload",
        description: error.message || "Não foi possível enviar o vídeo.",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar vídeo
  const deleteMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await fetch(`/api/exercise-videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao deletar vídeo');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vídeo Deletado",
        description: "O vídeo foi removido com sucesso.",
        className: "bg-blue-900/90 border-blue-400/40 text-blue-100",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exercises', exerciseId, 'videos'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o vídeo.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Arquivo Inválido",
          description: "Por favor, selecione apenas arquivos de vídeo.",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar tamanho (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Arquivo Muito Grande",
          description: "O arquivo deve ter no máximo 100MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    uploadMutation.mutate(
      { file: selectedFile, description },
      {
        onSettled: () => setIsUploading(false),
      }
    );
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Video className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Vídeos do Exercício</h3>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
            {exerciseName}
          </Badge>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="bg-gray-900/50 border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Adicionar Vídeo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-sm text-gray-400 mt-1">
              Máximo 100MB. Formatos: MP4, MOV, AVI, etc.
            </p>
          </div>
          
          {selectedFile && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <FileVideo className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-yellow-400">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
              </div>
              
              <Textarea
                placeholder="Descrição opcional do vídeo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                rows={2}
              />
              
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
              >
                {isUploading ? "Enviando..." : "Enviar Vídeo"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player */}
      {currentVideo && (
        <Card className="bg-gray-900/50 border-yellow-400/20">
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
        <h4 className="text-lg font-semibold text-white flex items-center">
          <FileVideo className="w-5 h-5 mr-2 text-yellow-400" />
          Vídeos Disponíveis ({videos?.length || 0})
        </h4>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            Carregando vídeos...
          </div>
        ) : videos?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum vídeo encontrado para este exercício.</p>
            <p className="text-sm">Faça upload do primeiro vídeo acima!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos?.map((video: ExerciseVideo) => (
              <Card key={video.id} className="bg-gray-800/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <FileVideo className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-white">{video.fileName}</span>
                      </div>
                      
                      {video.description && (
                        <p className="text-sm text-gray-300">{video.description}</p>
                      )}
                      
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
                          <User className="w-3 h-3" />
                          <span>{new Date(video.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVideo(video.cloudinaryUrl)}
                        className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
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
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(video.id)}
                        disabled={deleteMutation.isPending}
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
}