---
"@zag-js/core": major
"@zag-js/toast": major
---

- **Core**: Rewrite machines for increased performance and initial mount time. The results show roughly 1.5x - 4x
  performance improvements across components.

- **[Breaking] Toast**

  - Require the creation of a toast store using `createStore`
  - Solid.js: Require the usage of `<Key>` component to render toasts
