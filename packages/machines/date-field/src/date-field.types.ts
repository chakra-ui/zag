import type {
  Calendar,
  CalendarDate,
  CalendarDateTime,
  DateFormatter,
  DateValue,
  ZonedDateTime,
} from "@internationalized/date"
import type { Machine, Service } from "@zag-js/core"
import type { DateGranularity } from "@zag-js/date-utils"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { EDITABLE_SEGMENTS } from "./utils/segments"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: DateValue[]
  valueAsString: string[]
}

export interface PlaceholderChangeDetails extends ValueChangeDetails {
  placeholderValue: DateValue
}

export interface FocusChangeDetails {
  focused: boolean
}

export interface FormatDateDetails {
  locale: string
  timeZone: string
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type SelectionMode = "single" | "range"

export type HourCycle = 12 | 24

export interface IntlTranslations {
  placeholder: (locale: string) => Record<EditableSegmentType, string>
}

export type ElementIds = Partial<{
  root: string
  label: (index: number) => string
  control: string
  segmentGroup: (index: number) => string
  hiddenInput: (index: number) => string
}>

export interface DateFieldProps extends DirectionProperty, CommonProperties {
  /**
   * The locale (BCP 47 language tag) to use when formatting the date.
   * @default "en-US"
   */
  locale?: string | undefined
  /**
   * The localized messages to use.
   */
  translations?: IntlTranslations | undefined
  /**
   * The ids of the elements in the date field. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The `name` attribute of the input element.
   */
  name?: string | undefined
  /**
   * The `form` attribute of the hidden input element.
   */
  form?: string | undefined
  /**
   * The time zone to use
   * @default "UTC"
   */
  timeZone?: string | undefined
  /**
   * Whether the date field is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Whether the date field is read-only.
   */
  readOnly?: boolean | undefined
  /**
   * Whether the date field is required
   */
  required?: boolean | undefined
  /**
   * Whether the date field is invalid
   */
  invalid?: boolean | undefined
  /**
   * The minimum date that can be selected.
   */
  min?: DateValue | undefined
  /**
   * The maximum date that can be selected.
   */
  max?: DateValue | undefined
  /**
   * The controlled selected date(s).
   */
  value?: DateValue[] | undefined
  /**
   * The initial selected date(s) when rendered.
   * Use when you don't need to control the selected date(s).
   */
  defaultValue?: DateValue[] | undefined
  /**
   * The controlled placeholder date.
   */
  placeholderValue?: DateValue | undefined
  /**
   * The initial placeholder date when rendered.
   */
  defaultPlaceholderValue?: DateValue | undefined
  /**
   * Function called when the value changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * A function called when the placeholder value changes.
   */
  onPlaceholderChange?: ((details: PlaceholderChangeDetails) => void) | undefined
  /**
   * A function called when the date field gains or loses focus.
   */
  onFocusChange?: ((details: FocusChangeDetails) => void) | undefined
  /**
   * The selection mode of the date field.
   * - `single` - only one date can be entered
   * - `range` - a range of dates can be entered (start and end)
   *
   * @default "single"
   */
  selectionMode?: SelectionMode | undefined
  /**
   * Whether to use 12-hour or 24-hour time format.
   * By default, this is determined by the locale.
   */
  hourCycle?: HourCycle | undefined
  /**
   * Determines the smallest unit that is displayed in the date field.
   * @default "day"
   */
  granularity?: DateGranularity | undefined
  /**
   * The date formatter to use.
   */
  formatter?: DateFormatter | undefined
  /**
   * The computed segments map for the formatter.
   */
  allSegments?: Segments | undefined
  /**
   * The format function for converting a DateValue to a string.
   */
  format?: ((date: DateValue, details: FormatDateDetails) => string) | undefined
}

type PropsWithDefault =
  | "selectionMode"
  | "locale"
  | "timeZone"
  | "granularity"
  | "translations"
  | "formatter"
  | "allSegments"
  | "format"

interface PrivateContext {
  /**
   * The index of the currently active date (for range mode).
   */
  activeIndex: number
  /**
   * The index of the currently active segment.
   */
  activeSegmentIndex: number
  /**
   * The selected date(s).
   */
  value: DateValue[]
  /**
   * The placeholder date.
   */
  placeholderValue: DateValue
  /**
   * The valid segments for each date value (tracks which segments have been filled).
   */
  validSegments: Segments[]
  /**
   * Accumulated keys entered in the focused segment.
   */
  enteredKeys: string
}

type ComputedContext = Readonly<{
  /**
   * Whether the date field is interactive.
   */
  isInteractive: boolean
  /**
   * The value text to display.
   */
  valueAsString: string[]
  /**
   * A list of segments for the selected date(s).
   */
  segments: DateSegment[][]
}>

type Refs = Record<string, never>

export interface DateFieldSchema {
  state: "idle" | "focused"
  props: RequiredBy<DateFieldProps, PropsWithDefault>
  context: PrivateContext
  computed: ComputedContext
  refs: Refs
  guard: string
  action: string
}

export type DateFieldService = Service<DateFieldSchema>

export type DateFieldMachine = Machine<DateFieldSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export type SegmentType =
  | "era"
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "dayPeriod"
  | "literal"
  | "timeZoneName"

export type Segments = Partial<{
  -readonly [K in keyof typeof EDITABLE_SEGMENTS]: boolean
}>

export type EditableSegmentType = {
  [K in keyof typeof EDITABLE_SEGMENTS]: (typeof EDITABLE_SEGMENTS)[K] extends true ? K : never
}[keyof typeof EDITABLE_SEGMENTS]

export interface DateSegment {
  /**
   * The type of segment.
   */
  type: SegmentType
  /**
   * The formatted text for the segment.
   */
  text: string
  /**
   * The numeric value for the segment, if applicable.
   */
  value?: number
  /**
   * The minimum numeric value for the segment, if applicable.
   */
  minValue?: number
  /**
   * The maximum numeric value for the segment, if applicable.
   */
  maxValue?: number
  /**
   * Whether the value is a placeholder.
   */
  isPlaceholder: boolean
  /**
   * A placeholder string for the segment.
   */
  placeholder: string
  /**
   * Whether the segment is editable.
   */
  isEditable: boolean
}

export interface SegmentGroupProps {
  index?: number | undefined
}

export interface SegmentsProps {
  index?: number | undefined
}

export interface SegmentProps {
  segment: DateSegment
  index?: number | undefined
}

export interface SegmentState {
  editable: boolean
}

export interface LabelProps {
  index?: number | undefined
}

export interface HiddenInputProps {
  index?: number | undefined
  name?: string | undefined
}

export interface DateFieldApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the date field is focused
   */
  focused: boolean
  /**
   * Whether the date field is disabled
   */
  disabled: boolean
  /**
   * Whether the date field is invalid
   */
  invalid: boolean
  /**
   * The selected date(s).
   */
  value: DateValue[]
  /**
   * The selected date(s) as Date objects.
   */
  valueAsDate: Date[]
  /**
   * The selected date(s) as strings.
   */
  valueAsString: string[]
  /**
   * The placeholder date.
   */
  placeholderValue: DateValue
  /**
   * Sets the selected date(s) to the given values.
   */
  setValue: (values: DateValue[]) => void
  /**
   * Clears the selected date(s).
   */
  clearValue: VoidFunction
  /**
   * Returns the segments for the given index.
   */
  getSegments: (props?: SegmentsProps | undefined) => DateSegment[]
  /**
   * Returns the state details for a given segment.
   */
  getSegmentState: (props: SegmentProps) => SegmentState

  getRootProps: () => T["element"]
  getLabelProps: (props?: LabelProps) => T["label"]
  getControlProps: () => T["element"]
  getSegmentGroupProps: (props?: SegmentGroupProps | undefined) => T["element"]
  getSegmentProps: (props: SegmentProps) => T["element"]
  getHiddenInputProps: (props?: HiddenInputProps | undefined) => T["input"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Calendar, CalendarDate, CalendarDateTime, DateFormatter, DateValue, ZonedDateTime }
