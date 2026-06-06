import type { EventObject, Machine, Service } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Coordination types
 * -----------------------------------------------------------------------------*/

/**
 * The reason a menu within the menubar closed. Used to decide whether the menubar
 * should keep `hasOpenMenu` active (another menu is about to open) or reset it.
 */
export type MenuCloseReason = "escape" | "click-outside" | "sibling-open" | "item-select" | "list-navigation"

/**
 * The custom DOM events menus dispatch on the menubar element to coordinate.
 * Coordination is intentionally DOM-based — no imports between the menu and menubar packages.
 */
export interface MenubarEventMap {
  "menu:open": CustomEvent<{ menuId: string }>
  "menu:close": CustomEvent<{ menuId: string; reason: MenuCloseReason }>
  "menu:focus-next": CustomEvent<void>
  "menu:focus-prev": CustomEvent<void>
}

/* -----------------------------------------------------------------------------
 * Machine props
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
}>

export interface MenubarProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the menubar. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The orientation of the menubar.
   * @default "horizontal"
   */
  orientation?: Orientation | undefined
  /**
   * Whether to loop the keyboard navigation across the triggers.
   * @default true
   */
  loopFocus?: boolean | undefined
  /**
   * Whether the menubar (and all its menu triggers) is disabled.
   * @default false
   */
  disabled?: boolean | undefined
}

type PropsWithDefault = "orientation" | "loopFocus"

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface MenubarContext {
  /**
   * The id of the currently focused/tabbable trigger (roving tabindex).
   */
  value: string | null
  /**
   * Whether any menu within the menubar is currently open.
   */
  hasOpenMenu: boolean
}

export interface MenubarSchema {
  props: RequiredBy<MenubarProps, PropsWithDefault>
  context: MenubarContext
  refs: {
    typeaheadState: TypeaheadState
  }
  state: "idle" | "focused" | "open"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type MenubarService = Service<MenubarSchema>

export type MenubarMachine = Machine<MenubarSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

/**
 * Config to pass to a child menu's `menubar` prop so it behaves as a menubar menu.
 * Structurally matches the `MenubarContext` type from `@zag-js/menu`.
 */
export interface MenubarMenuContext {
  rootId: string
  disabled: boolean
  orientation: Orientation
}

export interface MenubarApi<T extends PropTypes = PropTypes> {
  /**
   * Whether any menu within the menubar is open.
   */
  hasOpenMenu: boolean
  /**
   * The orientation of the menubar.
   */
  orientation: Orientation
  /**
   * Whether the menubar is disabled.
   */
  disabled: boolean
  getRootProps: () => T["element"]
  /**
   * Returns the config to pass to each top-level menu's `menubar` prop. Adapters
   * usually expose this via a context so nested `<Menu>`s can read it.
   */
  getMenuContext: () => MenubarMenuContext
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation }
