---
"@zag-js/password-input": patch
---

Remove `aria-expanded` from the visibility trigger. Showing the password doesn't expand anything, and the trigger already
announces its state through its label ("Show password" / "Hide password").
