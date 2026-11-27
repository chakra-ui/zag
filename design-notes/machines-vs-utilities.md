# Machines vs utilities

Behavior lives in the smallest layer that can hold it. Machines compose the layers below them and stay thin; the layers
below never know about machines.

| Layer         | Where                 | Holds                                                            |
| ------------- | --------------------- | ---------------------------------------------------------------- |
| Pure rules    | `@zag-js/utils/*`     | Math and decisions with no DOM: snapping, settling, box resizing |
| DOM utilities | `@zag-js/dom-query/*` | One interaction session, or a behavior attached to an element    |
| Machines      | `packages/machines/*` | User-facing components                                           |

## A utility

- Runs a session or attaches to an element the user already owns: `trackX(target, options)` returns a cleanup
- Renders no parts: no ids, roles or `data-*` attributes of its own
- Has no value a user controls (`value` / `defaultValue` / `onValueChange`)
- Works inside any machine, or without one

Examples: `trackDrag`, `trackSwipe`, `trackLongPress`, stick-to-bottom, the splitter's handle hit-testing.

## A machine

- Has state the user controls: a value, an open state, a selection
- Renders several parts whose ARIA, ids and data attributes `connect` produces
- Has a keyboard model, and handles pointer, keyboard and programmatic events differently by state
- Often takes part in forms

Examples: slider, select, drawer, swipe actions, wheel picker.

## Deciding

Ask two questions:

1. Does it have a value someone would want to control?
2. Does it render parts that need ARIA?

Yes to either: it's a machine, built on utilities. No to both: it's a utility, and existing machines expose it as an
option where useful (scroll-area's stick-to-bottom).

Don't reimplement what the platform does well inside a machine. A wheel picker lets native scroll snapping do the
motion: `trackScrollPicker` reads where it settled, and the `wheel-picker` machine owns the value, ARIA, keyboard and
forms.

## Shape of a utility

- Named `trackX`, takes the document or element first and an options object second
- Callbacks receive a `details` object; units are px and px/ms
- Every DOM listener goes through `addGlobalEvent`; timers through `Timeout` and `AnimationFrame`
- Its own entrypoint when it's a topic (`dom-query/drag`, `dom-query/swipe`, `dom-query/press`)
- Pure decisions it needs live in `@zag-js/utils` and are unit tested without a DOM
