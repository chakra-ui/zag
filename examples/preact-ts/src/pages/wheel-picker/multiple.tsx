import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useMemo } from "react"
const numbers = (length: number, add = 0) =>
  wheelPicker.collection({
    items: Array.from({ length }, (_, i) => ({ label: String(i + add).padStart(2, "0"), value: String(i + add) })),
  })
const hour = numbers(12, 1),
  minute = numbers(60),
  period = wheelPicker.collection({ items: ["AM", "PM"].map((value) => ({ label: value, value })) })
export default function Page() {
  const id = useId()
  const hourProps = useMemo(() => ({ id: `${id}:hour`, collection: hour, defaultValue: "9", infinite: true }), [id])
  const minuteProps = useMemo(
    () => ({ id: `${id}:minute`, collection: minute, defaultValue: "41", infinite: true }),
    [id],
  )
  const periodProps = useMemo(() => ({ id: `${id}:period`, collection: period, defaultValue: "AM" }), [id])
  const hourService = useMachine(wheelPicker.machine, hourProps)
  const minuteService = useMachine(wheelPicker.machine, minuteProps)
  const periodService = useMachine(wheelPicker.machine, periodProps)
  const pickers = [
    { label: "Hour", collection: hour, api: wheelPicker.connect(hourService, normalizeProps) },
    { label: "Minute", collection: minute, api: wheelPicker.connect(minuteService, normalizeProps) },
    { label: "Meridiem", collection: period, api: wheelPicker.connect(periodService, normalizeProps) },
  ]
  return (
    <>
      <main className="wheel-picker">
        <div className="wheel-picker-group" role="group" aria-label="Time">
          {pickers.map(({ api, collection, label }) => (
            <div key={label} {...api.getRootProps()}>
              <label className="sr-only" {...api.getLabelProps()}>
                {label}
              </label>
              <div {...api.getControlProps()}>
                <div {...api.getViewportProps()}>
                  <ul {...api.getItemGroupProps()}>
                    {api.items.map(({ item, index, key }) => (
                      <li key={key} {...api.getItemProps({ item, index })}>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                  <div {...api.getHighlightProps()}>
                    <ul {...api.getHighlightItemGroupProps()}>
                      {api.highlightItems.map(({ item, index, key }) => (
                        <li key={key} {...api.getHighlightItemProps({ item, index })}>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <select {...api.getHiddenSelectProps()}>
                {collection.items.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <output data-testid="value">Selected time: {pickers.map(({ api }) => api.valueAsString).join(":")}</output>
      </main>
    </>
  )
}
