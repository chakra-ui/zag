---
"@zag-js/navigation-menu": minor
---

- Add `getItemIndicatorProps` part

- **BREAKING**: Removed `getIndicatorTrackProps` - use `getListProps` instead (list now includes `position: relative`)

```tsx
// Before
<div {...api.getIndicatorTrackProps()}>
  <div {...api.getListProps()}>
    {/* items */}
  </div>
</div>

// After
<div {...api.getListProps()}> {/* now acts as indicator track */}
  {/* items */}
</div>
```
