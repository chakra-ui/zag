```jsx
function Test() {
  const [state, send] = useMachine(
    machine({
      focusedValue: parseDate("04 May 2021"),
      selectionMode: "range",
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
          {api.view === "day" &&
            api.calendars.map((calendar) => (
              <div {...api.getCalendarProps({ value: calendar })}>
                <div>
                  <div {...api.getHeaderProps({ view: "day" })}>
                    <button {...api.getPrevTriggerProps({ view: "day" })}>Prev</button>
                    <button {...api.viewChangeTriggerProps}>
                      {calendar.month} {calendar.year}
                    </button>
                    <button {...api.getNextTriggerProps({ view: "day" })}>Next</button>
                  </div>
                </div>

                <div {...api.getGridProps({ view: "day" })}>
                  <div>
                    {calendar.weekdays.map((weekday) => (
                      <span>{weekday}</span>
                    ))}
                  </div>
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

          {api.view === "month" && (
            <div>
              <div {...api.getHeaderProps({ view: "month" })}>
                <button {...api.getPrevTriggerProps({ view: "month" })}>Prev</button>
                <button {...api.viewChangeTriggerProps}>{calendar.year}</button>
                <button {...api.getNextTriggerProps({ view: "month" })}>Next</button>
              </div>

              <div {...api.getGridProps({ view: "month", columns: 3 })}>
                {api.getMonths({ columns: 3 }).map((months) => (
                  <div>
                    {months.map((month) => (
                      <button {...api.getMonthTriggerProps({ value: month })}>{month}</button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {api.view === "year" && (
            <div>
              <div {...api.getHeaderProps({ view: "year" })}>
                <button {...api.getPrevTriggerProps({ view: "year" })}>Prev</button>
                <button {...api.viewChangeTriggerProps}>{calendar.year}</button>
                <button {...api.getNextTriggerProps({ view: "year" })}>Next</button>
              </div>

              <div {...api.getGridProps({ view: "year", columns: 3 })}>
                {api.getYears({ columns: 3 }).map((years) => (
                  <div>
                    {years.map((year) => (
                      <button {...api.getYearTriggerProps({ value: year })}>{year}</button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  )
}
```
