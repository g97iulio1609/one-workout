/**
 * Program Assembler Schema
 *
 * Assembles the final workout program from Week 1 template and progression diffs.
 * Applies diffs PROGRAMMATICALLY to clone and modify weeks 2-4.
 */

import { z } from 'zod';
import {
  WorkoutGoalsSchema,
  UserProfileSchema,
  WorkoutDaySchema,
  TrainingPhaseSchema,
} from '../../schema';

// ==================== INPUT ====================

const WeekDataSchema = z.object({
  weekNumber: z.number(),
  phase: TrainingPhaseSchema.optional(),
  days: z.array(WorkoutDaySchema),
  notes: z.string().optional(),
});

const ExerciseCatalogItemSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  category: z.string().optional(),
  targetMuscles: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
});

/**
 * Progression change to apply to an exercise
 */
const ProgressionChangeSchema = z.object({
  dayNumber: z.number().int().positive(),
  exerciseIndex: z.number().int().nonnegative(),
  setGroupIndex: z.number().int().nonnegative(),
  reps: z.number().int().positive(),
  weight: z.number().nonnegative().optional(),
  weightLbs: z.number().nonnegative().optional(),
  intensityPercent: z.number().min(0).max(100).optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  rest: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
});

/**
 * Diff for a single week
 */
const ProgressionWeekDiffSchema = z.object({
  focus: z.string(),
  notes: z.string().optional(),
  changes: z.array(ProgressionChangeSchema),
});

/**
 * Complete progression diffs from progression-diff-generator
 */
const ProgressionDiffsSchema = z.object({
  week2: ProgressionWeekDiffSchema,
  week3: ProgressionWeekDiffSchema.optional(),
  week4: ProgressionWeekDiffSchema.optional(),
});

export const ProgramAssemblerInputSchema = z.object({
  week1: WeekDataSchema.describe('Week 1 template - source of truth for structure'),
  progressionDiffs: ProgressionDiffsSchema.describe('Diffs to apply for weeks 2-4'),
  durationWeeks: z.number().min(1).max(4).describe('Total program duration'),
  exerciseCatalog: z
    .array(ExerciseCatalogItemSchema)
    .describe('Full exercise catalog for ID correction'),
  userProfile: UserProfileSchema,
  goals: WorkoutGoalsSchema,
});

// ==================== OUTPUT ====================

const ProgramMetadataSchema = z.object({
  totalWeeks: z.number(),
  totalDays: z.number(),
  totalExercises: z.number(),
  estimatedTotalDuration: z.number().describe('Minutes for entire program'),
  muscleGroupCoverage: z.record(z.string(), z.number()).describe('Muscle -> weekly sets'),
  exerciseCorrections: z.number().describe('Number of exercise IDs corrected'),
  diffsApplied: z.number().describe('Number of progression changes applied'),
});

const AssembledWeekSchema = z.object({
  weekNumber: z.number(),
  phase: TrainingPhaseSchema,
  days: z.array(WorkoutDaySchema),
  weeklyVolume: z.record(z.string(), z.number()).optional(),
  notes: z.string().optional(),
});

export const ProgramAssemblerOutputSchema = z.object({
  program: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    weeks: z.array(AssembledWeekSchema),
    metadata: ProgramMetadataSchema,
  }),
  assemblyNotes: z.string().describe('Summary of assembly process'),
});

// ==================== TYPE EXPORTS ====================

export type ProgramAssemblerInput = z.infer<typeof ProgramAssemblerInputSchema>;
export type ProgramAssemblerOutput = z.infer<typeof ProgramAssemblerOutputSchema>;
export type ProgressionChange = z.infer<typeof ProgressionChangeSchema>;
export type ProgressionWeekDiff = z.infer<typeof ProgressionWeekDiffSchema>;
