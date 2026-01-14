/**
 * Validator Schema
 *
 * Validates the Week 1 workout template.
 * Since subsequent weeks are generated via diffs, we only validate Week 1 structure.
 */

import { z } from 'zod';
import { WorkoutGoalsSchema, UserProfileSchema, WorkoutDaySchema } from '../../schema';

// ==================== INPUT ====================

const WeekDataSchema = z.object({
  weekNumber: z.number(),
  phase: z.string().optional(),
  days: z.array(WorkoutDaySchema),
  notes: z.string().optional(),
});

export const ValidatorInputSchema = z.object({
  week1: WeekDataSchema.describe('Week 1 template to validate'),
  goals: WorkoutGoalsSchema,
  userProfile: UserProfileSchema,
});

// ==================== OUTPUT ====================

export const ValidationIssueSchema = z.object({
  severity: z.enum(['critical', 'major', 'minor']),
  category: z.enum(['safety', 'consistency', 'progression', 'volume', 'balance']),
  dayNumber: z.number(),
  exerciseId: z.string().optional(),
  issue: z.string().describe('Description of the problem'),
  suggestedFix: z.string().describe('How to fix it'),
});

export const ValidatorOutputSchema = z.object({
  isValid: z.boolean().describe('True if no critical issues'),
  hasIssues: z.boolean().describe('True if any issues found'),
  overallScore: z.number().min(0).max(100).describe('Program quality score'),
  issues: z.array(ValidationIssueSchema).describe('List of issues found'),
  strengths: z.array(z.string()).describe('Positive aspects of the program'),
  summary: z.string().describe('Overall assessment'),
});

// ==================== TYPE EXPORTS ====================

export type ValidatorInput = z.infer<typeof ValidatorInputSchema>;
export type ValidatorOutput = z.infer<typeof ValidatorOutputSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
