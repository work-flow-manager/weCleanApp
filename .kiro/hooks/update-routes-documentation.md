# Update Routes Documentation

## Description
This hook automatically updates the routes.md documentation file whenever a new page is added to the application. It ensures that the routes documentation stays in sync with the actual application structure.

## Trigger
- When a new file named `page.tsx` or `page.js` is created or modified in the `src/app` directory or its subdirectories

## Execution
```typescript
// This hook runs when a new page file is created or modified
// It updates the routes.md documentation to include the new route

// 1. Scan the src/app directory to identify all routes
// 2. Parse the existing routes.md file
// 3. Update the routes.md file with any new routes found
// 4. Preserve existing route descriptions and access levels if available
// 5. Add placeholders for new routes that need to be filled in manually
```

## Agent Instructions

When this hook is triggered, you should:

1. Scan the entire `src/app` directory structure to identify all page routes
2. Read the current `.kiro/steering/routes.md` file
3. For each new route found that isn't documented in routes.md:
   - Add it to the appropriate section in the routes table
   - Use the directory structure to determine the route path
   - Add a placeholder description like "[New Route] - Description needed"
   - Set access to "TBD" if it can't be determined from context
4. Preserve all existing route information (descriptions, access levels) for routes that are already documented
5. Maintain the formatting and structure of the existing routes.md file
6. If a new section is needed (e.g., a new group of related routes), create it following the existing pattern
7. Update the file without removing any existing documentation

Remember to:
- Handle internationalization correctly (routes under `[locale]`)
- Identify API routes separately from page routes
- Maintain the table format for consistency
- Group related routes together in the appropriate sections
- Consider the route's location and naming to infer its purpose when possible

## Example Update

If a new route `/[locale]/team/schedule` is added, you would:

1. Identify which section it belongs to (likely "Dashboard Routes" or a new "Team Routes" section)
2. Add a new row to the appropriate table:

```
| `/[locale]/team/schedule` | [New Route] - Team scheduling interface | TBD |
```

3. Save the updated routes.md file

## Notes
- This hook helps maintain up-to-date documentation of the application's routing structure
- Manual review may still be needed to add accurate descriptions and access levels
- The hook should be non-destructive, only adding new information without removing existing documentation