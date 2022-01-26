import { createMutable } from "solid-js/store"
import { For } from "solid-js"
import { ControlRecord, ControlValue } from "@ui-machines/types"

function getDefaultValues<T extends ControlRecord>(obj: T): ControlValue<T> {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as ControlValue<T>,
  )
}

export function useControls<T extends ControlRecord>(config: T) {
  const state = createMutable(getDefaultValues(config) as any)

  return {
    context: state,
    ui: () => (
      <div
        style={{
          display: "inline-block",
          background: "lightgray",
          padding: "12px",
          "border-radius": "8px",
          border: "1px solid lightgray",
          margin: "24px 0",
        }}
      >
        <p style={{ "font-size": "small", all: "unset", display: "block", "margin-bottom": "12px" }}>
          Property controls
        </p>
        <div style={{ display: "inline-flex", gap: "24px" }}>
          <For each={Object.keys(config)}>
            {(key) => {
              const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
              switch (type) {
                case "boolean":
                  return (
                    <div>
                      <input
                        data-testid={key}
                        id={label}
                        type="checkbox"
                        checked={state[key] as boolean}
                        onChange={(e) => {
                          state[key] = e.currentTarget.checked
                        }}
                      />
                      <label htmlFor={label}>{label}</label>
                    </div>
                  )
                case "string":
                  return (
                    <div>
                      <label style={{ "margin-right": "10px" }}>{label}</label>
                      <input
                        data-testid={key}
                        type="text"
                        placeholder={placeholder}
                        value={state[key] as string}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            state[key] = e.currentTarget.value
                          }
                        }}
                      />
                    </div>
                  )
                case "select":
                  return (
                    <div>
                      <label htmlFor={label} style={{ "margin-right": "10px" }}>
                        {label}
                      </label>
                      <select
                        data-testid={key}
                        id={label}
                        value={state[key] as string}
                        onChange={(e) => {
                          state[key] = e.currentTarget.value
                        }}
                      >
                        <option>-----</option>
                        <For each={options as any[]}>{(option) => <option value={option}>{option}</option>}</For>
                      </select>
                    </div>
                  )
                case "number":
                  return (
                    <div>
                      <label htmlFor={label} style={{ "margin-right": "10px" }}>
                        {label}
                      </label>
                      <input
                        data-testid={key}
                        id={label}
                        type="number"
                        style={{ "max-width": "5ch" }}
                        min={min}
                        max={max}
                        value={state[key] as number}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = parseFloat(e.currentTarget.value)
                            if (!isNaN(val)) {
                              state[key] = val
                            }
                          }
                        }}
                      />
                    </div>
                  )
              }
            }}
          </For>
        </div>
      </div>
    ),
  }
}
