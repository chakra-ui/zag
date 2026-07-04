# Ark UI integration notes

The Zag toolbar machine should stay generic. Ark can add richer composition at
the component layer by using framework context and `asChild`/render composition.

## Goals

- Keep child Zag machines independent from toolbar-specific props.
- Let Ark toolbar parts own roving focus registration.
- Let composed controls inherit toolbar `disabled` and `orientation` where it is
  semantically relevant.
- Avoid making every Ark component import toolbar context by default.

## Recommended shape

`Toolbar.Root` creates the toolbar machine and provides the connected API:

```tsx
const toolbar = useToolbar(props)

return (
  <ToolbarProvider value={toolbar}>
    <ark.div {...toolbar.getRootProps()}>{children}</ark.div>
  </ToolbarProvider>
)
```

The toolbar API exposes the public state needed for composition:

```ts
toolbar.disabled
toolbar.orientation
toolbar.getItemId(value)
toolbar.getItemProps({ value, disabled, focusableWhenDisabled })
```

`Toolbar.Item` should register a single focusable toolbar item and support
composition:

```tsx
<Toolbar.Item value="font" asChild>
  <Select.Trigger />
</Toolbar.Item>
```

Internally, it can merge `toolbar.getItemProps(...)` with the child element's
props and forward the toolbar-derived `disabled` value to render-prop children.

## Toggle group

`ToggleGroup.Root` is the main child that benefits from toolbar awareness because
it normally owns its own roving focus. In Ark, it can optionally read toolbar
context and inherit toolbar state:

```tsx
const toolbar = useToolbarContext({ strict: false })

const toggleGroup = useToggleGroup({
  ...props,
  disabled: Boolean(toolbar?.disabled || props.disabled),
  orientation: props.orientation ?? toolbar?.orientation,
})
```

When a toggle group is inside a toolbar, Zag's toggle-group machine already
detects the toolbar in the DOM and avoids adding an extra root tab stop. Ark only
needs to pass down the effective disabled/orientation state.

## Select, menu, number input, checkbox, tooltip

These components should not need a `toolbar` machine prop. Prefer composition
through `Toolbar.Item` and explicit state threading where a root machine needs to
inherit disabled state:

```tsx
const toolbar = useToolbarContext()

<Select.Root disabled={toolbar.disabled}>
  <Toolbar.Item value="font" asChild>
    <Select.Trigger />
  </Toolbar.Item>
  <Select.Content />
</Select.Root>
```

For menu/select triggers, `Toolbar.Item` should own the toolbar item props while
the trigger keeps its own semantics:

```tsx
<Toolbar.Item value="more" asChild>
  <Menu.Trigger />
</Toolbar.Item>
```

## Why not `toolbar?: ToolbarContext` on every machine?

`Menu` and `Menubar` are a tight semantic pair, so passing menubar context into a
menu is reasonable. Toolbar is broader: it can contain buttons, links, toggle
groups, selects, menus, checkboxes, inputs, tooltips, and custom controls.

Adding `toolbar?: ToolbarContext` to every child machine would spread toolbar
coupling through unrelated packages and increase the surface area of each child
API. Ark context keeps that coupling at the component layer, where it can be
opt-in and tree-shaken with toolbar usage.

