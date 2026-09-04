import type { CollectionItem, CollectionOptions, ListCollection } from "@zag-js/collection"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type { CollectionItem, CollectionOptions }

export interface ValueChangeDetails<T extends CollectionItem = CollectionItem> {
  value: string | null
  item: T | null
}

export interface ElementIds {
  root?: string | undefined
  label?: string | undefined
  control?: string | undefined
  itemGroup?: string | undefined
  item?: ((index: number) => string) | undefined
  highlight?: string | undefined
  highlightItemGroup?: string | undefined
  highlightItem?: ((index: number) => string) | undefined
  hiddenSelect?: string | undefined
}

export interface WheelPickerProps<T extends CollectionItem = CollectionItem>
  extends DirectionProperty, CommonProperties {
  /** The item collection. */
  collection: ListCollection<T>
  /** The ids of the elements in the wheel picker. Useful for composition. */
  ids?: ElementIds | undefined
  /** The controlled value of the wheel picker. */
  value?: string | null | undefined
  /** The initial value of the wheel picker when rendered. */
  defaultValue?: string | null | undefined
  /** Function called when the selected value changes. */
  onValueChange?: ((details: ValueChangeDetails<T>) => void) | undefined
  /** Function called when scrolling to a value finishes. */
  onValueChangeEnd?: ((details: ValueChangeDetails<T>) => void) | undefined
  /** Whether the wheel should loop infinitely. @default false */
  infinite?: boolean | undefined
  /** The number of items on the circular ring. Values are rounded down to a multiple of 4. @default 20 */
  visibleCount?: number | undefined
  /** The deceleration applied after a drag. @default 3 */
  dragSensitivity?: number | undefined
  /** The speed of step-based scrolling. @default 5 */
  scrollSensitivity?: number | undefined
  /** The height of each item in pixels. @default 30 */
  optionItemHeight?: number | undefined
  /** Whether the wheel picker is disabled. */
  disabled?: boolean | undefined
  /** Whether the wheel picker is read-only. */
  readOnly?: boolean | undefined
  /** Whether the wheel picker is invalid. */
  invalid?: boolean | undefined
  /** Whether a value is required for form submission. */
  required?: boolean | undefined
  /** The name of the form field. */
  name?: string | undefined
  /** The id of the form that owns the hidden select. */
  form?: string | undefined
  /** The accessible label for the wheel picker. */
  "aria-label"?: string | undefined
  /** The id of the element that labels the wheel picker. */
  "aria-labelledby"?: string | undefined
}

type PropsWithDefault =
  "collection" | "dir" | "dragSensitivity" | "infinite" | "optionItemHeight" | "scrollSensitivity" | "visibleCount"

interface DragData {
  moved: boolean
  samples: Array<{ time: number; y: number }>
  startScroll: number
  startY: number
}

export interface WheelPickerSchema<T extends CollectionItem = CollectionItem> {
  state: "idle" | "dragging" | "scrolling"
  props: RequiredBy<WheelPickerProps<T>, PropsWithDefault>
  context: {
    fieldsetDisabled: boolean
    focused: boolean
    index: number
    value: string | null
  }
  computed: {
    interactive: boolean
  }
  refs: {
    drag: DragData
    lastWheelTime: number
    scrollDirection: 1 | -1
    scrollDuration: number
    scrollPosition: number
    scrollTarget: number
    typeahead: TypeaheadState
  }
  action: string
  effect: string
  guard: string
  event: EventObject
}

export type WheelPickerService<T extends CollectionItem = CollectionItem> = Service<WheelPickerSchema<T>>
export type WheelPickerMachine<T extends CollectionItem = CollectionItem> = Machine<WheelPickerSchema<T>>

export interface WheelPickerRenderItem<T extends CollectionItem = CollectionItem> {
  item: T
  index: number
  key: string
}

export interface ItemProps<T extends CollectionItem = CollectionItem> {
  item: T
  /** The virtual index from `api.items`. */
  index: number
}

export interface ItemState {
  disabled: boolean
  index: number
  selected: boolean
  value: string | null
}

export interface WheelPickerApi<P extends PropTypes = PropTypes, T extends CollectionItem = CollectionItem> {
  /** The selected value. */
  value: string | null
  /** The selected item. */
  selectedItem: T | null
  /** The selected item's display string. */
  valueAsString: string
  /** The selected index in the original collection. */
  index: number
  /** Whether the wheel is focused. */
  focused: boolean
  /** Whether the wheel is being dragged. */
  dragging: boolean
  /** Whether the wheel is settling to an item. */
  scrolling: boolean
  /** The visual items to render on the 3D wheel. */
  items: WheelPickerRenderItem<T>[]
  /** The items to render in the clipped highlight layer. */
  highlightItems: WheelPickerRenderItem<T>[]
  /** Set the value immediately. */
  setValue: (value: string | null) => void
  /** Smoothly scroll to a collection index. */
  scrollToIndex: (index: number) => void
  /** Get the derived state for a visual item. */
  getItemState: (props: ItemProps<T>) => ItemState

  getRootProps: () => P["element"]
  getLabelProps: () => P["label"]
  getControlProps: () => P["element"]
  getItemGroupProps: () => P["element"]
  getItemProps: (props: ItemProps<T>) => P["element"]
  getHighlightProps: () => P["element"]
  getHighlightItemGroupProps: () => P["element"]
  getHighlightItemProps: (props: ItemProps<T>) => P["element"]
  getHiddenSelectProps: () => P["select"]
}
