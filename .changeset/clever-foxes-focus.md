---
"@zag-js/focus-trap": patch
"@zag-js/tour": patch
---

- Fix crash when clicking labels in dialogs by keeping the focus trap stable during label activation.
- Keep inputs inside the spotlight target interactive by treating the tour content and spotlight target as trap containers.
