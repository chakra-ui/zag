import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi"

export function DatePickerMultipleMonths() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en-US",
    selectionMode: "range",
    numOfMonths: 2,
  })

  const api = datePicker.connect(service, normalizeProps)

  return (
    <>
      <main className="date-picker">
        <div {...api.getControlProps()}>
          <input {...api.getInputProps()} />
          <button {...api.getTriggerProps()}>
            <BiCalendar />
          </button>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getViewProps({ view: "day" })}>
              <Header api={api} />
              <div style={{ display: "flex", gap: "40px" }}>
                <CalendarGrid api={api} />
                <CalendarGrid offset={{ months: 1 }} api={api} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

/////////////////////////////////////////////////////////////////////////////

interface CalendarGridProps {
  offset?: datePicker.DateDuration
  api: datePicker.Api
}

const CalendarGrid = (props: CalendarGridProps) => {
  const { offset: offsetDuration, api } = props

  const id = useId()

  const offset = offsetDuration ? api.getOffset(offsetDuration) : undefined
  const weeks = offset?.weeks ?? api.weeks
  const visibleRange = offset?.visibleRange

  return (
    <table {...api.getTableProps({ view: "day", id })}>
      <thead {...api.getTableHeaderProps()}>
        <tr {...api.getTableRowProps()}>
          {api.weekDays.map((day, i) => (
            <th scope="col" key={i} aria-label={day.long}>
              {day.narrow}
            </th>
          ))}
        </tr>
      </thead>
      <tbody {...api.getTableBodyProps({ view: "day" })}>
        {weeks.map((week, i) => (
          <tr key={i} {...api.getTableRowProps({ view: "day" })}>
            {week.map((value, i) => (
              <td
                key={i}
                {...api.getDayTableCellProps({ value, visibleRange })}
              >
                <div
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

/////////////////////////////////////////////////////////////////////////////

interface HeaderProps {
  api: datePicker.Api
}

const Header = (props: HeaderProps) => {
  const { api } = props
  return (
    <div {...api.getViewControlProps({ view: "year" })}>
      <button {...api.getPrevTriggerProps()}>
        <BiChevronLeft />
      </button>
      <div style={{ flex: 1, textAlign: "center" }}>
        {api.visibleRangeText.start} - {api.visibleRangeText.end}
      </div>
      <button {...api.getNextTriggerProps()}>
        <BiChevronRight />
      </button>
    </div>
  )
}
