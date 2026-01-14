# Workout Generation Workflow

This workflow orchestrates multiple specialized agents to generate a complete personalized workout program.

## 1. Select Exercises

```yaml
call: workers/exercise-selector
input:
  goals: ${input.goals}
  constraints: ${input.constraints}
  preferences: ${input.preferences}
  availableExercises: ${input.availableExercises}
  userProfile: ${input.userProfile}
store: selectedExercises
```

## 2. Plan Weekly Structure

```yaml
call: workers/workout-planner
input:
  goals: ${input.goals}
  userProfile: ${input.userProfile}
  exercises: ${artifacts.selectedExercises.exercises}
  daysPerWeek: ${input.goals.daysPerWeek}
  sessionDuration: ${input.goals.sessionDuration}
store: weeklySchedule
```

## 3. Calculate Progression Matrix

```yaml
call: workers/progression-calculator
input:
  goals: ${input.goals}
  userProfile: ${input.userProfile}
  schedule: ${artifacts.weeklySchedule.weeklySchedule}
  oneRepMaxData: ${input.oneRepMaxData}
  durationWeeks: ${input.goals.duration}
store: progressionMatrix
```

## 4. Generate Week 1 (mode: week1)

```yaml
call: workers/day-generator
input:
  mode: week1
  weekNumber: 1
  schedule: ${artifacts.weeklySchedule.weeklySchedule}
  exercises: ${artifacts.selectedExercises.exercises}
  progression: ${artifacts.progressionMatrix.weeks}
  userProfile: ${input.userProfile}
  expectedDayCount: ${input.goals.daysPerWeek}
  sessionDuration: ${input.goals.sessionDuration}
store: week1Template
```

## 5. Generate Progression Diffs

```yaml
call: workers/progression-diff-generator
input:
  week1Template: ${artifacts.week1Template}
  durationWeeks: ${input.goals.duration}
  progressionMatrix: ${artifacts.progressionMatrix.weeks}
  userProfile: ${input.userProfile}
store: progressionDiffs
```

## 6. Validate Week 1 Structure

```yaml
call: workers/validator
input:
  week1: ${artifacts.week1Template}
  goals: ${input.goals}
  userProfile: ${input.userProfile}
store: validationResult
```

## 7. Assemble Final Program

```yaml
transform: assembleWeeksFromDiffs
input:
  week1Template: ${artifacts.week1Template}
  progressionDiffs: ${artifacts.progressionDiffs}
  durationWeeks: ${input.goals.duration}
  goals: ${input.goals}
  userProfile: ${input.userProfile}
  exerciseCatalog: ${artifacts.selectedExercises.exercises}
store: finalProgram
```
