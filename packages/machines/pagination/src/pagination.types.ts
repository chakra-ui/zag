import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  dot(index: number): string
  prevButton: string
  nextButton: string
  page(page: number): string
}>

type PaginationRange = ({ type: "dot" } | { type: "page"; value: number })[]

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the accordion. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Total number of data items
     */
    itemsCount: number
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
    currentPage: number
    /**
     * Called when the page number is changed, and it takes the resulting page number argument
     */
    onChange?: (page: number) => void
  }

type PrivateContext = Context<{}>

type ComputedContext = Readonly<{
  /**
   * @computed
   * Total number of pages
   */
  readonly totalPages: number
  /**
   * @computed
   * Pages to render in pagination
   */
  readonly paginationRange: PaginationRange
  /**
   * @computed
   * Index of first item of current page
   */
  readonly firstPageIndex: number
  /**
   * @computed
   * Index of last item of current page
   */
  readonly lastPageIndex: number
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id" | "itemsCount">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "unknown" | "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
