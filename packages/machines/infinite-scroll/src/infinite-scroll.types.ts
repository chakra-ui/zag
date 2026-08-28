import type { EventObject, Machine, Params, Service } from "@zag-js/core"
import type { LiveRegion } from "@zag-js/live-region"
import type { CommonProperties, DirectionProperty, Orientation, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Shared types
 * -----------------------------------------------------------------------------*/

export type { Orientation }

/**
 * Which edge of the scroller triggers loading.
 * `end` is a classic feed; `start` is a reversed layout such as a chat thread.
 */
export type Edge = "start" | "end"

export type Status = "idle" | "loading" | "complete"

/**
 * Why a load was requested.
 * - `scroll`: the sentinel entered the observer root
 * - `autofill`: the content does not fill the viewport yet
 * - `manual`: `api.loadMore()` was called
 */
export type LoadMoreReason = "scroll" | "autofill" | "manual"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface LoadMoreDetails {
  edge: Edge
  reason: LoadMoreReason
}

/** Return an empty string from any of these to suppress that announcement. */
export interface IntlTranslations {
  itemsLoaded?: ((count: number) => string) | undefined
  complete?: string | undefined
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  sentinel: string
}>

export interface InfiniteScrollProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Called when the sentinel approaches the leading edge of the scroller.
   * If it returns a promise, the loading state is derived from it.
   */
  onLoadMore?: ((details: LoadMoreDetails) => void | Promise<void>) | undefined
  /**
   * Whether more items are available.
   * @default true
   */
  hasMore?: boolean | undefined
  /**
   * The number of items currently loaded.
   *
   * This is the growth signal: a load is only allowed when it has increased since the last one,
   * which is what makes an unbounded fetch loop impossible.
   */
  count: number
  /**
   * Whether a load is in flight. When omitted, it is derived from the promise
   * returned by `onLoadMore`.
   */
  loading?: boolean | undefined
  /**
   * Which edge of the scroller triggers loading. Use `start` for reversed layouts.
   * @default "end"
   */
  edge?: Edge | undefined
  /**
   * The scroll axis.
   * @default "vertical"
   */
  orientation?: Orientation | undefined
  /**
   * How far ahead of the edge to trigger. A number is a ratio of the viewport size
   * (`1` = one viewport ahead); a string is any CSS length.
   * @default 1
   */
  offset?: number | string | undefined
  /**
   * Whether automatic loading is paused.
   * @default false
   */
  disabled?: boolean | undefined
  /**
   * Returns the scroll container. Use when the nearest scrolling ancestor of the sentinel
   * is not the right element, e.g. an external scroll area.
   */
  scrollEl?: (() => HTMLElement | null) | undefined
  /**
   * Specifies the localized strings that represent the element state.
   */
  translations?: IntlTranslations | undefined
}

type PropsWithDefault = "count" | "dir" | "hasMore" | "edge" | "orientation" | "offset" | "disabled" | "translations"

export interface InfiniteScrollSchema {
  state: "inactive" | "idle" | "loading"
  props: InfiniteScrollProps
  defaultPropKey: PropsWithDefault
  context: any
  refs: {
    /**
     * The `count` recorded when the last load started. The next load is only allowed once
     * `count` has moved past it.
     */
    countAtLoadStart: number | null
    /**
     * Scroll position captured before a `start` load, used to keep the viewport
     * anchored when content is prepended.
     */
    anchor: { el: HTMLElement; pos: number; size: number } | null
    prevCount: number
    liveRegion: LiveRegion | null
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type InfiniteScrollParams = Params<InfiniteScrollSchema>

export type InfiniteScrollService = Service<InfiniteScrollSchema>

export type InfiniteScrollMachine = Machine<InfiniteScrollSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface IndicatorProps {
  /**
   * Which status this indicator renders for.
   */
  type: Exclude<Status, "idle">
}

export interface InfiniteScrollApi<T extends PropTypes = PropTypes> {
  /**
   * The current status of the list.
   */
  status: Status
  /**
   * Whether a load is in flight.
   */
  loading: boolean
  /**
   * Whether more items are available.
   */
  hasMore: boolean
  /**
   * Loads the next page, bypassing the scroll trigger, the growth guard, and `disabled`.
   * No-op when `hasMore` is false or a load is already in flight.
   */
  loadMore: VoidFunction
  /**
   * Clears the growth guard and re-arms the sentinel. Call after replacing the list in place,
   * or to retry once a load that added nothing has blocked automatic loading.
   */
  reset: VoidFunction
  getSentinelProps: () => T["element"]
  getIndicatorProps: (props: IndicatorProps) => T["element"]
}
