/**
 * Day Generator Schema
 *
 * Generates workout days for Week 1 only.
 *
 * NOTE: Subsequent weeks (2-4) are now handled via progression diffs,
 * not by regenerating full days. See progression-diff-generator.
 */

import { z } from 'zod';
import { UserProfileSchema, TrainingPhaseSchema, WorkoutDaySchema } from '../../schema';

// ==================== SHARED SCHEMAS ====================

const DayScheduleSchema = z.object({
  dayNumber: z.number(),
  dayName: z.string(),
  focus: z.array(z.string()),
  muscleGroups: z.array(z.string()),
  exerciseAssignments: z.array(
    z.object({
      exerciseId: z.string(),
      name: z.string(),
      order: z.number(),
    })
  ),
  volumeTargets: z.record(z.string(), z.number()).optional(),
});

const ExerciseInfoSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  category: z.string(),
  targetMuscles: z.array(z.string()),
});

const ProgressionWeekSchema = z.object({
  weekNumber: z.number(),
  phase: TrainingPhaseSchema,
  volumeMultiplier: z.number(),
  intensityMultiplier: z.number(),
  notes: z.string().optional(),
});

// ==================== INPUT ====================

/**
 * Week 1 Generation Input
 *
 * Generates the complete Week 1 template from schedule and exercises.
 * This is the ONLY mode needed - subsequent weeks use diffs.
 */
const Week1InputSchema = z.object({
  mode: z.literal('week1'),
  weekNumber: z.literal(1),
  schedule: z.array(DayScheduleSchema).describe('Day assignments from workout-planner'),
  exercises: z.array(ExerciseInfoSchema).describe('Selected exercises catalog'),
  progression: z.array(ProgressionWeekSchema).describe('Progression matrix'),
  userProfile: UserProfileSchema,
  expectedDayCount: z
    .number()
    .min(2)
    .max(7)
    .describe(
      'CRITICAL: You MUST generate EXACTLY this many days in your output. If expectedDayCount=5, output.days array MUST have length 5.'
    ),
  sessionDuration: z
    .number()
    .min(20)
    .describe(
      'CRITICAL TIME CONSTRAINT: Each workout day MUST have estimatedDuration <= this value. Budget your sets/exercises accordingly.'
    ),
});

// Main input schema (single mode now)
export const DayGeneratorInputSchema = Week1InputSchema;

// ==================== OUTPUT ====================

export const DayGeneratorOutputSchema = z.object({
  weekNumber: z.number(),
  phase: TrainingPhaseSchema,
  days: z
    .array(WorkoutDaySchema)
    .min(1)
    .describe('MUST contain ALL days from the input schedule - same length as schedule.length'),
  notes: z.string().optional(),
});

// ==================== TYPE EXPORTS ====================

export type DayGeneratorInput = z.infer<typeof DayGeneratorInputSchema>;
export type DayGeneratorOutput = z.infer<typeof DayGeneratorOutputSchema>;
export type Week1Input = z.infer<typeof Week1InputSchema>;
