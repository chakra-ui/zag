---
"@zag-js/toast": minor
---

- Add support for overlapping toasts by setting `overlap: true` in the `toast.group` machine context
- Remove `pauseOnInteraction` in favor of always pausing on hover. This is required for accessibility reasons (there
  should always be a way to pause the widgets with time-based interactions)
- Remove `onOpen`, `onClose` and `onClosing` in favor of `onStatusChange` which reports the lifecycle status of the
  toast
- Impose new required styling for toast to work as designed. Refer to the docs for more information
- Require new `ghostBeforeProps` and `ghostAfterProps` props to ensure the hover interaction works as expected
