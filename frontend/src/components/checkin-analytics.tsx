import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Heart, Brain, Moon, Activity, AlertTriangle } from "lucide-react";

interface CheckinAnalyticsProps {
  analytics: {
    totalCheckins: number;
    averageScores: {
      muscularRecovery: number;
      mentalState: number;
      sleepQuality: number;
      perceivedProgress: number;
    };
    painReports: number;
    completionRate: number;
  };
  studentName?: string;
}

export const CheckinAnalytics = React.memo(({ analytics, studentName }: CheckinAnalyticsProps) => {
  const getScoreColor = useCallback((score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  }, []);

  const getScoreBadgeColor = useCallback((score: number) => {
    if (score >= 8) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 6) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  }, []);

  const getTrendIcon = useCallback((score: number) => {
    if (score >= 8) return <TrendingUp className="w-4 h-4" />;
    if (score >= 6) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  }, []);

  const formatScore = useCallback((score: number) => score.toFixed(1), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Analytics de Check-ins
            {studentName && (
              <span className="text-gray-400 font-normal text-base">- {studentName}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{analytics.totalCheckins}</div>
              <div className="text-sm text-gray-400">Total Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{analytics.completionRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Taxa de Conclusão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{analytics.painReports}</div>
              <div className="text-sm text-gray-400">Relatos de Dor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {((analytics.averageScores.muscularRecovery + 
                   analytics.averageScores.mentalState + 
                   analytics.averageScores.sleepQuality + 
                   analytics.averageScores.perceivedProgress) / 4).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Média Geral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Physical Recovery */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 flex items-center gap-2 text-base">
              <Heart className="w-4 h-4 text-red-400" />
              Recuperação Física
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Recuperação Muscular</span>
              <div className="flex items-center gap-2">
                <Badge className={`${getScoreBadgeColor(analytics.averageScores.muscularRecovery)} text-xs`}>
                  {formatScore(analytics.averageScores.muscularRecovery)}
                </Badge>
                {getTrendIcon(analytics.averageScores.muscularRecovery)}
              </div>
            </div>
            <Progress 
              value={analytics.averageScores.muscularRecovery * 10} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Mental State */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 flex items-center gap-2 text-base">
              <Brain className="w-4 h-4 text-purple-400" />
              Estado Mental
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Estado Mental Médio</span>
              <div className="flex items-center gap-2">
                <Badge className={`${getScoreBadgeColor(analytics.averageScores.mentalState)} text-xs`}>
                  {formatScore(analytics.averageScores.mentalState)}
                </Badge>
                {getTrendIcon(analytics.averageScores.mentalState)}
              </div>
            </div>
            <Progress 
              value={analytics.averageScores.mentalState * 10} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Sleep Quality */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 flex items-center gap-2 text-base">
              <Moon className="w-4 h-4 text-blue-400" />
              Qualidade do Sono
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Sono Médio</span>
              <div className="flex items-center gap-2">
                <Badge className={`${getScoreBadgeColor(analytics.averageScores.sleepQuality)} text-xs`}>
                  {formatScore(analytics.averageScores.sleepQuality)}
                </Badge>
                {getTrendIcon(analytics.averageScores.sleepQuality)}
              </div>
            </div>
            <Progress 
              value={analytics.averageScores.sleepQuality * 10} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Perceived Progress */}
        <Card className="bg-black/40 backdrop-blur-sm border border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-green-400" />
              Progresso Percebido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Progresso Médio</span>
              <div className="flex items-center gap-2">
                <Badge className={`${getScoreBadgeColor(analytics.averageScores.perceivedProgress)} text-xs`}>
                  {formatScore(analytics.averageScores.perceivedProgress)}
                </Badge>
                {getTrendIcon(analytics.averageScores.perceivedProgress)}
              </div>
            </div>
            <Progress 
              value={analytics.averageScores.perceivedProgress * 10} 
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Pain Reports Alert */}
      {analytics.painReports > 0 && (
        <Card className="bg-red-900/20 backdrop-blur-sm border border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="text-red-400 font-semibold">Atenção: Relatos de Dor</h4>
                <p className="text-red-300/80 text-sm mt-1">
                  {analytics.painReports} check-in{analytics.painReports > 1 ? 's' : ''} reportaram dor ou desconforto. 
                  Recomenda-se revisar os detalhes e considerar ajustes no treino.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});