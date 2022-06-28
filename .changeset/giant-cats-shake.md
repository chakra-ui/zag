---
"@zag-js/core": patch
"@zag-js/react": patch
"@zag-js/solid": patch
"@zag-js/vue": patch
"@zag-js/accordion": patch
"@zag-js/checkbox": patch
"@zag-js/combobox": patch
"@zag-js/dialog": patch
"@zag-js/editable": patch
"@zag-js/menu": patch
"@zag-js/number-input": patch
"@zag-js/pin-input": patch
"@zag-js/popover": patch
"@zag-js/range-slider": patch
"@zag-js/rating": patch
"@zag-js/slider": patch
"@zag-js/splitter": patch
"@zag-js/tabs": patch
"@zag-js/tags-input": patch
"@zag-js/toast": patch
"@zag-js/toggle": patch
"@zag-js/tooltip": patch
"@zag-js/types": patch
"@zag-js/dom-utils": patch
"@zag-js/shared": patch
---

BREAKING 💥: Refactor connect function in favor of uniform APIs across frameworks

Due to the fact that we tried to make "React" the baseline, there was a lot of inherent complexity in how we managed
types in the codebase.

We've now removed the `PropTypes` export in favor of passing `normalizeProps` in the `api.connect` function. This is now
required for React as well.

You can remove the `<PropTypes>` generic and Zag will auto-infer the types from `normalizeProps`.

**For Vue and Solid**

```diff
-api.connect<PropTypes>(state, send, normalizeProps)
+api.connect(state, send, normalizeProps)
```

**For React**

```diff
-api.connect(state, send)
+api.connect(state, send, normalizeProps)
```
