import { For } from "solid-js"
import { createMutable } from "solid-js/store"
import { ControlRecord, ControlValue } from "@zag-js/shared"

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
      <div class="controls-container">
        <For each={Object.keys(config)}>
          {(key) => {
            const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
            switch (type) {
              case "boolean":
                return (
                  <div class="checkbox">
                    <input
                      data-testid={key}
                      id={label}
                      type="checkbox"
                      checked={state[key] as boolean}
                      onChange={(e) => {
                        state[key] = e.currentTarget.checked
                      }}
                    />
                    <label for={label}>{label}</label>
                  </div>
                )
              case "string":
                return (
                  <div class="text">
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
                  <div class="text">
                    <label for={label} style={{ "margin-right": "10px" }}>
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
                  <div class="text">
                    <label for={label} style={{ "margin-right": "10px" }}>
                      {label}
                    </label>
                    <input
                      data-testid={key}
                      id={label}
                      type="number"
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
    ),
  }
}
