# Changelog Generation Command

Generate a new changelog entry by reading all changeset files and creating a properly formatted entry in CHANGELOG.md.

## Process

1. **Read all changeset files** from `.changeset/*.md` (exclude `.changeset/README.md`)

2. **Parse each changeset file**:
   - Extract frontmatter (YAML between `---` markers) to get:
     - Package name(s) affected (e.g., `"@zag-js/combobox": patch`)
     - Version bump type: `patch`, `minor`, or `major`
   - Extract the description after the frontmatter
   - Look for code snippets (markdown code blocks with triple backticks)

3. **Determine the next version**:
   - Find the current version from the latest entry in CHANGELOG.md
   - Calculate next version based on highest bump type found in changesets:
     - `major`: X.0.0 (breaking changes)
     - `minor`: X.Y.0 (new features)
     - `patch`: X.Y.Z (bug fixes)

4. **Group changes by component**:
   - Extract component name from package (e.g., `@zag-js/combobox` � `Combobox`)
   - Use component name mapping for proper casing:
     - `combobox` � `Combobox`
     - `date-picker` � `Date Picker`
     - `file-upload` � `File Upload`
     - `number-input` � `Number Input`
     - etc.

5. **Categorize changes**:
   - **Added**: New features, new APIs, new components (usually `minor` version bumps)
     - Look for keywords: "Add support", "Added", "New", "[NEW]", "[Experimental]"
   - **Fixed**: Bug fixes (usually `patch` version bumps)
     - Look for keywords: "Fix issue", "Fixed", "Resolve", "Ensure"
   - **Changed**: Breaking changes, refactors, improvements (usually `major` version bumps)
     - Look for keywords: "Breaking", "Redesign", "Refactor", "Change default"

6. **Format the entry** using this template:

````markdown
## [X.Y.Z](./#X.Y.Z) - YYYY-MM-DD

### Added

- **Component Name**
  - Description of what was added
  - Can include multiple bullet points

  ```ts
  // Include code snippets if found in changeset
  const example = "code"
  ```
````

### Fixed

- **Component Name**: Description of fix (use colon for single-line fixes)
- **Component Name**
  - Description of fix (use bullet points for multi-line)
  - Another fix detail

### Changed

- **Component Name**
  - Description of change
  - Impact or migration note

````

## Important Formatting Rules

1. **Version format**: `## [X.Y.Z](./#X.Y.Z) - YYYY-MM-DD`
2. **Date**: Use today's date in YYYY-MM-DD format (e.g., 2025-10-14)
3. **Component names**: Use proper title case with spaces
4. **Single-line vs multi-line**:
   - Single fix: `- **Component**: Fix issue where...`
   - Multiple fixes: Use bullet points under component name
5. **Code snippets**: Include if present in changeset, maintain original formatting
6. **Order**: Added � Fixed � Changed (omit sections if empty)
7. **Alphabetical**: Sort components alphabetically within each section

## Common Patterns

### Changeset Format
```markdown
---
"@zag-js/component": patch
---

Fix issue where something doesn't work
````

### Multiple Packages

```markdown
---
"@zag-js/component-1": patch
"@zag-js/component-2": minor
---

Add new feature that affects multiple components
```

### With Code Snippet

```markdown
---
"@zag-js/component": minor
---

Add support for `newProp` option:

\`\`\`ts const service = useMachine(component.machine, { newProp: true }) \`\`\`
```

## Tips

- Group related changes under one component heading
- Use clear, concise descriptions
- Preserve technical details and API names (use backticks for code)
- Include migration examples for breaking changes
- Maintain consistent terminology with existing changelog entries
- Today's date is: **{CURRENT_DATE}** (use this for the changelog entry)

## Example Output

```markdown
## [1.26.2](./#1.26.2) - 2025-10-14

### Fixed

- **Checkbox**
  - Fix issue where setting initial checked state to `indeterminate` doesn't work
  - Ensure `api.checkedState` returns the correct checked state (`boolean | "indeterminate"`)

- **Combobox**: Fix issue where controlled single-select combobox does not propagate its initial value to `inputValue`

- **Listbox**: Fix issue where pressing Enter key when no highlighted item still calls `event.preventDefault()`

- **Slider**: Fix issue where slider could stop abruptly when scrubbing thumb

- **Tags Input**: Fix issue where `maxLength` doesn't apply to the edit input as well
```

## Workflow

1. Run this command
2. Review all changeset files in `.changeset/*.md`
3. Determine next version (check CHANGELOG.md for current version)
4. Group and categorize all changes
5. Write formatted entry to the TOP of CHANGELOG.md (after the header, before existing entries)
6. Preserve all existing changelog entries
7. Verify formatting matches existing entries
