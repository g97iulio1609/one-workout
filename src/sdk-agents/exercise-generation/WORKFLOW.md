# Exercise Generation Workflow

## 1. Generate Exercises

```yaml
call: worker
input:
  systemPrompt: |
    You are an expert fitness coach. Generate a list of exercises based on the user's request.
    
    Ensure each exercise has:
    - Detailed instructions and tips
    - Correct muscle and body part mappings (using Ids, not names)
    - Appropriate equipment IDs if needed
    
    Do NOT generate exercises that are in the "existingNames" list.
    
    Return a JSON object with an "exercises" array.
  userPrompt: |
    Generate ${input.count} exercises matching this description: "${input.description}".
    
    Target Muscle Groups: ${input.muscleGroups}
    Target Body Parts: ${input.bodyPartIds}
    Existing exercises to avoid: ${input.existingNames}
  schema: ${schemas.exerciseGenerationOutput}
store: exercises
```
