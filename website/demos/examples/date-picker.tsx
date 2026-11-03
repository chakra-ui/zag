import {
  getLocalTimeZone,
  isWeekend,
  PersianCalendar,
  today,
  type CalendarIdentifier,
} from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi"
import styles from "../../styles/machines/date-picker.module.css"
import { Ghost, Log, Row, show, Stack } from "./shared"

const now = () => today(getLocalTimeZone())

function useDatePicker(props: Partial<datePicker.Props> = {}) {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en-US",
    ...props,
  })
  return datePicker.connect(service, normalizeProps)
}

function Field(props: { api: datePicker.Api }) {
  const { api } = props
  return (
    <div className={styles.Control} {...api.getControlProps()}>
      <input className={styles.Input} {...api.getInputProps()} />
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        <BiCalendar />
      </button>
    </div>
  )
}

function Popover(props: { api: datePicker.Api; children?: React.ReactNode }) {
  const { api } = props
  return (
    <Portal>
      <div {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          {props.children ?? <Calendar api={api} />}
        </div>
      </div>
    </Portal>
  )
}

function Inline(props: { api: datePicker.Api; children?: React.ReactNode }) {
  const { api } = props
  return (
    <div className={styles.Content} {...api.getContentProps()}>
      {props.children ?? <Calendar api={api} />}
    </div>
  )
}

function Header(props: { api: datePicker.Api; view: datePicker.DateView }) {
  const { api, view } = props
  const label =
    view === "day"
      ? api.visibleRangeText.start
      : view === "month"
        ? api.visibleRange.start.year
        : `${api.getDecade().start} – ${api.getDecade().end}`
  return (
    <div className={styles.ViewControl} {...api.getViewControlProps({ view })}>
      <button
        className={styles.PrevTrigger}
        {...api.getPreviousTriggerProps({ view })}
      >
        <BiChevronLeft />
      </button>
      <button
        className={styles.ViewTrigger}
        {...api.getViewTriggerProps({ view })}
      >
        {label}
      </button>
      <button
        className={styles.NextTrigger}
        {...api.getNextTriggerProps({ view })}
      >
        <BiChevronRight />
      </button>
    </div>
  )
}

function DayGrid(props: {
  api: datePicker.Api
  offset?: datePicker.DateValueOffset
}) {
  const { api, offset } = props
  const weeks = offset?.weeks ?? api.weeks
  const visibleRange = offset?.visibleRange
  return (
    <table className={styles.Table} {...api.getTableProps({ view: "day" })}>
      <thead {...api.getTableHeaderProps({ view: "day" })}>
        <tr {...api.getTableRowProps({ view: "day" })}>
          {api.showWeekNumbers && (
            <th {...api.getWeekNumberHeaderCellProps({ view: "day" })}>Wk</th>
          )}
          {api.weekDays.map((day, i) => (
            <th scope="col" key={i} aria-label={day.long}>
              {day.narrow}
            </th>
          ))}
        </tr>
      </thead>
      <tbody {...api.getTableBodyProps({ view: "day" })}>
        {weeks.map((week, weekIndex) => (
          <tr key={weekIndex} {...api.getTableRowProps({ view: "day" })}>
            {api.showWeekNumbers && (
              <td {...api.getWeekNumberCellProps({ weekIndex, week })}>
                {api.getWeekNumber(week)}
              </td>
            )}
            {week.map((value, i) => (
              <td
                key={i}
                {...api.getDayTableCellProps({ value, visibleRange })}
              >
                <div
                  className={styles.TableCellTrigger}
                  {...api.getDayTableCellTriggerProps({ value, visibleRange })}
                >
                  {value.day}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DayView(props: { api: datePicker.Api }) {
  const { api } = props
  return (
    <div {...api.getViewProps({ view: "day" })}>
      <Header api={api} view="day" />
      <DayGrid api={api} />
    </div>
  )
}

function MonthView(props: { api: datePicker.Api }) {
  const { api } = props
  return (
    <div {...api.getViewProps({ view: "month" })}>
      <Header api={api} view="month" />
      <table
        className={styles.Table}
        {...api.getTableProps({ view: "month", columns: 4 })}
      >
        <tbody {...api.getTableBodyProps({ view: "month" })}>
          {api
            .getMonthsGrid({ columns: 4, format: "short" })
            .map((months, row) => (
              <tr key={row} {...api.getTableRowProps({ view: "month" })}>
                {months.map((month, i) => (
                  <td
                    key={i}
                    {...api.getMonthTableCellProps({ ...month, columns: 4 })}
                  >
                    <div
                      className={styles.TableCellTrigger}
                      {...api.getMonthTableCellTriggerProps({
                        ...month,
                        columns: 4,
                      })}
                    >
                      {month.label}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

function YearView(props: { api: datePicker.Api }) {
  const { api } = props
  return (
    <div {...api.getViewProps({ view: "year" })}>
      <Header api={api} view="year" />
      <table
        className={styles.Table}
        {...api.getTableProps({ view: "year", columns: 4 })}
      >
        <tbody {...api.getTableBodyProps({ view: "year" })}>
          {api.getYearsGrid({ columns: 4 }).map((years, row) => (
            <tr key={row} {...api.getTableRowProps({ view: "year" })}>
              {years.map((year, i) => (
                <td
                  key={i}
                  {...api.getYearTableCellProps({ ...year, columns: 4 })}
                >
                  <div
                    className={styles.TableCellTrigger}
                    {...api.getYearTableCellTriggerProps({
                      ...year,
                      columns: 4,
                    })}
                  >
                    {year.label}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Calendar(props: { api: datePicker.Api }) {
  return (
    <>
      <DayView api={props.api} />
      <MonthView api={props.api} />
      <YearView api={props.api} />
    </>
  )
}

export function DatePickerInitialValue() {
  const api = useDatePicker({
    inline: true,
    defaultValue: [datePicker.parse("2022-01-01")],
  })
  return <Inline api={api} />
}

export function DatePickerControlled() {
  const [value, setValue] = useState<datePicker.DateValue[]>([now()])
  const api = useDatePicker({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Row>
        <Field api={api} />
        <Ghost onClick={() => setValue([now()])}>Today</Ghost>
        <Ghost onClick={() => setValue([now().add({ weeks: 1 })])}>
          Next week
        </Ghost>
        <Ghost onClick={() => setValue([])}>Clear</Ghost>
      </Row>
      <Popover api={api} />
      <Log label="value" value={show(value.map((date) => date.toString()))} />
    </Stack>
  )
}

export function DatePickerControlledOpen() {
  const [open, setOpen] = useState(false)
  const api = useDatePicker({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Row>
        <Field api={api} />
        <Ghost onClick={() => setOpen((current) => !current)}>
          {open ? "Close" : "Open"} from outside
        </Ghost>
      </Row>
      <Popover api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function DatePickerMinMax() {
  const api = useDatePicker({
    inline: true,
    min: now().subtract({ days: 3 }),
    max: now().add({ days: 10 }),
  })
  return <Inline api={api} />
}

export function DatePickerStartOfWeek() {
  const api = useDatePicker({ inline: true, startOfWeek: 1 })
  return <Inline api={api} />
}

export function DatePickerDisabled() {
  const api = useDatePicker({ disabled: true, defaultValue: [now()] })
  return (
    <Stack>
      <Field api={api} />
      <Popover api={api} />
    </Stack>
  )
}

export function DatePickerSelects() {
  const api = useDatePicker({ inline: true })
  return (
    <Inline api={api}>
      <div {...api.getViewProps({ view: "day" })}>
        <div className={styles.Selects}>
          <select className={styles.Select} {...api.getMonthSelectProps()}>
            {api.getMonths().map((month, i) => (
              <option key={i} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select className={styles.Select} {...api.getYearSelectProps()}>
            {api.getYears().map((year, i) => (
              <option key={i} value={year.value} disabled={year.disabled}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
        <DayGrid api={api} />
      </div>
    </Inline>
  )
}

export function DatePickerUnavailable() {
  const api = useDatePicker({
    inline: true,
    isDateUnavailable: (date, locale) => isWeekend(date, locale),
  })
  return <Inline api={api} />
}

export function DatePickerStartingView() {
  const api = useDatePicker({ inline: true, defaultView: "month" })
  return <Inline api={api} />
}

export function DatePickerReadOnly() {
  const api = useDatePicker({ readOnly: true, defaultValue: [now()] })
  return (
    <Stack>
      <Field api={api} />
      <Popover api={api} />
    </Stack>
  )
}

export function DatePickerInvalid() {
  const [value, setValue] = useState<datePicker.DateValue[]>([])
  const api = useDatePicker({
    required: true,
    invalid: value.length === 0,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Field api={api} />
      <Popover api={api} />
      <Log label="invalid" value={String(api.invalid)} />
    </Stack>
  )
}

export function DatePickerFocusedDate() {
  const api = useDatePicker({
    inline: true,
    defaultFocusedValue: datePicker.parse("2022-01-01"),
  })
  return <Inline api={api} />
}

export function DatePickerInline() {
  const api = useDatePicker({ inline: true })
  return <Inline api={api} />
}

export function DatePickerFixedWeeks() {
  const api = useDatePicker({ inline: true, fixedWeeks: true })
  return <Inline api={api} />
}

export function DatePickerWeekNumbers() {
  const api = useDatePicker({ inline: true, showWeekNumbers: true })
  return <Inline api={api} />
}

export function DatePickerMultiple() {
  const [value, setValue] = useState<string[]>([])
  const api = useDatePicker({
    inline: true,
    selectionMode: "multiple",
    maxSelectedDates: 3,
    onValueChange: (details) => setValue(details.valueAsString),
  })
  return (
    <Stack>
      <Inline api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function DatePickerPresets() {
  const [value, setValue] = useState<string[]>([])
  const api = useDatePicker({
    inline: true,
    selectionMode: "range",
    onValueChange: (details) => setValue(details.valueAsString),
  })
  return (
    <Stack>
      <Row>
        <button
          className={styles.Preset}
          {...api.getPresetTriggerProps({ value: "last7Days" })}
        >
          Last 7 days
        </button>
        <button
          className={styles.Preset}
          {...api.getPresetTriggerProps({ value: "last30Days" })}
        >
          Last 30 days
        </button>
        <button
          className={styles.Preset}
          {...api.getPresetTriggerProps({
            value: [
              datePicker.parse("2024-01-01"),
              datePicker.parse("2024-01-15"),
            ],
          })}
        >
          First half of Jan
        </button>
      </Row>
      <Inline api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function DatePickerFormat() {
  const api = useDatePicker({
    defaultValue: [now()],
    format: (date, details) =>
      date
        .toDate(details.timeZone)
        .toLocaleDateString(details.locale, { dateStyle: "medium" }),
    parse: (value) => {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? undefined : datePicker.parse(date)
    },
  })
  return (
    <Stack>
      <Field api={api} />
      <Popover api={api} />
    </Stack>
  )
}

export function DatePickerLocale() {
  const api = useDatePicker({
    inline: true,
    locale: "en-GB",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultValue: [now()],
  })
  return (
    <Stack>
      <Field api={api} />
      <Inline api={api} />
    </Stack>
  )
}

function createPersianCalendar(identifier: CalendarIdentifier) {
  if (identifier === "persian") return new PersianCalendar()
  throw new Error(`Unsupported calendar: ${identifier}`)
}

export function DatePickerCalendarSystem() {
  const api = useDatePicker({
    inline: true,
    locale: "fa-IR",
    createCalendar: createPersianCalendar,
  })
  return <Inline api={api} />
}

export function DatePickerViews() {
  const api = useDatePicker({
    inline: true,
    minView: "month",
    maxView: "year",
    defaultView: "month",
  })
  return <Inline api={api} />
}

export function DatePickerOpenBehavior() {
  const api = useDatePicker({
    selectionMode: "multiple",
    openOnClick: true,
    closeOnSelect: false,
  })
  return (
    <Stack>
      <Field api={api} />
      <Popover api={api} />
    </Stack>
  )
}

export function DatePickerOutsideDays() {
  const api = useDatePicker({ inline: true, outsideDaySelectable: true })
  return <Inline api={api} />
}

export function DatePickerValueChange() {
  const [value, setValue] = useState<string[]>([])
  const api = useDatePicker({
    inline: true,
    onValueChange: (details) => setValue(details.valueAsString),
  })
  return (
    <Stack>
      <Inline api={api} />
      <Log label="valueAsString" value={show(value)} />
    </Stack>
  )
}

export function DatePickerViewChange() {
  const [view, setView] = useState<datePicker.DateView>("day")
  const api = useDatePicker({
    inline: true,
    onViewChange: (details) => setView(details.view),
  })
  return (
    <Stack>
      <Inline api={api} />
      <Log label="view" value={view} />
    </Stack>
  )
}

export function DatePickerControlledFocus() {
  const [focused, setFocused] = useState<datePicker.DateValue>(
    datePicker.parse("2022-01-01"),
  )
  const api = useDatePicker({
    inline: true,
    focusedValue: focused,
    onFocusChange: (details) => setFocused(details.focusedValue),
  })
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => setFocused(datePicker.parse("2022-01-01"))}>
          Jan 1, 2022
        </Ghost>
        <Ghost onClick={() => setFocused(now())}>Today</Ghost>
      </Row>
      <Inline api={api} />
      <Log label="focusedValue" value={focused.toString()} />
    </Stack>
  )
}

export function DatePickerVisibleRange() {
  const [focused, setFocused] = useState("—")
  const [range, setRange] = useState("—")
  const api = useDatePicker({
    inline: true,
    onFocusChange: (details) => setFocused(details.focusedValue.toString()),
    onVisibleRangeChange: (details) =>
      setRange(
        `${details.visibleRange.start.toString()} → ${details.visibleRange.end.toString()}`,
      ),
  })
  return (
    <Stack>
      <Inline api={api} />
      <Log label="focused" value={focused} />
      <Log label="visibleRange" value={range} />
    </Stack>
  )
}

export function DatePickerMultipleMonths() {
  const api = useDatePicker({
    inline: true,
    selectionMode: "range",
    numOfMonths: 2,
  })
  const offset = api.getOffset({ months: 1 })
  return (
    <Inline api={api}>
      <div {...api.getViewProps({ view: "day" })}>
        <div className={styles.ViewControl}>
          <button
            className={styles.PrevTrigger}
            {...api.getPreviousTriggerProps()}
          >
            <BiChevronLeft />
          </button>
          <span className={styles.RangeText}>
            {api.visibleRangeText.formatted}
          </span>
          <button className={styles.NextTrigger} {...api.getNextTriggerProps()}>
            <BiChevronRight />
          </button>
        </div>
        <div className={styles.Months}>
          <DayGrid api={api} />
          <DayGrid api={api} offset={offset} />
        </div>
      </div>
    </Inline>
  )
}

export function DatePickerPositioning() {
  const api = useDatePicker({ positioning: { placement: "right-start" } })
  return (
    <Stack>
      <Field api={api} />
      <Popover api={api} />
    </Stack>
  )
}
