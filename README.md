<a href="https://zagjs.com/">
  <img alt="Zag.js" src="https://repository-images.githubusercontent.com/383777434/87c5d462-1c65-45d7-9561-3f3f64d814f4" />
</a>

# Zag

Accessible component logic for React, Vue, Solid, and Svelte.

Build dialogs, menus, comboboxes, date pickers, and more with state machines that handle keyboard interactions, focus
management, and ARIA attributes. You control the markup and styling; Zag handles the behavior.

<p>
  <a href="https://www.npmjs.com/package/@zag-js/core">
    <img alt="@zag-js/core monthly downloads" src="https://img.shields.io/npm/dm/@zag-js/core?label=%40zag-js%2Fcore%20downloads&style=flat" />
  </a>
  <a href="https://github.com/chakra-ui/zag/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/chakra-ui/zag?style=flat" />
  </a>
  <a href="https://zagjs.com/discord">
    <img alt="Join the Zag Discord community" src="https://img.shields.io/badge/Discord-Join%20community-5865F2?logo=discord&logoColor=white&style=flat" />
  </a>
</p>

[Documentation](https://zagjs.com/) · [Getting started](https://zagjs.com/overview/installation) ·
[Changelog](./CHANGELOG.md) · [Discord](https://zagjs.com/discord)

## Why Zag?

- **Bring your own design.** Headless APIs give you control over the rendered elements and any styling solution.
- **Reuse behavior across frameworks.** The same component machines power React, Vue, Solid, and Svelte, with adapters
  for Preact and vanilla JavaScript too.
- **Build on accessible interactions.** Keyboard navigation, focus management, and ARIA behavior follow the
  [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/).
- **Make complex behavior predictable.** State machines describe how components respond to interactions, with Playwright
  tests checking behavior across frameworks.

## Quick start

Install a component machine and the adapter for your framework. For a React toggle group:

```sh
npm install @zag-js/toggle-group @zag-js/react
```

Connect the machine to your markup:

```tsx
import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle-group"
import { useId } from "react"

export function ToggleGroup() {
  const service = useMachine(toggle.machine, { id: useId() })
  const api = toggle.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...api.getItemProps({ value: "bold" })} aria-label="Bold">
        B
      </button>
      <button {...api.getItemProps({ value: "italic" })} aria-label="Italic">
        I
      </button>
      <button {...api.getItemProps({ value: "underline" })} aria-label="Underline">
        U
      </button>
    </div>
  )
}
```

Add your styles, then explore the [toggle group docs](https://zagjs.com/components/toggle-group) for the full API and
examples in other frameworks.

| Framework          | Adapter           |
| ------------------ | ----------------- |
| React              | `@zag-js/react`   |
| Vue                | `@zag-js/vue`     |
| Solid              | `@zag-js/solid`   |
| Svelte             | `@zag-js/svelte`  |
| Preact             | `@zag-js/preact`  |
| Vanilla JavaScript | `@zag-js/vanilla` |

## Contributing

Bug reports, documentation improvements, and new component ideas are welcome. Read the
[contributing guide](./CONTRIBUTING.md) for local setup, development commands, and how to submit changes.

## Acknowledgments

Zag grew out of building [Chakra UI](https://chakra-ui.com/) and draws inspiration from
[Pure UI](https://rauchg.com/2015/pure-ui), [Pure UI Control](https://asolove.medium.com/pure-ui-control-ac8d1be97a8d),
[Material Components Web](https://github.com/material-components/material-components-web),
[Radix UI](https://radix-ui.com/), [XState](https://xstate.js.org/), [Vue](https://vuejs.org/), [Lit](https://lit.dev/),
and [Sonner](https://sonner.emilkowal.ski/).

## License

MIT © [Chakra Systems Inc.](https://github.com/chakra-ui)
