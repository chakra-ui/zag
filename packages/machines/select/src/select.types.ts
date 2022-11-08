import type { StateMachine as S } from "@zag-js/core"
import { TypeaheadState } from "@zag-js/dom-utils"
import { Placement } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type PublicContext = DirectionProperty &
  CommonProperties & {
    name?: string
    data: any[]
    count?: number
    selectedOption: Option | null
    highlightedId: string | null
    placeholder: string
    disabled?: boolean
    invalid?: boolean
    selectOnTab?: boolean
    blurOnSelect?: boolean
    onHighlight?: (details: Option) => void
    onSelect?: (details: Option) => void
    positioning?: any
    isPlacementComplete?: boolean
    virtualize?: any
  }

type PrivateContext = Context<{
  __itemCount: number | null
  shouldScroll?: boolean
  typeahead: TypeaheadState
  currentPlacement?: Placement
}>

type ComputedContext = Readonly<{
  rendered: string
  itemCount: number
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
