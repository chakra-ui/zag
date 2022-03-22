import type { Machine, StateMachine as S } from "@ui-machines/core"
import type { PositioningOptions, Placement } from "@ui-machines/popper"
import type { Point } from "@ui-machines/rect-utils"
import type { Context } from "@ui-machines/types"

export type Service = Machine<MachineContext, MachineState>

export type MachineState = {
  value: "unknown" | "idle" | "open" | "closed" | "opening" | "closing" | "opening:contextmenu"
  tags: "visible"
}

export type MachineContext = Context<{
  /**
   * The values of radios and checkboxes in the menu.
   */
  values?: Record<string, string | string[]>
  /**
   * The `id` of the active menu item.
   */
  activeId: string | null
  /**
   * Function called when a menu item is selected.
   */
  onSelect?: (value: string) => void
  /**
   * @internal The menu's parent. Used for submenus.
   */
  parent: Service | null
  /**
   * @internal The child menus. Used for submenus.
   */
  children: Record<string, Service>
  /**
   * @internal The polygon tells us if the pointer is moving toward the submenu
   */
  intentPolygon: Point[] | null
  /**
   * @internal Whether to suspend listening to pointer-over events on a submenu.
   * This is used to prevent the menu from closing when the user is hovering to a submenu.
   */
  suspendPointer: boolean
  /**
   * @internal The `id` of the menu item that is currently being hovered.
   */
  hoverId: string | null
  /**
   * Whether to loop the keyboard navigation.
   */
  loop: boolean
  /**
   * Whether the menu is a context menu
   */
  contextMenu?: boolean
  /**
   * @internal For context menu, the point where the context menu is opened.
   */
  contextMenuPoint: Point | null
  /**
   * @computed Whether the menu is a submenu (has a parent menu)
   */
  readonly isSubmenu: boolean
  /**
   * @computed Whether the writing direction is rtl
   */
  readonly isRtl: boolean
  /**
   * The options used to dynamically position the menu
   */
  positioning: PositioningOptions
  /**
   * Whether to disable dynamic placement
   */
  disablePlacement?: boolean
  /**
   * @internal The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
  /**
   * @computed Whether the dynamic placement has been computed
   */
  readonly isPlacementComplete?: boolean
}>

export type State = S.State<MachineContext, MachineState>

export type Send = (event: S.Event<S.AnyEventObject>) => void

export type Api = {
  getItemProps: (opts: ItemProps) => Record<string, any>
  triggerProps: Record<string, any>
}

export type ItemProps = {
  /**
   * The `id` of the menu item option.
   */
  id: string
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean
  /**
   * The textual value of the option. Used in typeahead navigation of the menu.
   * If not provided, the text content of the menu item will be used.
   */
  valueText?: string
}

export type OptionItemProps = ItemProps & {
  /**
   * The option's name as specified in menu's `context.values` object
   */
  name: string
  /**
   * Whether the option is a radio or a checkbox
   */
  type: "radio" | "checkbox"
  /**
   * The value of the option
   */
  value: string
  /**
   * Function called when the option state is changed
   */
  onChange?: (checked: boolean) => void
}
