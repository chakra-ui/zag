---
"@zag-js/carousel": minor
"@zag-js/date-picker": minor
"@zag-js/pagination": minor
"@zag-js/scheduler": minor
"@zag-js/steps": minor
"@zag-js/tabs": minor
"@zag-js/tour": minor
---

**Breaking:** "Prev" is now spelled out as "Previous" across the API.

### Parts

The `prevTrigger` part is now `previousTrigger` in carousel, date picker, pagination, scheduler and steps. This renames
its prop getter, data attribute, `ids` key and translation key.

```diff
- <button {...api.getPrevTriggerProps()} />
+ <button {...api.getPreviousTriggerProps()} />
```

```diff
- [data-carousel-prev-trigger] { ... }
+ [data-carousel-previous-trigger] { ... }
```

```diff
  carousel.machine({
-   ids: { prevTrigger: "prev" },
-   translations: { prevTrigger: "Previous slide" },
+   ids: { previousTrigger: "prev" },
+   translations: { previousTrigger: "Previous slide" },
  })
```

Pagination and scheduler: `translations.prevTriggerLabel` is now `translations.previousTriggerLabel`.

### API

| Component              | Before                          | After                                   |
| ---------------------- | ------------------------------- | --------------------------------------- |
| Carousel               | `scrollPrev()`, `canScrollPrev` | `scrollPrevious()`, `canScrollPrevious` |
| Date picker, Scheduler | `goToPrev()`                    | `goToPrevious()`                        |
| Pagination             | `goToPrevPage()`                | `goToPreviousPage()`                    |
| Steps                  | `goToPrevStep()`, `hasPrevStep` | `goToPreviousStep()`, `hasPreviousStep` |
| Tabs                   | `selectPrev()`                  | `selectPrevious()`                      |
| Tour                   | `prev()`, `hasPrevStep`         | `previous()`, `hasPreviousStep`         |

### Tour step actions

The `"prev"` action is now `"previous"`, along with the action map method and translation key. The action trigger
renders `data-type="previous"`.

```diff
  actions: [
-   { label: "Prev", action: "prev" },
+   { label: "Previous", action: "previous" },
  ]

- action: (actions) => actions.prev()
+ action: (actions) => actions.previous()

- translations: { prevStep: "Previous step" }
+ translations: { previousStep: "Previous step" }
```
