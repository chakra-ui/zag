# Dismissable layer design notes

Decisions behind `layerStack` nesting. Read this before changing `getParentNode`, `getNestedLayers` or the metadata
helpers in `packages/utilities/dismissable/src/layer-stack.ts`.

## How a layer finds its parent

Every layer has a `parent`, set once when it is added:

1. **It has triggers** (the `exclude` containers, passed as `origins`): the parent is the topmost open layer that
   contains one of its origins (its own node or a trigger). If none does, it has no parent and is a sibling.
2. **It has no triggers**: the parent is whatever layer is on top. This is the old rule, kept for layers opened only
   through `open`/`setOpen`.

A re-added layer (Strict Mode double register) keeps its old parent and its stack position, so it never rises above its
children.

## Why not just "the layer on top"

The old rule treated every new layer as nested in the one below it. Two unrelated popovers broke under it: open A, tap
B's trigger, and both closed. The tap opens B before A's deferred outside check runs, so A saw B as its child, and the
cascade on A's close then dismissed B. The trigger location is what reliably says "opened from inside", and `contains`
follows portals' DOM, shadow hosts and same-origin iframes, so the answer doesn't depend on timing.

## What follows the parent links

- **Cascade**: removing a layer dismisses its descendants only, not every layer above it.
- **Outside checks**: `isInNestedLayer` treats a target inside a descendant as inside.
- **Metadata**: `data-nested`, `data-has-nested` and `--nested-layer-count` count same-type ancestors and descendants,
  not stack position. Two sibling dialogs don't get stacked styles.
- **Survivors**: if a child blocks its dismissal (`onRequestDismiss` prevented) when its parent closes, it moves up to
  the grandparent so the chain stays connected.

`--layer-index` and pointer blocking stay stack-order based. They are about painting and which layer gets pointer
events, not ancestry.

## Known trade-off

A layer opened in code from inside another layer, while its own trigger is rendered elsewhere, is a sibling, not a
child:

```tsx
<button {...help.getTriggerProps()}>Help</button>
<div {...settings.getContentProps()}>
  <a onClick={() => help.setOpen(true)}>Need help?</a>
</div>
```

Clicking inside Help closes Settings. The focused element can't be used as an origin: a menu opens on `pointerdown`
while focus is still in the open sibling menu, so the new menu would nest in it and close with it.

## Not handled

- **Focus restore on cascade**: a child closed with its parent still restores focus to its own trigger. If that trigger
  sits in the closing parent and another layer just opened, the new layer sees focus leave and closes (mouse only). The
  fix belongs in each machine: skip focus restore when closed by a cascade.
- **Cross-origin and sandboxed iframes**: `frameElement` is `null`, so content inside them is outside every layer.

## Tests

- `packages/utilities/dismissable/tests/layer-stack.test.ts`: siblings, survivors, metadata.
- `e2e/popover-siblings.e2e.ts` with `examples/next-ts/pages/popover/siblings.tsx`: document, shadow and iframe ×
  portal × mouse/touch, plus mixed page/shadow and popover-in-iframe-in-popover.
