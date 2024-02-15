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
- RTL
  - arrow keys
  - pass to the elements
- Change dataset to `[data-tour-highlighted]` or `[data-current-step]`
- Iframe considerations
  - https://github.com/pulsardev/vue-tour/issues/261
- Pausing a tour
- Multiple Targets.`getOverlayProps` and `getMaskProps`
- `api.hasTarget(stepId)`
- Allow overriding `scrollIntoView` options
- `onFinish` callback
- Calling `api.start(index?)` with a proposed start index. This will allow resuming
- Review callbacks:
  - start
  - stop
  - next/prev
  - skip
  - finish
- prevent scroll? per step or globally?
- Customize aria-labels
- Accessibility. Make content a live region `aria-live=assertive`
- Interaction outside callbacks
- Allowing individual highlighting without steps `api.highlight(...)`
- `getProgressText` => `progressText`

### Examples

Useful for designing product tours, feature highlights, contextual help in your application.

- Changing the placement of a tour, per step
- Exiting the tour on interaction outside
- Styling the overlay background
- Adding a stroke around around the overlay
- Highlighting with no target
- Showing tour progress
- Removing the overlay
- Disabling keyboard navigation
