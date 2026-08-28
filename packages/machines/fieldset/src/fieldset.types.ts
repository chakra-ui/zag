import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  legend: string
  errorText: string
  helperText: string
}>

export interface FieldsetProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the fieldset is disabled. Native `<fieldset disabled>` semantics
   * carry the disabled state to all descendant form controls.
   * @default false
   */
  disabled?: boolean | undefined
  /**
   * Whether the fieldset is invalid. Not inherited by descendant fields.
   * @default false
   */
  invalid?: boolean | undefined
}

type PropsWithDefault = "disabled" | "invalid"

export interface FieldsetSchema {
  state: "idle"
  props: FieldsetProps
  defaultPropKey: PropsWithDefault
  context: {
    hasErrorText: boolean
    hasHelperText: boolean
    /**
     * Whether an ancestor `<fieldset disabled>` disables this one.
     */
    ancestorDisabled: boolean
  }
  computed: {
    disabled: boolean
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type FieldsetService = Service<FieldsetSchema>

export type FieldsetMachine = Machine<FieldsetSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ResolvedElementIds {
  root: string
  legend: string
  errorText: string
  helperText: string
}

export interface FieldsetState {
  /**
   * Whether the fieldset is disabled (including inherited ancestor fieldset state).
   */
  disabled: boolean
  /**
   * Whether the fieldset is invalid.
   */
  invalid: boolean
}

export interface RootState extends FieldsetState {}

export interface LegendState extends FieldsetState {}

export interface HelperTextState extends FieldsetState {}

export interface ErrorTextState extends FieldsetState {
  /**
   * Whether the error text is hidden.
   */
  hidden: boolean
}

export interface FieldsetApi<T extends PropTypes = PropTypes> {
  /**
   * The resolved element ids, for composition with other components.
   */
  ids: ResolvedElementIds
  /**
   * Whether the fieldset is disabled (including inherited ancestor fieldset state).
   */
  disabled: boolean
  /**
   * Whether the fieldset is invalid.
   */
  invalid: boolean
  /**
   * Returns the state of the root.
   */
  getRootState: () => RootState
  getRootProps: () => T["element"]
  /**
   * Returns the state of the legend.
   */
  getLegendState: () => LegendState
  getLegendProps: () => T["element"]
  /**
   * Returns the state of the helper text.
   */
  getHelperTextState: () => HelperTextState
  getHelperTextProps: () => T["element"]
  /**
   * Returns the state of the error text.
   */
  getErrorTextState: () => ErrorTextState
  getErrorTextProps: () => T["element"]
}
