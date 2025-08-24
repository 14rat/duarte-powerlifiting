import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, X, Dumbbell, Clock, Target, User } from "lucide-react";
import { EXERCISES as exercisesList } from "@/lib/exercises";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateToLocal } from "@/lib/date-utils";

interface Exercise {
  name: string;
  category: "squat" | "bench" | "deadlift" | "accessory";
  sets: number;
  reps: string;
  plannedRpe: string;
  restTime: number;
  isCustom?: boolean;
}

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  students: any[];
}

export function WorkoutModal({ isOpen, onClose, selectedDate, students }: WorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState("");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customCategory, setCustomCategory] = useState<"squat" | "bench" | "deadlift" | "accessory">("accessory");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createWorkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      toast({
        title: "Treino criado com sucesso!",
        description: "O treino foi agendado para o aluno.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro ao criar treino",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const createTestWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/test-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Treino de teste criado!",
        description: "Um aluno teste e treino foram criados para demonstração.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro ao criar treino de teste",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const addExercise = (exerciseName: string) => {
    const exerciseData = exercisesList.find((ex: any) => ex.name === exerciseName);
    if (exerciseData) {
      setExercises([...exercises, {
        name: exerciseData.name,
        category: exerciseData.category,
        sets: 3,
        reps: "8-10",
        plannedRpe: "8.0",
        restTime: 120,
        isCustom: false
      }]);
    }
  };

  const addCustomExercise = () => {
    if (!customExerciseName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do exercício personalizado.",
        variant: "destructive",
      });
      return;
    }

    setExercises([...exercises, {
      name: customExerciseName.trim(),
      category: customCategory,
      sets: 3,
      reps: "8-10",
      plannedRpe: "8.0",
      restTime: 120,
      isCustom: true
    }]);

    setCustomExerciseName("");
    setCustomCategory("accessory");
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSubmit = () => {
    if (!workoutName || !selectedStudent || exercises.length === 0 || !selectedDate) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Use proper date formatting to avoid timezone issues
    const localDateString = formatDateToLocal(selectedDate);
    
    const workoutData = {
      name: workoutName,
      studentId: parseInt(selectedStudent),
      date: localDateString,
      notes,
      exercises: exercises.map((ex, index) => ({
        ...ex,
        order: index + 1
      }))
    };

    createWorkoutMutation.mutate(workoutData);
  };

  const handleClose = () => {
    setWorkoutName("");
    setSelectedStudent("");
    setExercises([]);
    setNotes("");
    setCustomExerciseName("");
    setCustomCategory("accessory");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black to-gray-900 text-white border-yellow-400/30">
        <DialogHeader className="border-b border-yellow-400/20 pb-4">
          <DialogTitle className="text-2xl font-bold text-yellow-400 flex items-center">
            <Dumbbell className="w-6 h-6 mr-2" />
            Criar Novo Treino
          </DialogTitle>
          <p className="text-gray-400">
            {selectedDate ? `Para ${selectedDate.toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-yellow-400/10 border border-yellow-400/20">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">Ação Rápida</h3>
                  <p className="text-sm text-gray-400">Criar treino de demonstração com aluno teste</p>
                </div>
                <Button
                  onClick={() => createTestWorkoutMutation.mutate()}
                  disabled={createTestWorkoutMutation.isPending}
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Treino Teste
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-yellow-400 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Nome do Treino
              </Label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Ex: Treino de Força A"
                className="bg-gray-800 border-gray-600 text-white focus:border-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-yellow-400 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Aluno
              </Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Selecionar aluno" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Exercise */}
          <Card className="bg-gray-900/50 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-lg">Adicionar Exercícios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {exercisesList.slice(0, 8).map((exercise: any) => (
                    <Button
                      key={exercise.name}
                      onClick={() => addExercise(exercise.name)}
                      variant="outline"
                      size="sm"
                      className="bg-gray-800/50 border-gray-600 hover:border-yellow-400 hover:bg-yellow-400/10 text-gray-200 hover:text-white text-xs transition-colors"
                    >
                      {exercise.name}
                    </Button>
                  ))}
                </div>

                {/* Custom Exercise Creation */}
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-sm font-medium text-yellow-400 mb-3">Criar Exercício Personalizado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Nome do Exercício</Label>
                      <Input
                        value={customExerciseName}
                        onChange={(e) => setCustomExerciseName(e.target.value)}
                        placeholder="Ex: Rosca Scott"
                        className="bg-gray-700 border-gray-600 text-white h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Categoria</Label>
                      <Select value={customCategory} onValueChange={(value: any) => setCustomCategory(value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="squat">Agachamento</SelectItem>
                          <SelectItem value="bench">Supino</SelectItem>
                          <SelectItem value="deadlift">Terra</SelectItem>
                          <SelectItem value="accessory">Acessório</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={addCustomExercise}
                        className="bg-yellow-400 text-black hover:bg-yellow-500 h-8 w-full"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercises List */}
          {exercises.length > 0 && (
            <Card className="bg-gray-900/50 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-lg">Exercícios do Treino</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{exercise.name}</h4>
                        {exercise.isCustom && (
                          <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded mt-1 inline-block">
                            Personalizado
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => removeExercise(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Séries</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Repetições</Label>
                        <Input
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          placeholder="8-10"
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">RPE</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="6"
                          max="10"
                          value={exercise.plannedRpe}
                          onChange={(e) => updateExercise(index, 'plannedRpe', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Descanso (s)
                        </Label>
                        <Input
                          type="number"
                          value={exercise.restTime}
                          onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-yellow-400">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções especiais, foco do treino, etc."
              className="bg-gray-800 border-gray-600 text-white focus:border-yellow-400"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createWorkoutMutation.isPending}
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
            >
              {createWorkoutMutation.isPending ? "Criando..." : "Criar Treino"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}