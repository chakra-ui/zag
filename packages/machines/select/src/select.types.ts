import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type PublicContext = DirectionProperty &
  CommonProperties & {
    selectedOption: Option | null
    focusedId: string | null
    placeholder: string
    disabled?: boolean
    invalid?: boolean
    selectOnTab?: boolean
  }

type PrivateContext = Context<{}>

type ComputedContext = Readonly<{
  renderedValue: string
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
