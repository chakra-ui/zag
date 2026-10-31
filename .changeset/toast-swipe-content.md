---
"@zag-js/toast": major
---

- Add the `content` part (`api.getContentProps()`). Render the title, description and other content inside it; the
  toast's height now follows it with one observer instead of one per child.
- Add swipe to dismiss. Toasts swipe toward the nearest edges of their placement by default; set `swipeDirections` on
  the store or a toast to change them, or pass `[]` to turn swiping off.
- Add `data-swiping`, `data-swipe-direction` and the `--swipe-x` and `--swipe-y` CSS variables to the root.

**Migration**

Wrap the toast's content in the content part, so its height keeps updating after mount:

```diff
  <div {...api.getRootProps()}>
-   <h3 {...api.getTitleProps()}>{api.title}</h3>
-   <p {...api.getDescriptionProps()}>{api.description}</p>
+   <div {...api.getContentProps()}>
+     <h3 {...api.getTitleProps()}>{api.title}</h3>
+     <p {...api.getDescriptionProps()}>{api.description}</p>
+   </div>
  </div>
```

Turn transitions off while swiping, so the toast follows the pointer:

```css
[data-toast-root][data-swiping] {
  transition: none;
}
```
