---
"@zag-js/toast": minor
---

Add priority-based queue system for toasts inspired by Adobe Spectrum's design guidelines. Toasts now support priority
levels (1-8, where 1 is highest priority) with automatic priority assignment:

- **Error toasts**: Priority 1 (actionable) or 2 (non-actionable) - always shown first
- **Warning toasts**: Priority 2 (actionable) or 6 (non-actionable)
- **Loading toasts**: Priority 3 (actionable) or 4 (non-actionable)
- **Success toasts**: Priority 4 (actionable) or 7 (non-actionable)
- **Info toasts**: Priority 5 (actionable) or 8 (non-actionable)

When the maximum number of toasts is reached, new high-priority toasts are queued and displayed as soon as space becomes
available, ensuring critical notifications are never missed. Custom priorities can be set using the `priority` option.

Additionally, when using `toast.promise` to track a promise, the `success` options can now specify `type` as either
`success` or `warning` for more flexible promise result handling.
