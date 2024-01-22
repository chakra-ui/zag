---
"@zag-js/tags-input": minor
---

Improve `TagsInput` component design by introducing a new `item-preview` part. See the diff below for more details.

```diff
<div {...api.rootProps}>
  {api.value.map((value, index) => (
-    <span key={index}>
+    <span key={index} {...api.getItemProps({ index, value })}>
-     <div {...api.getItemProps({ index, value })}>
+     <div {...api.getItemPreviewProps({ index, value })}>
        <span>{value} </span>
        <button {...api.getItemDeleteTriggerProps({ index, value })}>&#x2715;</button>
      </div>
      <input {...api.getItemInputProps({ index, value })} />
    </span>
  ))}
  <input placeholder="Add tag..." {...api.inputProps} />
</div>
```
