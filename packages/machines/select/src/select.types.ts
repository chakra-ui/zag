import type { StateMachine as S } from "@zag-js/core"
import { TypeaheadState } from "@zag-js/dom-utils"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type PublicContext = DirectionProperty &
  CommonProperties & {
    name?: string
    selectedOption: Option | null
    highlightedId: string | null
    highlightedData: Option | null
    placeholder: string
    disabled?: boolean
    invalid?: boolean
    selectOnTab?: boolean
    onHighlight?: (details: Option | null) => void
    onChange?: (details: Option | null) => void
    onOpen?: () => void
    onClose?: () => void
    hasPointerMoved?: boolean
    positioning: PositioningOptions
    virtualize?: {
      count?: number
    }
  }

type PrivateContext = Context<{
  typeahead: TypeaheadState
  currentPlacement?: Placement
}>

type ComputedContext = Readonly<{
  rendered: string
  hasValue: boolean
  isTypingAhead: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type Option = {
  id: string
  label: string
  value: string
}

export type ItemProps = {
  value: string
  disabled?: boolean
}

export type OptionProps = ItemProps & {
  label?: string
}

export type MachineState = {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type OptionGroupProps = {
  id: string
}

export type OptionGroupLabelProps = {
  htmlFor: string
}
