---
"@zag-js/toast": major
---

- **Breaking:** Add the `content` part. Wrap the toast's content in it, so its height keeps updating after mount.

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

- Add swipe to dismiss, toward the nearest edges of the placement. Set `swipeDirections` on the store or a toast, or
  `[]` to turn it off. Turn transitions off while swiping:

  ```css
  [data-toast-root][data-swiping] {
    transition: none;
  }
  ```

- Add `data-swiping`, `data-swipe-direction`, `--swipe-x` and `--swipe-y` to the root.

- Fix a progress bar driven by `--duration` jumping after a pause. `--duration` is now the total duration, not the time
  remaining.
