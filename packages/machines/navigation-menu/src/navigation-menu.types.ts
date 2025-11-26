import type { EventObject, Machine, Service } from "@zag-js/core"
import type {
  CommonProperties,
  DirectionProperty,
  Orientation,
  OrientationProperty,
  Point,
  PropTypes,
  Rect,
  RequiredBy,
  Size,
} from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string
}

export type ElementIds = Partial<{
  root: string
  list: string
  item: string
  trigger: (value: string) => string
  content: (value: string) => string
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
  value?: string | undefined
  /**
   * The default value of the navigation menu.
   * Use when you don't want to control the value of the menu.
   */
  defaultValue?: string | undefined
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
  /**
   * Whether to disable the pointer leave close
   */
  disablePointerLeaveClose?: boolean | undefined
}

type PropsWithDefault = "openDelay" | "closeDelay" | "dir" | "id" | "orientation"

export interface NavigationMenuSchema {
  props: RequiredBy<NavigationMenuProps, PropsWithDefault>
  state: "idle"
  computed: {
    open: boolean
  }
  refs: {
    restoreContentTabOrder: VoidFunction | undefined
    contentResizeObserverCleanup: VoidFunction | undefined
    contentDismissableCleanup: VoidFunction | undefined
    triggerResizeObserverCleanup: VoidFunction | undefined
    contentExitCompleteCleanup: VoidFunction | undefined

    closeTimeoutId: number | null
    openTimeoutIds: Record<string, number>
  }
  context: {
    value: string
    previousValue: string

    viewportSize: Size | null
    viewportPosition: Point | null
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

export interface ItemState {
  /**
   * The id of the item element
   */
  itemId: string
  /**
   * The id of the trigger element
   */
  triggerId: string
  /**
   * The id of the trigger proxy element
   */
  triggerProxyId: string
  /**
   * The id of the content element
   */
  contentId: string
  /**
   * Whether the item is currently selected
   */
  selected: boolean
  /**
   * Whether the item was previously selected (for animation)
   */
  wasSelected: boolean
  /**
   * Whether the item's content is open
   */
  open: boolean
  /**
   * Whether the item is disabled
   */
  disabled: boolean
}

export interface ArrowProps {
  /**
   * The value of the item
   */
  value: string
}

export interface ContentProps {
  /**
   * The value of the item this content belongs to
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
  onSelect?: ((event: CustomEvent) => void) | undefined
  /**
   * Whether to close the navigation menu when the link is clicked.
   * @default true
   */
  closeOnClick?: boolean | undefined
}

export interface ViewportProps {
  /**
   * Placement of the viewport for css variables `(--viewport-x, --viewport-y)`.
   * @defaultValue 'center'
   */
  align?: "start" | "center" | "end"
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
   * Whether the viewport is rendered
   */
  isViewportRendered: boolean
  /**
   * Gets the viewport node element
   */
  getViewportNode: () => HTMLElement | null
  /**
   * The orientation of the menu
   */
  orientation: Orientation
  /**
   * Function to reposition the viewport
   */
  reposition: VoidFunction

  getRootProps: () => T["element"]
  getListProps: () => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getIndicatorProps: () => T["element"]
  getItemIndicatorProps: (props: ItemProps) => T["element"]
  getArrowProps: (props?: ArrowProps) => T["element"]

  getTriggerProps: (props: ItemProps) => T["button"]
  getTriggerProxyProps: (props: ItemProps) => T["element"]
  getViewportProxyProps: (props: ItemProps) => T["element"]

  getLinkProps: (props: LinkProps) => T["element"]
  getContentProps: (props: ContentProps) => T["element"]
  getViewportPositionerProps: (props?: ViewportProps) => T["element"]
  getViewportProps: (props?: ViewportProps) => T["element"]

  getItemState: (props: ItemProps) => ItemState
}
