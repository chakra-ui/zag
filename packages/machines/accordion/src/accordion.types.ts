import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  item(value: string): string
  content(value: string): string
  trigger(value: string): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the accordion. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Whether multple accordion items can be open at the same time.
     * @default false
     */
    multiple?: boolean
    /**
     * Whether an accordion item can be collapsed after it has been opened.
     * @default false
     */
    collapsible?: boolean
    /**
     * The `id` of the accordion item that is currently being opened.
     */
    value: string | string[] | null
    /**
     * Whether the accordion items are disabled
     */
    disabled?: boolean
    /**
     * The callback fired when the state of opened/closed accordion items changes.
     */
    onChange?: (details: { value: string | string[] | null }) => void
    /**
     *  The orientation of the accordion items.
     */
    orientation?: "horizontal" | "vertical"
  }

export type PublicApi<T extends PropTypes = PropTypes> = {
  rootProps: T["element"]
  getItemProps(props: ItemProps): T["element"]
  getContentProps(props: ItemProps): T["element"]
  getTriggerProps(props: ItemProps): T["button"]
  /**
   * The value of the focused accordion item.
   */
  focusedValue: string | null
  /**
   * The value of the accordion
   */
  value: string | string[] | null
  /**
   * Sets the value of the accordion.
   */
  setValue: (value: string | string[]) => void
  /**
   * Gets the state of an accordion item.
   */
  getItemState: (props: ItemProps) => ItemState
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the accordion items are horizontal.
   */
  isHorizontal: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The `id` of the focused accordion item.
   */
  focusedValue: string | null
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type ItemProps = {
  value: string
  disabled?: boolean
}

export type ItemState = {
  isOpen: boolean
  isFocused: boolean
  isDisabled: boolean
}
