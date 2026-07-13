---
"@zag-js/date-input": patch
---

Fix stale value shown when editing over a committed date. A partial segment entry (e.g. day `3` that could still
become `30`) kept the previous committed value rendered after moving to another segment until the whole control lost
focus. The pending entry is now committed when its segment is left via click, Tab, or arrow navigation.
