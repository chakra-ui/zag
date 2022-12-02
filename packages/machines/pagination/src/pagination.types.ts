import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type IntlTranslations = {
  rootLabel?: string
  itemLabel?(details: { page: number; totalPages: number }): string
}

type ElementIds = Partial<{
  root: string
  ellipsis(index: number): string
  prevItem: string
  nextItem: string
  item(page: number): string
}>

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
    onChange?: (details: { page: number; pageSize: number; srcElement: HTMLElement | null }) => void
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
  readonly items: PaginationRange
  /**
   * @computed
   * Index of first and last data items on current page
   */
  readonly pageRange: { start: number; end: number }
  /**
   * @computed
   * The previous page index
   */
  readonly previousPage: number | null
  /**
   * @computed
   * The next page index
   */
  readonly nextPage: number | null
  readonly isValidPage: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id" | "count">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
