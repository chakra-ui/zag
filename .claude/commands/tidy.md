# Tidy Command

Make code easier to read without changing what it does: trim comments, space it out, and shape stateful logic like a
reducer or state machine.

## Scope

- With arguments (`$ARGUMENTS`), tidy those files or folders
- Without arguments, tidy the files changed on the current branch (`git diff --name-only` against the merge base, plus
  uncommitted changes), skipping tests, examples and generated files unless asked

## Rules

### Comments

- Keep a comment only when it explains a non-obvious why: a browser quirk, an ordering constraint, a trade-off
- Delete comments that restate the code, narrate steps, or label obvious sections
- One line each, terse. No "we", no history ("used to", "changed from")
- Keep public JSDoc on exported types, props and functions; shorten it to one or two sentences

### Spacing

- A blank line between logical blocks: setup, guards, the work, the result
- Group related declarations; separate groups with one blank line
- In a long module, mark sections with the divider used across dom-query:

```ts
/* -----------------------------------------------------------------------------
 * Transitions: every input goes through here
 * -----------------------------------------------------------------------------*/
```

### Shape stateful code like a reducer

When a function tracks state across events (a gesture, a session, an effect with listeners), structure it as `trackDrag`
and `trackLongPress` are in `packages/utilities/dom-query/src`:

1. **State**: one `state` object, with a `phase` union (`"pressed" | "dragging" | "ended"`) instead of loose booleans
2. **Inputs**: a typed union (`{ type: "MOVE"; event } | { type: "RELEASE"; event } | …`)
3. **Transitions**: a single `send(input)` with a `switch` on `input.type`, checking `state.phase`. Every input goes
   through it; nothing else changes `phase`
4. **Steps**: small named functions the transitions call (`begin`, `record`, `report`, `end`, `stop`)
5. **Listeners**: only turn DOM events into inputs and call `send`; no logic of their own
6. Return a cleanup

In machines, prefer real states and named guards/actions over boolean context flags checked by guards.

### Placement and allocation

- Static objects, maps and regexes go at module scope, not inside functions that run per call or per render
- Use the shared native resources: `addGlobalEvent` for listeners, `resizeObserverBorderBox` /
  `resizeObserverContentBox` for resize observation, a module-level `createSharedMutationObserver` for mutations,
  `Timeout` and `AnimationFrame` for timers. Replace any `addEventListener`, `new ResizeObserver` or
  `new MutationObserver` with them
- Helpers that read better by name go at the bottom of the file as plain functions; pure machine helpers go in `utils/`
  when the component already has that folder
- Types go at the bottom or in a separate `types.ts` when they crowd the logic

### Keep it readable, not clever

- Prefer plain duplication to factories, loops or caches added only to save lines
- Name intermediate values instead of nesting expressions
- Don't rename public API, change behavior, or reorder side effects

## Process

1. Read each file in scope fully before editing
2. Apply the rules above; keep each change mechanical and behavior-preserving
3. Format: `npx oxfmt <files>`
4. Verify, keeping runs small:
   - `npx tsc --noEmit -p <package>` for each touched package
   - `npx oxlint <files>`
   - The unit tests of touched packages (`npx vitest run` in the package)
   - Don't run e2e suites unless asked
5. Report: files touched, comments removed or shortened, any code reshaped into the reducer pattern, and anything left
   alone on purpose. Don't commit.

See `design-notes/machines-vs-utilities.md` for where behavior belongs.
