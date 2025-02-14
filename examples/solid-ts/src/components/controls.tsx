import { deepGet } from "@zag-js/shared"
import { For, createMemo } from "solid-js"
import type { UseControlsReturn } from "~/hooks/use-controls"

export function Controls({ store }: { store: UseControlsReturn }) {
  const { config, state, setState } = store
  return (
    <div class="controls-container">
      <For each={Object.keys(store.config)}>
        {(key) => {
          const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
          const value = createMemo(() => deepGet(state(), key))
          switch (type) {
            case "boolean":
              return (
                <div class="checkbox">
                  <input
                    data-testid={key}
                    id={label}
                    type="checkbox"
                    checked={value()}
                    onChange={(e) => {
                      setState(key, e.currentTarget.checked)
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
                    value={value()}
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
                <div class="text">
                  <label for={label} style={{ "margin-right": "10px" }}>
                    {label}
                  </label>
                  <select
                    data-testid={key}
                    id={label}
                    value={value()}
                    onChange={(e) => {
                      setState(key, e.currentTarget.value)
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
                    value={value()}
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
        }}
      </For>
    </div>
  )
}
