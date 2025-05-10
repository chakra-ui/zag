import { deepGet } from "@zag-js/shared"
import { For, Show, createMemo } from "solid-js"
import type { UseControlsReturn } from "~/hooks/use-controls"

export function Controls({ store }: { store: UseControlsReturn }) {
  const { config, state, setState } = store
  const items = createMemo(() => {
    const keys = Object.keys(store.config)
    return keys.map((key) => {
      const { type, label = key, options, placeholder, min, max, forceValue } = (config[key] ?? {}) as any
      const value = createMemo(() => deepGet(state(), key))
      return { key, type, label, options, placeholder, min, max, value, forceValue }
    })
  })

  return (
    <div class="controls-container">
      <For each={items()}>
        {(item) => {
          switch (item.type) {
            case "boolean":
              return (
                <div class="checkbox">
                  <input
                    data-testid={item.key}
                    id={item.label}
                    type="checkbox"
                    checked={item.value()}
                    onChange={(e) => {
                      setState(item.key, e.currentTarget.checked)
                    }}
                  />
                  <label for={item.label}>{item.label}</label>
                </div>
              )
            case "string":
              return (
                <div class="text">
                  <label style={{ "margin-right": "10px" }}>{item.label}</label>
                  <input
                    data-testid={item.key}
                    type="text"
                    placeholder={item.placeholder}
                    value={item.value()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setState(item.key, e.currentTarget.value)
                      }
                    }}
                  />
                </div>
              )
            case "select":
              return (
                <div class="text">
                  <label for={item.label} style={{ "margin-right": "10px" }}>
                    {item.label}
                  </label>
                  <select
                    data-testid={item.key}
                    id={item.label}
                    value={item.value()}
                    onChange={(e) => {
                      setState(item.key, e.currentTarget.value)
                    }}
                  >
                    <Show when={!item.forceValue}>
                      <option>-----</option>
                    </Show>
                    <For each={item.options as any[]}>{(option) => <option value={option}>{option}</option>}</For>
                  </select>
                </div>
              )
            case "number":
              return (
                <div class="text">
                  <label for={item.label} style={{ "margin-right": "10px" }}>
                    {item.label}
                  </label>
                  <input
                    data-testid={item.key}
                    id={item.label}
                    type="number"
                    min={item.min}
                    max={item.max}
                    value={item.value()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseFloat(e.currentTarget.value)
                        setState(item.key, isNaN(val) ? 0 : val)
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
