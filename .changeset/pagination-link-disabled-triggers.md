---
"@zag-js/pagination": patch
---

Fixed the first, previous, next and last triggers under `type="link"` when they can't move to another page. They now
drop the `href` and set `role="link"` and `aria-disabled="true"`, so assistive technology announces them as disabled.
The first and last triggers no longer link to the page that is already open.
