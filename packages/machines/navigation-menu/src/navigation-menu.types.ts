import type { EventObject, Machine, Service } from "@zag-js/core"
import type {
  CommonProperties,
  DirectionProperty,
  Orientation,
  OrientationProperty,
  PropTypes,
  Rect,
  RequiredBy,
  Size,
} from "@zag-js/types"
import type { AutoReset } from "./auto-reset"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string | null
}

export type ElementIds = Partial<{
  root: string
  list: string
  item: string
  indicator: string
  trigger: string
  content: string
  viewport: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface NavigationMenuProps extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The ids of the elements in the machine.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled value of the navigation menu
   */
  value?: string | null | undefined
  /**
   * The default value of the navigation menu.
   * Use when you don't want to control the value of the menu.
   */
  defaultValue?: string | null | undefined
  /**
   * Function called when the value of the menu changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The delay before the menu opens
   * @default 200
   */
  openDelay?: number | undefined
  /**
   * The delay before the menu closes
   * @default 300
   */
  closeDelay?: number | undefined
  /**
   * Whether to disable the click trigger
   */
  disableClickTrigger?: boolean | undefined
  /**
   * Whether to disable the hover trigger
   */
  disableHoverTrigger?: boolean | undefined
}

type PropsWithDefault = "openDelay" | "closeDelay" | "dir" | "id"

export interface NavigationMenuSchema {
  props: RequiredBy<NavigationMenuProps, PropsWithDefault>
  state: "opening" | "open" | "closing" | "closed"
  computed: {
    isRootMenu: boolean
    isSubmenu: boolean
  }
  refs: {
    contentCleanup: VoidFunction | null
    triggerCleanup: VoidFunction | null
    tabOrderCleanup: VoidFunction | null
    pointerMoveOpenedRef: AutoReset<string | null>
    clickCloseRef: string | null
    wasEscapeClose: boolean
    parent: NavigationMenuService | null
    children: Record<string, NavigationMenuService | null>
  }
  context: {
    value: string | null
    previousValue: string | null
    viewportSize: Size | null
    isViewportRendered: boolean
    contentNode: HTMLElement | null
    triggerRect: Rect | null
    triggerNode: HTMLElement | null
  }
  action: string
  effect: string
  guard: string
  event: EventObject
}

export type NavigationMenuMachine = Machine<NavigationMenuSchema>

export type NavigationMenuService = Service<NavigationMenuSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The value of the item
   */
  value: string
  /**
   * Whether the item is disabled
   */
  disabled?: boolean | undefined
}

export interface ArrowProps {
  /**
   * The value of the item
   */
  value: string
}

export interface LinkProps {
  /**
   * The value of the item this link belongs to
   */
  value: string
  /**
   * Whether the link is the current link
   */
  current?: boolean | undefined
  /**
   * Function called when the link is selected
   */
  onSelect?: (event: CustomEvent) => void
}

export interface NavigationMenuApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the menu
   */
  value: string | null
  /**
   * Sets the value of the menu
   */
  setValue: (value: string) => void
  /**
   * Whether the menu is open
   */
  open: boolean
  /**
   * Sets the parent of the menu
   */
  setParent: (parent: NavigationMenuService) => void
  /**
   * Sets the child of the menu
   */
  setChild: (child: NavigationMenuService) => void
  /**
   * The orientation of the menu
   */
  orientation: Orientation

  getRootProps(): T["element"]
  getListProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getIndicatorTrackProps(): T["element"]
  getIndicatorProps(): T["element"]
  getArrowProps(props?: ArrowProps): T["element"]
  getTriggerProps(props: ItemProps): T["button"]
  getLinkProps(props: LinkProps): T["element"]
  getContentProps(props: LinkProps): T["element"]
  getViewportPositionerProps(): T["element"]
  getViewportProps(): T["element"]
}
