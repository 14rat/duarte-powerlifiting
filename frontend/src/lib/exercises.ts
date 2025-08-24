/**
 * Predefined exercises for powerlifting training
 * Organized by categories: squat, bench, deadlift, accessory
 */

export interface ExerciseDefinition {
  name: string;
  category: 'squat' | 'bench' | 'deadlift' | 'accessory';
  description?: string;
  muscles: string[];
}

export const EXERCISES: ExerciseDefinition[] = [
  // SQUAT VARIATIONS
  {
    name: "Agachamento Livre",
    category: "squat",
    description: "Agachamento com barra livre nas costas, posição alta",
    muscles: ["Quadríceps", "Glúteos", "Core"]
  },
  {
    name: "Front Squat",
    category: "squat", 
    description: "Agachamento com barra na frente do corpo",
    muscles: ["Quadríceps", "Core", "Deltoides anteriores"]
  },
  {
    name: "Box Squat",
    category: "squat",
    description: "Agachamento sentando em uma caixa ou banco",
    muscles: ["Quadríceps", "Glúteos", "Isquiotibiais"]
  },
  {
    name: "Agachamento Búlgaro",
    category: "squat",
    description: "Agachamento unilateral com pé elevado atrás",
    muscles: ["Quadríceps", "Glúteos", "Core"]
  },
  {
    name: "Globet Squat",
    category: "squat",
    description: "Agachamento segurando peso na frente do peito",
    muscles: ["Quadríceps", "Glúteos", "Core"]
  },
  {
    name: "Sumo",
    category: "deadlift",
    description: "Levantamento terra com abertura ampla de pernas",
    muscles: ["Glúteos", "Adutores", "Quadríceps"]
  },

  // BENCH PRESS VARIATIONS
  {
    name: "Supino Reto",
    category: "bench",
    description: "Supino no banco reto com barra",
    muscles: ["Peitoral", "Tríceps", "Deltoides anteriores"]
  },
  {
    name: "Supino Inclinado",
    category: "bench",
    description: "Supino no banco inclinado com barra",
    muscles: ["Peitoral superior", "Tríceps", "Deltoides"]
  },
  {
    name: "Supino Declinado",
    category: "bench",
    description: "Supino no banco declinado com barra",
    muscles: ["Peitoral inferior", "Tríceps"]
  },
  {
    name: "Supino com Halteres",
    category: "bench",
    description: "Supino reto utilizando halteres",
    muscles: ["Peitoral", "Tríceps", "Estabilizadores"]
  },
  {
    name: "Supino Inclinado com Halteres",
    category: "bench",
    description: "Supino inclinado utilizando halteres",
    muscles: ["Peitoral superior", "Tríceps", "Deltoides"]
  },
  {
    name: "Supino Fechado",
    category: "bench",
    description: "Supino com pegada mais estreita, foco em tríceps",
    muscles: ["Tríceps", "Peitoral", "Deltoides anteriores"]
  },

  // DEADLIFT VARIATIONS
  {
    name: "Levantamento Terra Convencional",
    category: "deadlift",
    description: "Levantamento terra clássico com pegada convencional",
    muscles: ["Isquiotibiais", "Glúteos", "Eretores", "Trapézio"]
  },
  {
    name: "Levantamento Terra Sumo",
    category: "deadlift",
    description: "Levantamento terra com abertura ampla de pernas",
    muscles: ["Glúteos", "Quadríceps", "Eretores", "Trapézio"]
  },
  {
    name: "Stiff",
    category: "deadlift",
    description: "Levantamento terra com pernas estendidas",
    muscles: ["Isquiotibiais", "Glúteos", "Eretores"]
  },
  {
    name: "Romanian Deadlift",
    category: "deadlift",
    description: "Variação com descida controlada até meio da canela",
    muscles: ["Isquiotibiais", "Glúteos", "Eretores"]
  },
  {
    name: "Deficit Deadlift",
    category: "deadlift",
    description: "Levantamento terra em superfície elevada",
    muscles: ["Isquiotibiais", "Glúteos", "Eretores", "Quadríceps"]
  },
  {
    name: "Rack Pull",
    category: "deadlift",
    description: "Levantamento terra parcial iniciado do rack",
    muscles: ["Eretores", "Trapézio", "Romboides"]
  },

  // ACCESSORY EXERCISES
  {
    name: "Remada Curvada",
    category: "accessory",
    description: "Remada com barra curvado para frente",
    muscles: ["Latíssimo", "Romboides", "Trapézio médio", "Bíceps"]
  },
  {
    name: "Remada Unilateral",
    category: "accessory",
    description: "Remada com halter apoiado no banco",
    muscles: ["Latíssimo", "Romboides", "Trapézio", "Bíceps"]
  },
  {
    name: "Pulldown",
    category: "accessory",
    description: "Puxada no pulley alto",
    muscles: ["Latíssimo", "Romboides", "Bíceps"]
  },
  {
    name: "Pull-up/Chin-up",
    category: "accessory",
    description: "Barra fixa com peso corporal ou adicionado",
    muscles: ["Latíssimo", "Bíceps", "Romboides"]
  },
  {
    name: "Desenvolvimento Militar",
    category: "accessory",
    description: "Desenvolvimento de ombros em pé com barra",
    muscles: ["Deltoides", "Tríceps", "Core"]
  },
  {
    name: "Desenvolvimento com Halteres",
    category: "accessory",
    description: "Desenvolvimento de ombros sentado com halteres",
    muscles: ["Deltoides", "Tríceps"]
  },
  {
    name: "Elevação Lateral",
    category: "accessory",
    description: "Elevação lateral com halteres",
    muscles: ["Deltoides médios"]
  },
  {
    name: "Face Pull",
    category: "accessory",
    description: "Puxada para o rosto no cabo",
    muscles: ["Deltoides posteriores", "Romboides", "Trapézio"]
  },
  {
    name: "Rosca Direta",
    category: "accessory",
    description: "Rosca bíceps com barra",
    muscles: ["Bíceps", "Braquial"]
  },
  {
    name: "Rosca Martelo",
    category: "accessory",
    description: "Rosca com halteres em pegada neutra",
    muscles: ["Bíceps", "Braquiorradial"]
  },
  {
    name: "Tríceps Pulley",
    category: "accessory",
    description: "Extensão de tríceps no cabo",
    muscles: ["Tríceps"]
  },
  {
    name: "Tríceps Testa",
    category: "accessory",
    description: "Extensão de tríceps deitado com barra",
    muscles: ["Tríceps"]
  },
  {
    name: "Dips",
    category: "accessory",
    description: "Mergulho nas barras paralelas",
    muscles: ["Tríceps", "Peitoral inferior", "Deltoides"]
  },
  {
    name: "Leg Press",
    category: "accessory",
    description: "Prensa de pernas na máquina",
    muscles: ["Quadríceps", "Glúteos"]
  },
  {
    name: "Extensão de Quadríceps",
    category: "accessory",
    description: "Extensão de pernas na máquina",
    muscles: ["Quadríceps"]
  },
  {
    name: "Flexão de Isquiotibiais",
    category: "accessory",
    description: "Flexão de pernas na máquina",
    muscles: ["Isquiotibiais"]
  },
  {
    name: "Panturrilha em Pé",
    category: "accessory",
    description: "Elevação de panturrilha em pé",
    muscles: ["Gastrocnêmio", "Sóleo"]
  },
  {
    name: "Panturrilha Sentado",
    category: "accessory",
    description: "Elevação de panturrilha sentado",
    muscles: ["Sóleo"]
  },
  {
    name: "Hip Thrust",
    category: "accessory",
    description: "Elevação de quadril com barra",
    muscles: ["Glúteos", "Isquiotibiais"]
  },
  {
    name: "Ponte de Glúteo",
    category: "accessory",
    description: "Elevação de quadril sem peso adicional",
    muscles: ["Glúteos", "Core"]
  },
  {
    name: "Prancha",
    category: "accessory",
    description: "Exercício isométrico de core",
    muscles: ["Core", "Estabilizadores"]
  },
  {
    name: "Abdominais",
    category: "accessory",
    description: "Flexão abdominal tradicional",
    muscles: ["Reto abdominal"]
  },
  {
    name: "Russian Twist",
    category: "accessory",
    description: "Rotação de tronco com peso",
    muscles: ["Oblíquos", "Core"]
  },
  {
    name: "Farmer's Walk",
    category: "accessory",
    description: "Caminhada carregando peso nas mãos",
    muscles: ["Trapézio", "Antebraços", "Core", "Pernas"]
  },
  {
    name: "Kettlebell Swing",
    category: "accessory",
    description: "Balanço com kettlebell",
    muscles: ["Glúteos", "Isquiotibiais", "Core", "Deltoides"]
  }
];

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: ExerciseDefinition['category']): ExerciseDefinition[] {
  return EXERCISES.filter(exercise => exercise.category === category);
}

/**
 * Get exercise by name
 */
export function getExerciseByName(name: string): ExerciseDefinition | undefined {
  return EXERCISES.find(exercise => exercise.name === name);
}

/**
 * Get all exercise names as array
 */
export function getAllExerciseNames(): string[] {
  return EXERCISES.map(exercise => exercise.name);
}

/**
 * Search exercises by name or muscle group
 */
export function searchExercises(query: string): ExerciseDefinition[] {
  const lowercaseQuery = query.toLowerCase();
  return EXERCISES.filter(exercise => 
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.muscles.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
    exercise.description?.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get category display name in Portuguese
 */
export function getCategoryDisplayName(category: ExerciseDefinition['category']): string {
  const categoryNames = {
    squat: 'Agachamento',
    bench: 'Supino',
    deadlift: 'Levantamento Terra', 
    accessory: 'Acessórios'
  };
  
  return categoryNames[category] || category;
}
