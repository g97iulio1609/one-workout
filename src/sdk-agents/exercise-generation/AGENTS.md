# Exercise Generation Agent

Generates structured exercises with detailed instructions and metadata.

## Input

- `count`: Number of items to generate
- `description`: Text description
- `existingNames`: List of names to exclude
- `muscleGroups`: Filter by muscle groups
- `bodyPartIds`: Filter by body parts

## Output

List of `GeneratedExercise` items with:

- Name, Description
- Muscles, Body Parts, Equipment
- Instructions, Tips
