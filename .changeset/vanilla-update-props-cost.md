---
"@zag-js/vanilla": major
---

Fix growing update cost and stack overflows in `VanillaMachine.updateProps`.

**Breaking:** Only the latest getter stays live. Move all reactive values into it; omitted props keep their last
resolved values.
