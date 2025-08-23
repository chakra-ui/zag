---
"@zag-js/async-list": patch
---

## Fixed

- Fixed critical race conditions and dual operations in sort functionality that could cause stale data overwrites and
  unexpected behavior
- Fixed event handling during async operations - users can now properly interrupt sorting with RELOAD, FILTER, or new
  SORT events
- Enhanced `SortDetails` interface with `filterText` parameter for consistent filtering context across local and
  server-side operations
