---
"@zag-js/number-input": patch
---

Omit the input `pattern` when `formatOptions` is provided. This prevents native pattern validation from conflicting with
formatted values (e.g., currency or percent).
