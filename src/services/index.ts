/**
 * Workout Services
 *
 * Service layer for workout domain operations.
 */

// Workout Generation (OneAgent SDK v4.1)
export {
  generateWorkoutProgram,
  initializeWorkoutGeneration,
  getWorkoutBasePath,
  type WorkoutGenerationResult,
  type GenerateOptions,
} from './workout-generation.service';

// Exercise Generation
export {
  generateExercises,
  initializeExerciseGeneration,
  type ExerciseGenerationResult,
} from './exercise-generation.service';
