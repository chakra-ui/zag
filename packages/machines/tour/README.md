# @zag-js/tour

Core logic for the tour widget implemented as a state machine

## Installation

```sh
yarn add @zag-js/tour
# or
npm i @zag-js/tour
```

## Contribution

Yes please! See the [contributing guidelines](https://github.com/chakra-ui/zag/blob/main/CONTRIBUTING.md) for details.

## Licence

This project is licensed under the terms of the [MIT license](https://github.com/chakra-ui/zag/blob/main/LICENSE).

## TODOs

- Async renders, via a before hook (maybe the step can be async?)
- `onComplete` callback
  <!-- - Review callbacks:
    - start
    - stop
    - next/prev
    - skip
    - finish -->
  <!-- - prevent scroll? per step or globally? -->
- Interaction outside callbacks
  <!-- - Multiple Targets.`getOverlayProps` and `getMaskProps` -->
  <!-- - Pausing a tour -->

### Docs Examples

Useful for designing product tours, feature highlights, contextual help in your application.

- Changing the placement of a tour, per step
- Exiting the tour on interaction outside
- Styling the overlay background
- Adding a stroke around around the overlay
- Highlighting with no target
- Showing tour progress
- Removing the overlay
- Disabling keyboard navigation
- Handling Cross frame elements (iframes)
- RTL Support (right to left)
- Customizing the accessibility labels
- Accessibility
  - Keyboard navigation
  - Screen reader support
  - Focus management
  - Live region for content updates
