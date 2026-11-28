---
"@zag-js/utils": minor
---

- Add the `@zag-js/utils/json-tree` entrypoint, moved from `@zag-js/json-tree-utils`. It's about a quarter smaller
  minified.
- Make `nodeToValue` return the node's path, like `$.user.name`, instead of a hash of it. Building a tree view
  collection is about 40% faster, and `jsonPathToValue` returns the path unchanged to match.
- Fix objects made with `Object.create(null)` and getters that throw breaking the whole tree.
- Fix an object that appears twice showing as a circular reference the second time.
- Fix typed array descriptions reading `undefined(7)` instead of `Uint8Array(7)`.
- Fix previews: empty values read `{}`, buffers show their size, classes show their name, React elements show their
  children, map keys that are objects read `Object`, and circular references read `[Circular]`.
- Fix accessible labels repeating "non-enumerable".
- Recognize documents and windows by their shape, so XML documents and other environments work.
