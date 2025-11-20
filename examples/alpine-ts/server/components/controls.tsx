import { deepGet, type ControlRecord, type ControlValue } from "@zag-js/shared"

interface ControlsProps<T extends ControlRecord> {
  config: T
  state: ControlValue<T>
}

export function Controls<T extends ControlRecord>({ config, state }: ControlsProps<T>) {
  return (
    <div class="controls-container">
      {Object.keys(config).map((key) => {
        const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
        const value = deepGet(state, key)
        switch (type) {
          case "boolean":
            return (
              <div class="checkbox">
                <input data-testid={key} id={label} type="checkbox" checked={value} x-model={key} />
                <label for={label}>{label}</label>
              </div>
            )
          case "string":
            return (
              <div class="text">
                <label style={{ marginRight: "10px" }}>{label}</label>
                <input data-testid={key} type="text" placeholder={placeholder} value={value} x-model={key} />
              </div>
            )
          case "select":
            return (
              <div class="text">
                <label for={label} style={{ marginRight: "10px" }}>
                  {label}
                </label>
                <select data-testid={key} id={label} value={value} x-model={key}>
                  <option>-----</option>
                  {options.map((option: string) => (
                    <option value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )
          case "number":
            return (
              <div class="text">
                <label for={label} style={{ marginRight: "10px" }}>
                  {label}
                </label>
                <input data-testid={key} id={label} type="number" min={min} max={max} value={value} x-model={key} />
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
