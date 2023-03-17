```jsx
function Test() {
  const [state, send] = useMachine(
    machine({
      focusedValue: parseDate("04 May 2021"),
      selectionMode: "range",
      startOfWeek: 1,
      value: [today(), today().add({ month: 2 })],
      onChangeStart({ value }) {},
      onChangeEnd({ value }) {},
      onChange({ value }) {},
    }),
  )

  const api = connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <div {...api.controlProps}>
        <input {...api.inputProps} />
        <button {...api.triggerProps}>Toggle</button>
      </div>

      <div {...api.positionerProps}>
        <div {...api.contentProps}>
          {api.calendars.map((calendar) => (
            <div {...api.getCalendarProps({ value: calendar })}>
              <div>
                <div {...api.getHeaderProps({ view: "day" })}>
                  <select {...api.getMonthSelectProps()}>
                    {api.getMonths().map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select {...api.getYearSelectProps()}>
                    {api.getYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  {calendar.weekdays.map((weekday) => (
                    <span>{weekday}</span>
                  ))}
                </div>
              </div>

              <div {...api.getGridProps({ view: "day" })}>
                {calendar.weeks.map((week, index) => (
                  <div key={index}>
                    {week.map((day) => (
                      <button {...api.getDayTriggerProps({ value: day })}>{day}</button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```
