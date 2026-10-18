---
"@zag-js/highlight-word": patch
---

- Fix `exactMatch` for words that start or end with non-ASCII letters, such as Korean, Cyrillic or accented words. They
  never matched, and a query could match inside a longer word that continues with a non-ASCII letter (`na` in `naïve`).
- Fix `exactMatch` for queries that start or end with punctuation, such as `C++`.
