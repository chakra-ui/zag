---
"@zag-js/preact": patch
---

- Fix a duplicate, unpositioned popup after hydrating server-rendered markup. `Portal` now renders nothing on the server
  and mounts its content right after hydration.
