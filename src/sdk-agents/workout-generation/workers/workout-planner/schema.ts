/**
 * Workout Planner Schema
 *
 * CRITICAL: The AI MUST generate exactly `daysPerWeek` days in the output.
 * Each day MUST have 4-6 exercises for adequate training volume.
 */

import { z } from 'zod';
import { WorkoutGoalsSchema, UserProfileSchema, SplitTypeSchema } from '../../schema';

// ==================== INPUT ====================

export const WorkoutPlannerInputSchema = z.object({
  goals: WorkoutGoalsSchema,
  userProfile: UserProfileSchema,
  exercises: z
    .array(
      z.object({
        exerciseId: z.string(),
        name: z.string(),
        category: z.string(),
        targetMuscles: z.array(z.string()),
        equipment: z.array(z.string()),
      })
    )
    .describe('Available exercises to distribute across training days'),

  // PRIMARY CONSTRAINTS
  daysPerWeek: z
    .number()
    .min(2)
    .max(7)
    .describe(
      'NUMBER OF DAYS TO GENERATE. weeklySchedule array MUST contain EXACTLY this many items.'
    ),
  sessionDuration: z
    .number()
    .min(20)
    .describe(
      'Minutes per session. Determines exercises per day based on available training time.'
    ),
});

// ==================== OUTPUT ====================

const ExerciseAssignmentSchema = z.object({
  exerciseId: z.string().describe('ID from input exercises'),
  name: z.string().describe('Exercise name'),
  order: z.number().describe('Order within the day (1-based)'),
});

export const DayScheduleSchema = z.object({
  dayNumber: z.number().min(1).max(7).describe('Day number (1 to daysPerWeek)'),
  dayName: z.string().describe('e.g. "Push", "Pull", "Legs", "Upper", "Lower"'),
  focus: z.array(z.string()).describe('Primary focus areas'),
  muscleGroups: z.array(z.string()).describe('Target muscle groups'),
  exerciseAssignments: z
    .array(ExerciseAssignmentSchema)
    .describe(
      'Exercises for this day - determine count based on sessionDuration, goals, and experience level'
    ),
  volumeTargets: z
    .record(z.string(), z.number())
    .optional()
    .describe('Optional: muscle -> target sets'),
});

export const WorkoutPlannerOutputSchema = z.object({
  splitType: SplitTypeSchema.describe('Training split type'),

  // CRITICAL ARRAY: Length MUST equal input.daysPerWeek
  weeklySchedule: z
    .array(DayScheduleSchema)
    .min(2)
    .max(7)
    .describe('MUST contain EXACTLY daysPerWeek items. If daysPerWeek=5, this array has 5 items.'),

  weeklyVolumeSummary: z
    .record(
      z.string(),
      z.object({
        sets: z.number(),
        frequency: z.number(),
      })
    )
    .describe('Weekly volume per muscle group'),

  planningRationale: z.string().describe('Brief explanation of split choice'),
});

// ==================== TYPE EXPORTS ====================

export type WorkoutPlannerInput = z.infer<typeof WorkoutPlannerInputSchema>;
export type WorkoutPlannerOutput = z.infer<typeof WorkoutPlannerOutputSchema>;
export type DaySchedule = z.infer<typeof DayScheduleSchema>;
