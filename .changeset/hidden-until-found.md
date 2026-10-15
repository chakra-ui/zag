---
"@zag-js/accordion": minor
"@zag-js/collapsible": minor
"@zag-js/types": patch
---

- Added `hiddenUntilFound` prop so closed content stays searchable with the browser's find-in-page. When a match is
  found inside closed content, the item opens and the match is shown immediately, without the open animation.
- In controlled mode, the content is hidden again if the open state isn't updated in response.
- CSS resets like `[hidden] { display: none }` block this. Exclude it with `[hidden]:not([hidden="until-found"])`.
