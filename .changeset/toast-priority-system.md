---
"@zag-js/toast": minor
---

Add priority-based queue system for toasts. When the max number of toasts is reached, queued toasts are sorted by
priority (1-8, lower is higher priority) before being displayed. Priorities are automatically assigned based on toast
type and whether it has an action. Custom priorities can be set via the `priority` option.
