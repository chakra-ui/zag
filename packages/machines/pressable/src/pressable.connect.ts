import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { defaultPropNormalizer, getEventKey } from "../utils"
import type { DOM, Props } from "../utils"
import { getIds, getElements } from "./pressable.dom"

export function connectPressable<T extends PropTypes = ReactPropTypes>(
  state: PressableState,
  send: PressableSend,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  return {
    elProps: normalize.element<T>({}),
  }
}
