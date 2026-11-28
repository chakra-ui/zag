---
"@zag-js/tags-input": major
---

- **Breaking:** Rename the delete trigger to a remove trigger, since a removed tag can be added again.
  `npx @zag-js/codemod v2` makes these changes for you.

  ```diff
  - <button {...api.getItemDeleteTriggerProps(item)}>×</button>
  + <button {...api.getItemRemoveTriggerProps(item)}>×</button>
  ```

  The part is now `data-tags-input-item-remove-trigger`, `ids.itemDeleteTrigger` is `ids.itemRemoveTrigger`, and the
  `deleteTagTriggerLabel` and `tagDeleted` translations are `removeTagTriggerLabel` and `tagRemoved`.

- **Breaking:** Rename `data-delete-intent`, set on a tag while its remove trigger is hovered, to `data-remove-intent`.
