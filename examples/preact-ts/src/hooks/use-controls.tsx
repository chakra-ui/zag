import { ControlRecord, deepGet, deepSet, getControlDefaults } from "@zag-js/shared"
import { useState } from "preact/hooks"

export function useControls<T extends ControlRecord>(config: T) {
  const [state, __setState] = useState(getControlDefaults(config))

  const setState = (key: string, value: any) => {
    __setState((s) => {
      const newState = structuredClone(s)
      deepSet(newState, key, value)
      return newState
    })
  }

  return {
    context: state,
    ui: () => (
      <div className="controls-container">
        {Object.keys(config).map((key) => {
          const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
          const value = deepGet(state, key)
          switch (type) {
            case "boolean":
              return (
                <div key={key} className="checkbox">
                  <input
                    data-testid={key}
                    id={label}
                    type="checkbox"
                    defaultChecked={value}
                    onChange={(e) => {
                      setState(key, e.currentTarget.checked)
                    }}
                  />
                  <label htmlFor={label}>{label}</label>
                </div>
              )
            case "string":
              return (
                <div key={key} className="text">
                  <label style={{ marginRight: "10px" }}>{label}</label>
                  <input
                    data-testid={key}
                    type="text"
                    placeholder={placeholder}
                    defaultValue={value}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setState(key, e.currentTarget.value)
                      }
                    }}
                  />
                </div>
              )
            case "select":
              return (
                <div key={key} className="text">
                  <label htmlFor={label} style={{ marginRight: "10px" }}>
                    {label}
                  </label>
                  <select
                    data-testid={key}
                    id={label}
                    defaultValue={value}
                    onChange={(e) => {
                      setState(key, e.currentTarget.value)
                    }}
                  >
                    <option>-----</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )
            case "number":
              return (
                <div key={key} className="text">
                  <label htmlFor={label} style={{ marginRight: "10px" }}>
                    {label}
                  </label>
                  <input
                    data-testid={key}
                    id={label}
                    type="number"
                    min={min}
                    max={max}
                    defaultValue={value}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseFloat(e.currentTarget.value)
                        setState(key, isNaN(val) ? 0 : val)
                      }
                    }}
                  />
                </div>
              )
          }
        })}
      </div>
    ),
  }
}
