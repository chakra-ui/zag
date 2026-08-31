---
"@zag-js/core": minor
"@zag-js/react": minor
"@zag-js/preact": minor
"@zag-js/solid": minor
"@zag-js/svelte": minor
"@zag-js/vue": minor
"@zag-js/vanilla": minor
"@zag-js/types": patch
---

Separate the props you pass to `useMachine` from the props the machine sees after defaults are applied.

- Fixed issue where omitting a required prop type-checked and then failed at runtime with
  `[zag-js] missing required props`. Affects `async-list`, `carousel`, `dnd`, `gridlist`, `listbox`, `pin-input`,
  `select`, `splitter`, `toast` and `toc`, whose required props were reported as optional.
- Fixed issue where a prop listed as having a default lost `null` from its public type, so props that accept `null`
  rejected it.

Machine schemas now declare the public props type plus a `defaultPropKey` union naming the props the machine fills in:

```ts
export interface DialogSchema {
  props: DialogProps
  defaultPropKey: PropsWithDefault
}
```

Schemas that do not declare `defaultPropKey` keep the previous behaviour, so custom machines continue to work unchanged.
