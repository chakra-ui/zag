import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  item: (value: string) => string
  group: (value: string) => string
}>

export interface ToolbarProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the toolbar. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the toolbar is disabled. This cascades into every item's
   * effective `disabled` state, but never affects `getLinkProps`.
   */
  disabled?: boolean | undefined
  /**
   * The orientation of the toolbar.
   * @default "horizontal"
   */
  orientation?: Orientation | undefined
  /**
   * Whether to loop focus inside the toolbar when navigating with the keyboard.
   * @default true
   */
  loopFocus?: boolean | undefined
}

type PropsWithDefault = "orientation" | "loopFocus"

interface PrivateContext {
  /**
   * The value of the item that currently holds the roving tabindex.
   * Persists across blur, so tabbing away and back resumes at the same item.
   */
  focusedValue: string | null
  /**
   * Whether the root has ever redirected focus to an item. Once true, the root
   * permanently cedes its own tabindex to whichever item is tracked.
   */
  hasInteracted: boolean
  /**
   * Whether the toolbar was focused by a click.
   */
  isClickFocus: boolean
}

export interface ToolbarSchema {
  props: RequiredBy<ToolbarProps, PropsWithDefault>
  context: PrivateContext
  state: "idle" | "focused"
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type ToolbarService = Service<ToolbarSchema>

export type ToolbarMachine = Machine<ToolbarSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The unique value of the item.
   */
  value: string
  /**
   * Whether the item is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Whether the item remains focusable (and reachable via arrow keys) while disabled.
   * Keeping disabled controls in the roving tabindex sequence makes them discoverable.
   * @default true
   */
  focusableWhenDisabled?: boolean | undefined
}

export interface ItemState {
  /**
   * The underlying id of the item.
   */
  id: string
  /**
   * Whether the item is disabled. When `focusableWhenDisabled` is `true`, guard your
   * own action handler with this, e.g. `onClick={itemState.disabled ? undefined : fn}`.
   */
  disabled: boolean
  /**
   * Whether the item remains focusable (and reachable via arrow keys) while disabled.
   */
  focusableWhenDisabled: boolean
  /**
   * Whether the item is the current roving tabindex target.
   */
  focused: boolean
  /**
   * The orientation of the toolbar this item belongs to.
   */
  orientation: Orientation
}

export interface LinkProps {
  /**
   * The unique value of the link.
   */
  value: string
}

export interface GroupProps {
  /**
   * The unique value of the group.
   */
  value: string
  /**
   * Whether the group is disabled. This is a purely visual/ARIA concern —
   * it does not automatically cascade into the disabled state of items
   * rendered inside it. Thread it into each item's own `disabled` prop, e.g.
   * `api.getItemProps({ value, disabled: groupDisabled || itemDisabled })`.
   */
  disabled?: boolean | undefined
}

export interface ToolbarApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the toolbar is disabled.
   */
  disabled: boolean
  /**
   * The value of the item that is currently focused, if any.
   */
  focusedValue: string | null
  /**
   * The orientation of the toolbar.
   */
  orientation: Orientation
  /**
   * Returns the resolved DOM id for the given item value. Useful for aligning
   * a composed machine's own id (e.g. `select`'s `ids.trigger`) with a toolbar
   * item, so the two machines agree on one DOM node.
   */
  getItemId: (value: string) => string
  /**
   * Returns the state details of the given item.
   */
  getItemState: (props: ItemProps) => ItemState
  getRootProps: () => T["element"]
  getGroupProps: (props: GroupProps) => T["element"]
  getSeparatorProps: () => T["element"]
  getItemProps: (props: ItemProps) => T["button"]
  getLinkProps: (props: LinkProps) => T["element"]
  getInputProps: (props: ItemProps) => T["input"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation }
