import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Heart, Brain, Moon, Apple, Activity, MessageSquare, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDateBR } from "@/lib/date-utils";

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStartDate: string;
}

interface CheckinFormData {
  muscularRecovery: number;
  recoveryQuality: number;
  mentalState: number;
  motivation: number;
  sleepQuality: number;
  sleepHours: number;
  nutritionConsistency: number;
  hydrationLevel: string;
  painLevel: string;
  painDescription: string;
  perceivedProgress: number;
  weekHighlights: string;
  concerns: string;
}

const sections = [
  {
    title: "Recuperação e Bem-estar Físico",
    icon: Heart,
    description: "Como seu corpo se sentiu durante a semana?"
  },
  {
    title: "Estado Mental e Motivação", 
    icon: Brain,
    description: "Como foi seu estado emocional e motivação para treinar?"
  },
  {
    title: "Sono e Nutrição",
    icon: Moon,
    description: "Como foram seus hábitos de sono e alimentação?"
  },
  {
    title: "Progresso e Observações",
    icon: Activity,
    description: "Suas percepções sobre evolução e pontos de atenção"
  }
];

const hydrationOptions = [
  { value: "muito_baixa", label: "Muito Baixa" },
  { value: "baixa", label: "Baixa" },
  { value: "adequada", label: "Adequada" },
  { value: "boa", label: "Boa" },
  { value: "excelente", label: "Excelente" }
];

const painOptions = [
  { value: "nenhuma", label: "Nenhuma" },
  { value: "leve", label: "Leve" },
  { value: "moderada", label: "Moderada" },
  { value: "intensa", label: "Intensa" }
];

export function WeeklyCheckinModal({ isOpen, onClose, weekStartDate }: WeeklyCheckinModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CheckinFormData>({
    muscularRecovery: 5,
    recoveryQuality: 5,
    mentalState: 5,
    motivation: 5,
    sleepQuality: 5,
    sleepHours: 7.5,
    nutritionConsistency: 5,
    hydrationLevel: '',
    painLevel: '',
    painDescription: '',
    perceivedProgress: 5,
    weekHighlights: '',
    concerns: ''
  });

  const submitCheckinMutation = useMutation({
    mutationFn: async (data: CheckinFormData) => {
      const response = await fetch('/api/weekly-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          weekStartDate,
          ...data,
          completed: true
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar check-in');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-checkins'] });
      toast({
        title: "Check-in concluído!",
        description: "Suas respostas foram enviadas para seu treinador.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFormData = (key: keyof CheckinFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // Validação básica
    const requiredFields = ['hydrationLevel', 'painLevel'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CheckinFormData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    submitCheckinMutation.mutate(formData);
  };

  const nextStep = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Recuperação e Bem-estar Físico
        return (
          <div className="space-y-6">
            {/* Recuperação Muscular */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Recuperação Muscular (1-10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.muscularRecovery]}
                  onValueChange={(value) => updateFormData('muscularRecovery', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 - Muito Cansado</span>
                  <span className="font-semibold text-yellow-400">{formData.muscularRecovery}</span>
                  <span>10 - Totalmente Recuperado</span>
                </div>
              </div>
            </div>

            {/* Qualidade da Recuperação */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Como você avalia a qualidade da sua recuperação? (1-10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.recoveryQuality]}
                  onValueChange={(value) => updateFormData('recoveryQuality', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 - Péssima</span>
                  <span className="font-semibold text-yellow-400">{formData.recoveryQuality}</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
            </div>

            {/* Nível de Dor */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Nível de dor ou desconforto *
              </Label>
              <Select value={formData.painLevel} onValueChange={(value) => updateFormData('painLevel', value)}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                  <SelectValue placeholder="Selecione o nível de dor" />
                </SelectTrigger>
                <SelectContent>
                  {painOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição da Dor */}
            {formData.painLevel && formData.painLevel !== 'nenhuma' && (
              <div className="space-y-3">
                <Label className="text-gray-300 text-sm">
                  Descrição da dor/desconforto
                </Label>
                <Textarea
                  value={formData.painDescription}
                  onChange={(e) => updateFormData('painDescription', e.target.value)}
                  className="bg-gray-800/50 border-gray-600/50 text-white min-h-[80px] resize-none focus:border-yellow-400/50 transition-colors"
                  placeholder="Descreva onde sente dor e como ela afeta seus treinos..."
                />
              </div>
            )}
          </div>
        );

      case 1: // Estado Mental e Motivação
        return (
          <div className="space-y-6">
            {/* Estado Mental */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Como foi seu estado mental esta semana? (1-10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.mentalState]}
                  onValueChange={(value) => updateFormData('mentalState', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 - Muito Baixo</span>
                  <span className="font-semibold text-yellow-400">{formData.mentalState}</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
            </div>

            {/* Motivação */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Nível de motivação para treinar (1-10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.motivation]}
                  onValueChange={(value) => updateFormData('motivation', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 - Sem Motivação</span>
                  <span className="font-semibold text-yellow-400">{formData.motivation}</span>
                  <span>10 - Muito Motivado</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Sono e Nutrição
        return (
          <div className="space-y-6">
            {/* Qualidade do Sono */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Qualidade do sono (1-10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.sleepQuality]}
                  onValueChange={(value) => updateFormData('sleepQuality', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 - Péssima</span>
                  <span className="font-semibold text-yellow-400">{formData.sleepQuality}</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
            </div>

            {/* Horas de Sono */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Média de horas de sono por noite
              </Label>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  min="4"
                  max="12"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) => updateFormData('sleepHours', parseFloat(e.target.value) || 7.5)}
                  className="bg-gray-800/50 border-gray-600/50 text-white w-24 focus:border-yellow-400/50 transition-colors"
                />
                <span className="text-gray-300 text-sm">horas</span>
              </div>
            </div>

            {/* Consistência Nutricional */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Consistência nutricional (1-10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.nutritionConsistency]}
                  onValueChange={(value) => updateFormData('nutritionConsistency', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 - Muito Inconsistente</span>
                  <span className="font-semibold text-yellow-400">{formData.nutritionConsistency}</span>
                  <span>10 - Muito Consistente</span>
                </div>
              </div>
            </div>

            {/* Hidratação */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Nível de hidratação *
              </Label>
              <Select value={formData.hydrationLevel} onValueChange={(value) => updateFormData('hydrationLevel', value)}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                  <SelectValue placeholder="Selecione o nível de hidratação" />
                </SelectTrigger>
                <SelectContent>
                  {hydrationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3: // Progresso e Observações
        return (
          <div className="space-y-6">
            {/* Progresso Percebido */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Como você avalia seu progresso esta semana? (1-10)
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.perceivedProgress]}
                  onValueChange={(value) => updateFormData('perceivedProgress', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 - Nenhum Progresso</span>
                  <span className="font-semibold text-yellow-400">{formData.perceivedProgress}</span>
                  <span>10 - Progresso Excelente</span>
                </div>
              </div>
            </div>

            {/* Destaques da Semana */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Principais destaques da semana
              </Label>
              <Textarea
                value={formData.weekHighlights}
                onChange={(e) => updateFormData('weekHighlights', e.target.value)}
                className="bg-gray-800/50 border-gray-600/50 text-white min-h-[80px] resize-none focus:border-yellow-400/50 transition-colors"
                placeholder="Ex: Consegui aumentar a carga no supino, me senti mais forte nos agachamentos..."
              />
            </div>

            {/* Preocupações */}
            <div className="space-y-3">
              <Label className="text-gray-300 text-sm">
                Alguma preocupação ou dificuldade?
              </Label>
              <Textarea
                value={formData.concerns}
                onChange={(e) => updateFormData('concerns', e.target.value)}
                className="bg-gray-800/50 border-gray-600/50 text-white min-h-[80px] resize-none focus:border-yellow-400/50 transition-colors"
                placeholder="Ex: Gostaria de trabalhar mais a mobilidade, sinto que preciso de mais descanso..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
        <DialogHeader className="pb-4 border-b border-yellow-400/20">
          <DialogTitle className="text-xl font-bold text-center text-yellow-400 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Check-in Semanal
          </DialogTitle>
          <p className="text-gray-400 text-center text-sm">
            Semana de {formatDateBR(weekStartDate)}
          </p>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-yellow-400'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Section Header */}
        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-400/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 flex items-center gap-3">
              {(() => {
                const IconComponent = sections[currentStep].icon;
                return <IconComponent className="w-5 h-5" />;
              })()}
              {sections[currentStep].title}
            </CardTitle>
            <p className="text-gray-400 text-sm">
              {sections[currentStep].description}
            </p>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-yellow-400/20">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </Button>

          <span className="text-sm text-gray-400">
            {currentStep + 1} de {sections.length}
          </span>

          {currentStep < sections.length - 1 ? (
            <Button
              onClick={nextStep}
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
            >
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitCheckinMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-semibold px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitCheckinMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enviar Check-in
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}