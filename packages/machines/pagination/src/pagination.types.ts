import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type PageTriggerProps = {
  type: "page"
  value: number
}

export type EllipsisProps = {
  index: number
}

type IntlTranslations = {
  rootLabel?: string
  prevPageTriggerLabel?: string
  nextPageTriggerLabel?: string
  pageTriggerLabel?(details: { page: number; totalPages: number }): string
}

type ElementIds = Partial<{
  root: string
  ellipsis(index: number): string
  prevPageTrigger: string
  nextPageTrigger: string
  pageTrigger(page: number): string
}>

export type ChangeDetails = {
  page: number
  pageSize: number
}

export type PaginationRange = ({ type: "ellipsis" } | { type: "page"; value: number })[]

type PublicContext = DirectionProperty &
  CommonProperties & {
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
     */
    pageSize: number
    /**
     * Number of pages to show beside active page
     */
    siblingCount: number
    /**
     * The active page
     */
    page: number
    /**
     * Called when the page number is changed, and it takes the resulting page number argument
     */
    onChange?: (details: ChangeDetails) => void
    /**
     * The type of the trigger element
     * @default "button"
     */
    type: "button" | "link"
  }

type PrivateContext = Context<{}>

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
  items: PaginationRange
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

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * The current page.
   */
  page: number
  /**
   * The total number of pages.
   */
  totalPages: number
  /**
   * The page range. Represented as an array of page numbers (including ellipsis)
   */
  pages: PaginationRange
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
  pageRange: {
    start: number
    end: number
  }
  /**
   * Function to slice an array of data based on the current page.
   */
  slice<T_1>(data: T_1[]): T_1[]
  /**
   * Whether the current page is the first page.
   */
  isFirstPage: boolean
  /**
   * Whether the current page is the last page.
   */
  isLastPage: boolean
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
  rootProps: T["element"]
  getEllipsisProps(props: EllipsisProps): T["element"]
  getPageTriggerProps(page: PageTriggerProps): T["element"]
  prevPageTriggerProps: T["element"]
  nextPageTriggerProps: T["element"]
}
