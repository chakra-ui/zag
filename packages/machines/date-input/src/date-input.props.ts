import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { DateInputProps, HiddenInputProps, SegmentProps, SegmentsProps } from "./date-input.types"

export const props = createProps<DateInputProps>()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "locale",
  "max",
  "min",
  "name",
  "form",
  "onFocusChange",
  "onPlaceholderChange",
  "onValueChange",
  "readOnly",
  "required",
  "selectionMode",
  "timeZone",
  "translations",
  "value",
  "defaultValue",
  "hourCycle",
  "granularity",
  "shouldForceLeadingZeros",
  "allSegments",
  "formatter",
  "placeholderValue",
  "defaultPlaceholderValue",
  "format",
])

export const splitProps = createSplitProps<Partial<DateInputProps>>(props)

export const segmentProps = createProps<SegmentProps>()(["segment", "index"])
export const splitSegmentProps = createSplitProps<SegmentProps>(segmentProps)

export const segmentsProps = createProps<SegmentsProps>()(["index"])
export const splitSegmentsProps = createSplitProps<SegmentsProps>(segmentsProps)

export const hiddenInputProps = createProps<HiddenInputProps>()(["index", "name"])
export const splitHiddenInputProps = createSplitProps<HiddenInputProps>(hiddenInputProps)
