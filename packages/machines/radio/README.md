# @zag-js/radio

Core logic for the radio widget implemented as a state machine

## Installation

```sh
yarn add  @zag-js/radio
# or
npm i  @zag-js/radio
```

## Technical Considerations

- When the checkbox is surrounded by a form, we consider the effect of form "reset" event with a `trackFormReset`
  activity in the machine.
- When the checkbox is surrounded by fieldset and the fieldset is disabled, we react to set sync the disabled state
  accordingly with a `trackFieldsetDisabled` activity in the machine.
- A name can be passed to the machine object during initialization, which we pass to the input, to ease use in forms.
- The API exposes a `setValue` method to programmatically set the checked radio item. We automatically dispatch a
  native event when this is done, so when used in a form, the form can detect those changes.
- The API exposes a `focus` method to programmatically focus radio items, in the right order as specified by WAI-ARIA

## Contribution

Yes please! See the
[contributing guidelines](https://github.com/chakra-ui/zag/blob/main/CONTRIBUTING.md)
for details.

## Licence

This project is licensed under the terms of the
[MIT license](https://github.com/chakra-ui/zag/blob/main/LICENSE).
