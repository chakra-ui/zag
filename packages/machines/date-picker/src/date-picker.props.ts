import { createProps } from "@zag-js/types"
import type {
  InputProps,
  PresetTriggerProps,
  TableCellProps,
  TableProps,
  UserDefinedContext,
  ViewProps,
} from "./date-picker.types"

export const props = createProps<UserDefinedContext>()([
  "closeOnSelect",
  "dir",
  "disabled",
  "fixedWeeks",
  "focusedValue",
  "format",
  "getRootNode",
  "id",
  "ids",
  "isDateUnavailable",
  "isDateUnavailable",
  "locale",
  "max",
  "min",
  "modal",
  "name",
  "numOfMonths",
  "onFocusChange",
  "onOpenChange",
  "onValueChange",
  "onViewChange",
  "open",
  "open.controlled",
  "parse",
  "positioning",
  "readOnly",
  "selectionMode",
  "startOfWeek",
  "timeZone",
  "translations",
  "value",
  "view",
])

export const inputProps = createProps<InputProps>()(["index"])

export const presetTriggerProps = createProps<PresetTriggerProps>()(["value"])

export const tableProps = createProps<TableProps>()(["columns", "id", "view"])

export const tableCellProps = createProps<TableCellProps>()(["disabled", "value", "columns"])

export const viewProps = createProps<ViewProps>()(["view"])
