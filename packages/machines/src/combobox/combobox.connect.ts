import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@ui-machines/core"
import { DOMHTMLProps } from "../type-utils"
import { getElementIds, getElements } from "./combobox.dom"
import {
  ComboboxMachineContext,
  ComboboxMachineState,
} from "./combobox.machine"

export function connectComboboxMachine(
  state: S.State<ComboboxMachineContext, ComboboxMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  return {
    elProps: normalize<DOMHTMLProps>({}),
  }
}
