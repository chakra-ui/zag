---
"@zag-js/file-upload": minor
---

- Resolved an issue where `onFileReject` was incorrectly triggered when deleting accepted files using
  `ItemDeleteTrigger`

- The file deletion logic now properly differentiates between accepted and rejected files, preventing unnecessary
  callbacks

- Added `type` prop to all item-related components (`ItemProps`, `ItemGroupProps`) to specify whether items are
  "accepted" or "rejected"

- Added `data-type` attribute to all item-related elements for easier styling of accepted vs rejected files

- Exposed `ItemType`, `ItemGroupProps`, and `ItemTypeProps` types for better TypeScript support

### Migration

When rendering rejected files, you should now pass `type: "rejected"` to item components:

```tsx
// Before
<div {...api.getItemProps({ file })}>
  <button {...api.getItemDeleteTriggerProps({ file })}>Delete</button>
</div>

// After - for rejected files
<div {...api.getItemProps({ file, type: "rejected" })}>
  <button {...api.getItemDeleteTriggerProps({ file, type: "rejected" })}>Delete</button>
</div>
```
