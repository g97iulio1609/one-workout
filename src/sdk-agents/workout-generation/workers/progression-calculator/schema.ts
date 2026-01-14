/**
 * Progression Calculator Schema
 */

import { z } from 'zod';
import { WorkoutGoalsSchema, UserProfileSchema, TrainingPhaseSchema } from '../../schema';

// ==================== INPUT ====================

export const ProgressionCalculatorInputSchema = z.object({
  goals: WorkoutGoalsSchema,
  userProfile: UserProfileSchema,
  schedule: z.array(
    z.object({
      dayNumber: z.number(),
      dayName: z.string(),
      muscleGroups: z.array(z.string()),
    })
  ),
  oneRepMaxData: z
    .array(
      z.object({
        exerciseId: z.string(),
        exerciseName: z.string(),
        weight: z.number(),
        weightUnit: z.enum(['kg', 'lbs']),
      })
    )
    .optional(),
  durationWeeks: z.number(),
});

// ==================== OUTPUT ====================

export const WeekProgressionSchema = z.object({
  weekNumber: z.number(),
  phase: TrainingPhaseSchema,
  volumeMultiplier: z.number().describe('1.0 = baseline, 1.1 = +10%'),
  intensityMultiplier: z.number().describe('0.75 = 75% of 1RM'),
  notes: z.string().optional(),
});

export const ProgressionCalculatorOutputSchema = z.object({
  weeks: z.array(WeekProgressionSchema),
  periodizationModel: z.enum(['linear', 'undulating', 'block', 'autoregulated']),
  deloadSchedule: z.array(z.number()).describe('Week numbers that are deloads'),
  progressionRationale: z.string(),
});

// ==================== TYPE EXPORTS ====================

export type ProgressionCalculatorInput = z.infer<typeof ProgressionCalculatorInputSchema>;
export type ProgressionCalculatorOutput = z.infer<typeof ProgressionCalculatorOutputSchema>;
export type WeekProgression = z.infer<typeof WeekProgressionSchema>;
