# @zag-js/codemod

Codemods for upgrading zag.js projects.

```bash
npx @zag-js/codemod v2 src
```

Pass one or more files or folders. `node_modules`, build output and dot folders are skipped. Add `--dry` to see what
would change without writing files.

## v2

Upgrades v1 code, styles and tests to v2. It handles `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.astro`, `.html`
and stylesheets.

### What it rewrites

- **Selectors.** `[data-scope="dialog"][data-part="trigger"]` becomes `[data-dialog-trigger]`, in stylesheets, JS
  strings, templates and test locators. Tailwind `data-[scope=x]:data-[part=y]:` variants become `data-[x-y]:`.
- **Renamed parts.** `prev-trigger` becomes `previous-trigger`, and tree view's branch and item parts map to the node
  model.
- **State attributes.** Toggle `[data-state="on"]` becomes `[data-pressed]`, `data-ssr` on tab and radio indicators
  becomes `data-indicator-pending`, and steps `--percent` becomes `--steps-percent`.
- **Machine props** passed to `useMachine(x.machine, props)`, `x.machine(props)`, `new VanillaMachine(...)` or typed as
  `x.Props`. For example carousel `slideCount` becomes `count`, `composite: false` becomes `popupType: "dialog"`, and
  slider label arrays become `getAriaLabel`.
- **Api members**, such as `getPrevTriggerProps()` → `getPreviousTriggerProps()` and `clearHighlightValue()` →
  `setHighlightedValue(null)`. Names that are common outside zag, like `getItemProps` or `loading`, are renamed only
  when the codemod can tell which machine's api they belong to.

### What it reports

Changes that need a decision are listed with their file and line instead of being rewritten, for example:

- selectors that use `data-part` without `data-scope`, or `[data-part*=…]`
- steps, which moved to an `items` array addressed by `value`
- the new `list` part in combobox, select and listbox, and the `content` part in toast
- removed apis such as `api.setSrc`, `api.gamutOverlay` and popover's `api.portalled`
- number input values, which are now numbers
- props whose default changed, when you leave them out: accordion `collapsible`, tags input `editable` and table of
  contents `multiple`. Pass the v1 value (`collapsible: false`, `editable: true`, `multiple: true`) to keep the old
  behavior

Run your type checker and tests afterwards, and see the [migration guide](https://zagjs.com/guides/migration) for
everything else.

### Limits

- It works one file at a time. Props passed through your own wrapper, such as `new MyCarousel(el, { slideCount })` where
  `MyCarousel` is defined in another file, are not detected; the type checker points at them.
- Run it on v1 code. Code that is already on v2 gets notes it doesn't need.

## API

```ts
import { transformV2 } from "@zag-js/codemod"

const { code, changes, notes } = transformV2(source, "file.tsx")
```
