/**
 * Calculate 1RM using various formulas based on RPE (Rate of Perceived Exertion)
 * The primary method uses the RPE-based calculation which is more accurate for powerlifting
 */

/**
 * RPE to percentage of 1RM conversion table
 * Based on Mike Tuchscherer's RPE scale for powerlifting
 */
const rpeToPercentage: Record<number, number> = {
  10: 100,    // Maximum effort, no reps left
  9.5: 97.5,  // Maybe 1 more rep
  9: 95,      // 1 rep left
  8.5: 92.5,  // Maybe 2 more reps  
  8: 90,      // 2 reps left
  7.5: 87.5,  // Maybe 3 more reps
  7: 85,      // 3 reps left
  6.5: 82.5,  // Maybe 4 more reps
  6: 80,      // 4 reps left
  5: 75,      // 5+ reps left
};

/**
 * Calculate 1RM using RPE-based method
 * @param weight - Weight lifted in kg
 * @param reps - Number of repetitions performed
 * @param rpe - Rate of Perceived Exertion (6-10 scale)
 * @returns Estimated 1RM in kg
 */
export function calculate1RM(weight: number, reps: number, rpe: number): number {
  if (weight <= 0 || reps <= 0 || rpe < 6 || rpe > 10) {
    return 0;
  }

  // Round RPE to nearest 0.5
  const roundedRpe = Math.round(rpe * 2) / 2;
  
  // Get percentage from RPE
  const percentage = rpeToPercentage[roundedRpe] || 85; // Default to RPE 7 if not found
  
  // Adjust for number of reps
  // Each additional rep beyond 1 reduces the percentage slightly
  const repAdjustment = Math.max(0, (reps - 1) * 2.5);
  const adjustedPercentage = Math.max(percentage - repAdjustment, 50);
  
  // Calculate 1RM
  const oneRM = (weight * 100) / adjustedPercentage;
  
  return Math.round(oneRM * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate 1RM using Epley formula (alternative method)
 * @param weight - Weight lifted in kg  
 * @param reps - Number of repetitions performed
 * @returns Estimated 1RM in kg
 */
export function calculate1RMEpley(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }
  
  if (reps === 1) {
    return weight;
  }
  
  const oneRM = weight * (1 + reps / 30);
  return Math.round(oneRM * 10) / 10;
}

/**
 * Calculate 1RM using Brzycki formula (alternative method)
 * @param weight - Weight lifted in kg
 * @param reps - Number of repetitions performed  
 * @returns Estimated 1RM in kg
 */
export function calculate1RMBrzycki(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }
  
  if (reps === 1) {
    return weight;
  }
  
  const oneRM = weight / (1.0278 - 0.0278 * reps);
  return Math.round(oneRM * 10) / 10;
}

/**
 * Calculate target weight for a given rep range at specific RPE
 * @param oneRM - Known or estimated 1RM
 * @param targetReps - Target number of reps
 * @param targetRpe - Target RPE
 * @returns Suggested weight in kg
 */
export function calculateTargetWeight(oneRM: number, targetReps: number, targetRpe: number): number {
  if (oneRM <= 0 || targetReps <= 0 || targetRpe < 6 || targetRpe > 10) {
    return 0;
  }
  
  const roundedRpe = Math.round(targetRpe * 2) / 2;
  const percentage = rpeToPercentage[roundedRpe] || 85;
  
  // Adjust for reps
  const repAdjustment = Math.max(0, (targetReps - 1) * 2.5);
  const adjustedPercentage = Math.max(percentage - repAdjustment, 50);
  
  const targetWeight = (oneRM * adjustedPercentage) / 100;
  return Math.round(targetWeight * 2) / 2; // Round to nearest 0.5kg
}

/**
 * Get RPE description for user interface
 * @param rpe - RPE value
 * @returns Human-readable RPE description
 */
export function getRpeDescription(rpe: number): string {
  const descriptions: Record<number, string> = {
    10: "Máximo esforço - não conseguiria fazer mais nenhuma rep",
    9.5: "Talvez conseguisse 1 rep a mais",
    9: "Conseguiria 1 rep a mais",
    8.5: "Talvez conseguisse 2 reps a mais", 
    8: "Conseguiria 2 reps a mais",
    7.5: "Talvez conseguisse 3 reps a mais",
    7: "Conseguiria 3 reps a mais",
    6.5: "Talvez conseguisse 4 reps a mais",
    6: "Conseguiria 4 reps a mais",
    5: "Conseguiria 5 ou mais reps a mais",
  };
  
  const roundedRpe = Math.round(rpe * 2) / 2;
  return descriptions[roundedRpe] || "RPE não reconhecido";
}
