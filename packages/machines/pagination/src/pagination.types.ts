import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface PageChangeDetails {
  page: number
  pageSize: number
}

export interface PageSizeChangeDetails {
  pageSize: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ItemLabelDetails {
  page: number
  totalPages: number
}

export interface IntlTranslations {
  rootLabel?: string
  prevTriggerLabel?: string
  nextTriggerLabel?: string
  itemLabel?(details: ItemLabelDetails): string
}

export type ElementIds = Partial<{
  root: string
  ellipsis(index: number): string
  prevTrigger: string
  nextTrigger: string
  item(page: number): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the accordion. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations: IntlTranslations
  /**
   * Total number of data items
   */
  count: number
  /**
   * Number of data items per page
   * @default 10
   */
  pageSize: number
  /**
   * Number of pages to show beside active page
   * @default 1
   */
  siblingCount: number
  /**
   * The active page
   * @default 1
   */
  page: number
  /**
   * Called when the page number is changed
   */
  onPageChange?: (details: PageChangeDetails) => void
  /**
   * Called when the page size is changed
   */
  onPageSizeChange?: (details: PageSizeChangeDetails) => void
  /**
   * The type of the trigger element
   * @default "button"
   */
  type: "button" | "link"
}

interface PrivateContext {}

type ComputedContext = Readonly<{
  /**
   * @computed
   * Total number of pages
   */
  totalPages: number
  /**
   * @computed
   * Pages to render in pagination
   */
  items: Pages
  /**
   * @computed
   * Index of first and last data items on current page
   */
  pageRange: { start: number; end: number }
  /**
   * @computed
   * The previous page index
   */
  previousPage: number | null
  /**
   * @computed
   * The next page index
   */
  nextPage: number | null
  /**
   * @computed
   * Whether the current page is valid
   */
  isValidPage: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id" | "count">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  type: "page"
  value: number
}

export interface EllipsisProps {
  index: number
}

export type Pages = Array<{ type: "ellipsis" } | { type: "page"; value: number }>

interface PageRange {
  start: number
  end: number
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The current page.
   */
  page: number
  /**
   * The number of data items per page.
   */
  pageSize: number
  /**
   * The total number of pages.
   */
  totalPages: number
  /**
   * The page range. Represented as an array of page numbers (including ellipsis)
   */
  pages: Pages
  /**
   * The previous page.
   */
  previousPage: number | null
  /**
   * The next page.
   */
  nextPage: number | null
  /**
   * The page range. Represented as an object with `start` and `end` properties.
   */
  pageRange: PageRange
  /**
   * Function to slice an array of data based on the current page.
   */
  slice<V>(data: V[]): V[]
  /**
   * Function to set the total number of pages.
   */
  setCount(count: number): void
  /**
   * Function to set the page size.
   */
  setPageSize(size: number): void
  /**
   * Function to set the current page.
   */
  setPage(page: number): void
  /**
   * Function to go to the next page.
   */
  goToNextPage(): void
  /**
   * Function to go to the previous page.
   */
  goToPrevPage(): void
  /**
   * Function to go to the first page.
   */
  goToFirstPage(): void
  /**
   * Function to go to the last page.
   */
  goToLastPage(): void

  getRootProps(): T["element"]
  getEllipsisProps(props: EllipsisProps): T["element"]
  getItemProps(page: ItemProps): T["element"]
  getPrevTriggerProps(): T["element"]
  getNextTriggerProps(): T["element"]
}
