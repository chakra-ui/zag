---
"@zag-js/tour": patch
---

Fix an action trigger's visible label being overridden by the translation. A step action renders its
`label`, which is already the trigger's accessible name, but the connect also set `aria-label` from
the translations — so a button reading "Got it" was announced as "close tour", and "Next" as "next
step". Besides the mismatch, this fails WCAG 2.5.3 (Label in Name) and leaves voice control without a
working command. The translations now apply only to a trigger rendered without a label.
