# Styling

Zag sets no styles beyond what positioning needs. Style each part with its data attribute.

## Parts

Every part has one attribute, `data-{component}-{part}`, set to the machine's id:

```css
[data-dialog-backdrop] {
  background: rgb(0 0 0 / 0.5);
}
[data-dialog-content] {
  padding: 24px;
  border-radius: 8px;
}
[data-select-item] {
  padding: 4px 8px;
}
```

Multi-word parts are kebab case: `[data-dialog-close-trigger]`, `[data-select-item-indicator]`. To target one instance
when several share a page, match the id: `[data-dialog-content="checkout"]`.

## State

States add attributes to the parts they affect. The docs page lists each part's attributes under "Styling guide".

```css
[data-accordion-item-trigger][data-state="open"] {
  font-weight: 600;
}
[data-select-item][data-highlighted] {
  background: var(--gray-100);
}
[data-select-item][data-state="checked"] {
  color: var(--blue-600);
}
[data-checkbox-control][data-disabled] {
  opacity: 0.5;
}
[data-toggle][data-pressed] {
  background: var(--gray-200);
}
```

Prefer these attributes over classes you toggle yourself: they're always in sync with the machine. With Tailwind, use
arbitrary variants like `data-[state=open]:bg-gray-100` or `data-highlighted:bg-gray-100`.

## Layering

Zag sets no `z-index`. Put it on the positioner, and on the backdrop when there is one, plus `--layer-index`, so a
popover opened inside a dialog stacks above it:

```css
[data-popover-positioner],
[data-dialog-positioner] {
  z-index: calc(1400 + var(--layer-index));
}
```

`--layer-index` counts up as overlays open inside each other, so one base value works for every overlay: a select opened
in a popover stacks above it. It's set only while a layer is open, so give it a fallback, `var(--layer-index, 0)`, when
a rule can match a closed one.

A `z-index` on the content does nothing, because the positioner creates the stacking context.

## Positioned content

The positioner of a popover, select, combobox, menu, tooltip or hover card sets these variables:

| Variable                                  | Use                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `--reference-width`, `--reference-height` | Size of the trigger, like `min-width: var(--reference-width)` to match it |
| `--available-width`, `--available-height` | Room left in the viewport, like `max-height: var(--available-height)`     |
| `--transform-origin`                      | The side it opened from, for scale animations                             |
| `--arrow-size`, `--arrow-background`      | Inputs you set for the arrow part                                         |

## Animating in and out

Content is rendered while `api.open` is true and has `data-state="open"` or `"closed"`. Animate in with a keyframe on
`[data-state="open"]`.

`{api.open && <Content />}` unmounts at once, so an exit animation never plays. To animate out, keep the content mounted
until the animation ends with `@zag-js/presence` (see `{docs}/components/{framework}/presence.md`).
