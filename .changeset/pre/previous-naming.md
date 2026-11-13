---
"@zag-js/carousel": major
"@zag-js/date-picker": major
"@zag-js/pagination": major
"@zag-js/scheduler": major
"@zag-js/steps": major
"@zag-js/tabs": major
"@zag-js/tour": major
---

**Breaking:** Spell out "Prev" as "Previous" across the API.

The `prevTrigger` part is now `previousTrigger` in carousel, date picker, pagination, scheduler and steps, including its
prop getter, data attribute, `ids` key and translation key.

```diff
- <button {...api.getPrevTriggerProps()} />
+ <button {...api.getPreviousTriggerProps()} />

- [data-carousel-prev-trigger] { ... }
+ [data-carousel-previous-trigger] { ... }

  carousel.machine({
-   ids: { prevTrigger: "prev" },
-   translations: { prevTrigger: "Previous slide" },
+   ids: { previousTrigger: "prev" },
+   translations: { previousTrigger: "Previous slide" },
  })
```

Pagination and scheduler rename `translations.prevTriggerLabel` to `translations.previousTriggerLabel`.

| Component              | Before                          | After                                   |
| ---------------------- | ------------------------------- | --------------------------------------- |
| Carousel               | `scrollPrev()`, `canScrollPrev` | `scrollPrevious()`, `canScrollPrevious` |
| Date picker, Scheduler | `goToPrev()`                    | `goToPrevious()`                        |
| Pagination             | `goToPrevPage()`                | `goToPreviousPage()`                    |
| Steps                  | `goToPrevStep()`, `hasPrevStep` | `goToPreviousStep()`, `hasPreviousStep` |
| Tabs                   | `selectPrev()`                  | `selectPrevious()`                      |
| Tour                   | `prev()`, `hasPrevStep`         | `previous()`, `hasPreviousStep`         |

The tour's `"prev"` action is now `"previous"`, and its trigger renders `data-type="previous"`.

```diff
- actions: [{ label: "Prev", action: "prev" }],
+ actions: [{ label: "Previous", action: "previous" }],
- action: (actions) => actions.prev()
+ action: (actions) => actions.previous()
- translations: { prevStep: "Previous step" }
+ translations: { previousStep: "Previous step" }
```
