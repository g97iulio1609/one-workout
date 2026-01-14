/**
 * Exercise Selector Schema
 */

import { z } from 'zod';
import {
  WorkoutGoalsSchema,
  WorkoutConstraintsSchema,
  WorkoutPreferencesSchema,
  UserProfileSchema,
  ExperienceLevelSchema,
} from '../../schema';

// ==================== INPUT ====================

export const ExerciseSelectorInputSchema = z.object({
  goals: WorkoutGoalsSchema,
  constraints: WorkoutConstraintsSchema,
  preferences: WorkoutPreferencesSchema.optional(),
  userProfile: UserProfileSchema,
  // Accept either string IDs or full exercise objects
  availableExercises: z
    .array(
      z.union([
        z.string().describe('Exercise ID'),
        z.object({
          id: z.string(),
          name: z.string(),
          category: z.string(),
          targetMuscles: z.array(z.string()),
          equipment: z.array(z.string()),
          difficulty: ExperienceLevelSchema.optional(),
        }),
      ])
    )
    .optional(),
});

// ==================== OUTPUT ====================

export const SelectedExerciseSchema = z.object({
  exerciseId: z.string().describe('MUST be the exact ID from the catalog'),
  name: z.string(),
  category: z.enum(['compound', 'isolation', 'cardio', 'core', 'mobility']),
  targetMuscles: z.array(z.string()),
  equipment: z.array(z.string()),
  difficulty: ExperienceLevelSchema,
  recommendedFor: z.array(z.string()).describe('Day types this exercise is suited for'),
  notes: z.string().optional(),
});

export const ExerciseSelectorOutputSchema = z.object({
  exercises: z.array(SelectedExerciseSchema),
  muscleGroupCoverage: z
    .record(z.string(), z.array(z.string()))
    .describe('Muscle -> exercise names'),
  selectionRationale: z.string(),
});

// ==================== TYPE EXPORTS ====================

export type ExerciseSelectorInput = z.infer<typeof ExerciseSelectorInputSchema>;
export type ExerciseSelectorOutput = z.infer<typeof ExerciseSelectorOutputSchema>;
export type SelectedExercise = z.infer<typeof SelectedExerciseSchema>;
