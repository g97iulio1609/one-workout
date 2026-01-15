/**
 * Workout Transforms Registration
 *
 * Registers programmatic transforms for the OneAgent SDK workflow.
 * These are TypeScript functions that run instead of AI calls.
 *
 * Features:
 * - assembleWeeksFromDiffs: Clones Week 1 and applies progression diffs
 * - mergeExercises: Validates and corrects exercise IDs using catalog
 * - 1RM Weight Calculation: Calculates weights from intensityPercent using user's 1RM values
 *
 * Call registerWorkoutTransforms() at app initialization.
 */

import { registerTransforms } from '@onecoach/one-agent/framework';
import { assembleWeeksFromDiffs, validateWeeksConsistency } from './program-diff-patcher';
import {
  applyUserOneRepMaxWeights,
  oneRepMaxArrayToMap,
  type UserOneRepMax,
} from './apply-1rm-weights';
import {
  mergeExercisesSync,
  type MergeExercisesInput,
} from '../sdk-agents/workout-generation/transforms/merge-exercises';

/**
 * Transform wrapper for assembleWeeksFromDiffs
 *
 * This is the main transform that clones Week 1 and applies progression diffs.
 * Input from WORKFLOW.md:
 * - week1Template: The complete Week 1 from day-generator
 * - progressionDiffs: Diffs for weeks 2-4 from progression-diff-generator
 * - durationWeeks: Total program duration
 * - goals: User goals (for metadata)
 * - userProfile: User profile (for metadata)
 * - exerciseCatalog: Available exercises (for ID validation)
 */
function assembleWeeksFromDiffsTransform(input: Record<string, unknown>): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const week1Template = input.week1Template as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progressionDiffs = input.progressionDiffs as any;
  const durationWeeks = (input.durationWeeks as number) || 4;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const goals = input.goals as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exerciseCatalog = input.exerciseCatalog as any[];

  // Validate inputs
  if (!week1Template) {
    throw new Error('[assembleWeeksFromDiffs] week1Template is required');
  }
  if (!progressionDiffs) {
    throw new Error('[assembleWeeksFromDiffs] progressionDiffs is required');
  }

  // Use the programmatic diff patcher
  const weeks = assembleWeeksFromDiffs(week1Template, progressionDiffs, durationWeeks);

  // Validate consistency
  const validation = validateWeeksConsistency(weeks);
  if (!validation.valid) {
  }

  // Build the final program structure matching WorkoutProgramSchema
  const program = {
    id: crypto.randomUUID(),
    name: generateProgramName(goals),
    description: `${durationWeeks}-week personalized training program`,
    // Required fields from schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: (input.userProfile as any)?.userId || 'temp-user-id',
    durationWeeks: durationWeeks,
    splitType: determineSplitType(week1Template) as
      | 'full_body'
      | 'upper_lower'
      | 'push_pull_legs'
      | 'bro_split'
      | 'custom',
    primaryGoal: (goals?.primary || 'hypertrophy') as
      | 'strength'
      | 'hypertrophy'
      | 'endurance'
      | 'power'
      | 'general_fitness',
    weeks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      totalWeeks: weeks.length,
      totalDays: weeks.reduce((sum, w) => sum + w.days.length, 0),
      totalExercises: weeks.reduce(
        (sum, w) => sum + w.days.reduce((daySum, d) => daySum + d.setGroups.length, 0),
        0
      ),
      durationWeeks,
      exerciseCatalogSize: exerciseCatalog?.length || 0,
      validationErrors: validation.errors,
    },
  };

  // Apply 1RM-based weight calculation if userOneRepMaxes is provided
  // Format: Array<{ exerciseId: string; oneRepMax: number }>
  const userOneRepMaxes = input.userOneRepMaxes as UserOneRepMax[] | undefined;
  // User's preferred weight increment (e.g., 2.5kg or 2kg), default 2.5
  const weightIncrement = (input.weightIncrement as number) || 2.5;
  let finalProgram = program;

  if (userOneRepMaxes && userOneRepMaxes.length > 0) {
    const oneRepMaxMap = oneRepMaxArrayToMap(userOneRepMaxes);
    finalProgram = applyUserOneRepMaxWeights(
      program,
      oneRepMaxMap,
      weightIncrement
    ) as typeof program;
  } else {
  }

  // Return complete output matching WorkoutGenerationOutputSchema
  // This is used directly by skipSynthesis in engine.ts
  return {
    program: finalProgram,
    tokensUsed: 0, // Will be updated from context.meta
    costUSD: 0, // Will be updated from context.meta
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a premium-sounding program name
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateProgramName(goals: any): string {
  const goal = goals?.primary || 'strength';
  const duration = goals?.duration || 4;

  const goalNames: Record<string, string> = {
    strength: 'Strength Foundation',
    hypertrophy: 'Mass Builder',
    endurance: 'Endurance Protocol',
    power: 'Power Phase',
    general_fitness: 'Athletic Base',
  };

  const phaseName = goalNames[goal] || 'Training Block';
  return `${duration}-Week ${phaseName}`;
}

/**
 * Determine split type from week template day names
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineSplitType(week1Template: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dayNames = (week1Template?.days || []).map((d: any) => d.dayName?.toLowerCase() || '');

  // Check for push/pull/legs pattern
  const hasPush = dayNames.some((n: string) => n.includes('push'));
  const hasPull = dayNames.some((n: string) => n.includes('pull'));
  const hasLegs = dayNames.some((n: string) => n.includes('leg'));
  if (hasPush && hasPull && hasLegs) return 'push_pull_legs';

  // Check for upper/lower pattern
  const hasUpper = dayNames.some((n: string) => n.includes('upper'));
  const hasLower = dayNames.some((n: string) => n.includes('lower'));
  if (hasUpper && hasLower) return 'upper_lower';

  // Check for full body
  const hasFullBody = dayNames.some((n: string) => n.includes('full'));
  if (hasFullBody) return 'full_body';

  // Check for bro split patterns (chest, back, shoulders, etc.)
  const hasBroSplitDays = dayNames.some(
    (n: string) =>
      n.includes('chest') || n.includes('back') || n.includes('arm') || n.includes('shoulder')
  );
  if (hasBroSplitDays) return 'bro_split';

  // Default to custom
  return 'custom';
}

/**
 * Transform wrapper for mergeExercises
 *
 * Validates and corrects exercise IDs in Week 1 template using the catalog.
 * This runs after exercise-selector and before progression calculations.
 *
 * Input:
 * - week1Template: The Week 1 from exercise-selector
 * - exerciseCatalog: Available exercises for validation
 *
 * Output:
 * - validatedWeek1: Week 1 with corrected exercise IDs
 * - correctionStats: Statistics about corrections made
 */
function mergeExercisesTransform(input: Record<string, unknown>): unknown {
  const mergeInput: MergeExercisesInput = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    week1Template: input.week1Template as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exerciseCatalog: (input.exerciseCatalog as any[]) || [],
  };

  // Use sync version since transforms are synchronous
  const result = mergeExercisesSync(mergeInput);

  console.log('[mergeExercisesTransform] Completed:', {
    total: result.correctionStats.total,
    corrected: result.correctionStats.corrected,
  });

  return result;
}

/**
 * Register all workout transforms with the SDK
 * Call this at app initialization (e.g., in instrumentation.ts or api route)
 */
export function registerWorkoutTransforms(): void {
  registerTransforms({
    assembleWeeksFromDiffs: assembleWeeksFromDiffsTransform,
    mergeExercises: mergeExercisesTransform,
  });
}

// Export for direct use if needed
export { assembleWeeksFromDiffsTransform, mergeExercisesTransform };
