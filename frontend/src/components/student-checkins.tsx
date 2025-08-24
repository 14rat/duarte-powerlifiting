import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageSquare, Heart, Brain, Moon, Activity, ArrowLeft, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckinAnalytics } from "./checkin-analytics";
import { createLocalDate } from "@/lib/date-utils";

interface StudentCheckinsProps {
  studentId: number;
  studentName: string;
  onBack: () => void;
}

export function StudentCheckins({ studentId, studentName, onBack }: StudentCheckinsProps) {
  const { data: checkinsData, isLoading } = useQuery<{ checkins?: any[], analytics?: any } | any[]>({
    queryKey: ['/api/weekly-checkins', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/weekly-checkins?studentId=${studentId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch checkins');
      return response.json();
    }
  });

  // Handle both array and object responses
  const checkins = Array.isArray(checkinsData) ? checkinsData : checkinsData?.checkins || [];
  const analytics = Array.isArray(checkinsData) ? null : checkinsData?.analytics;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando check-ins...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="text-yellow-400 hover:bg-yellow-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Check-ins de {studentName}</h1>
            <p className="text-gray-400">Histórico de check-ins semanais</p>
          </div>
        </div>

        {checkins.length === 0 ? (
          <Card className="bg-black/40 border-yellow-400/20">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">Nenhum check-in encontrado</p>
                <p className="text-gray-500 text-sm mt-2">O aluno ainda não fez check-ins semanais</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="checkins" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-yellow-400/20">
              <TabsTrigger 
                value="checkins" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Check-ins
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checkins" className="space-y-6">
              {checkins.map((checkin) => (
                <CheckinCard key={checkin.id} checkin={checkin} />
              ))}
            </TabsContent>

            <TabsContent value="analytics">
              {analytics ? (
                <CheckinAnalytics analytics={analytics} studentName={studentName} />
              ) : (
                <Card className="bg-black/40 border-yellow-400/20">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg">Analytics não disponível</p>
                      <p className="text-gray-500 text-sm mt-2">Dados insuficientes para gerar analytics</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function CheckinCard({ checkin }: { checkin: any }) {
  const weekStart = createLocalDate(checkin.weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return (
    <Card className="bg-gradient-to-br from-black/40 to-gray-900/40 border-yellow-400/20 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-yellow-400">
            <Calendar className="w-5 h-5" />
            Semana de {format(weekStart, "dd/MM", { locale: ptBR })} - {format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}
          </CardTitle>
          <Badge variant={checkin.completed ? "default" : "secondary"}>
            {checkin.completed ? "Completo" : "Incompleto"}
          </Badge>
        </div>
        <p className="text-gray-400 text-sm">
          Enviado em {format(createLocalDate(checkin.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recuperação e Bem-estar Físico */}
        {(checkin.weekHighlights || checkin.painDescription) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Heart className="w-4 h-4" />
              <h4 className="font-semibold">Recuperação e Bem-estar Físico</h4>
            </div>
            {checkin.weekHighlights && (
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-1 font-medium">Recuperação muscular:</p>
                <p className="text-white">{checkin.weekHighlights}</p>
              </div>
            )}
            {checkin.painDescription && (
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-1 font-medium">Dores ou desconfortos:</p>
                <p className="text-white">{checkin.painDescription}</p>
              </div>
            )}
          </div>
        )}

        {/* Estado Mental e Motivação */}
        {checkin.concerns && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Brain className="w-4 h-4" />
              <h4 className="font-semibold">Estado Mental e Motivação</h4>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <p className="text-white">{checkin.concerns}</p>
            </div>
          </div>
        )}

        {/* Sono */}
        {(checkin.sleepHours || checkin.sleepQuality) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Moon className="w-4 h-4" />
              <h4 className="font-semibold">Sono e Nutrição</h4>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                {checkin.sleepHours && (
                  <div>
                    <p className="text-gray-300 text-sm">Horas de sono:</p>
                    <p className="text-white font-medium">{checkin.sleepHours}h por noite</p>
                  </div>
                )}
                {checkin.sleepQuality && (
                  <div>
                    <p className="text-gray-300 text-sm">Qualidade do sono:</p>
                    <p className="text-white font-medium">{checkin.sleepQuality}/10</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progresso e Observações */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-yellow-400">
            <Activity className="w-4 h-4" />
            <h4 className="font-semibold">Progresso e Observações</h4>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <p className="text-gray-300 text-sm">
              Check-in registrado - Dados numéricos disponíveis para análise detalhada
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}