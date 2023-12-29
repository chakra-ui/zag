import { h, Fragment, ref, inject, provide, unref } from "vue"
import type { Ref } from "vue"
import { getControlDefaults, type ControlRecord, type ControlValue, deepGet, deepSet } from "@zag-js/shared"

const ControlsSymbol = Symbol("use-controls")

export function useControls<T extends ControlRecord>(config: T) {
  const state = ref<any>(getControlDefaults(config))

  provide(ControlsSymbol, state)

  function useControlsState() {
    return inject<Ref<ControlValue<T>>>(ControlsSymbol)!
  }

  const setState = (key: string, value: any) => {
    const newState = unref(state)
    deepSet(newState, key, value)
    state.value = newState
  }

  return {
    context: state,
    useControlsState,
    ui: () => {
      const state = useControlsState()
      return (
        <div class="controls-container">
          {Object.keys(config).map((key: string) => {
            const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
            const value = deepGet(state.value, key)
            switch (type) {
              case "boolean":
                return (
                  <div key={key} class="checkbox">
                    <input
                      data-testid={key}
                      id={label}
                      type="checkbox"
                      checked={value}
                      onInput={(e) => {
                        setState(key, (e.target as HTMLInputElement).checked)
                      }}
                    />
                    <label for={label}>{label}</label>
                  </div>
                )
              case "string":
                return (
                  <div key={key} class="text">
                    <label style={{ marginRight: "10px" }}>{label}</label>
                    <input
                      data-testid={key}
                      type="text"
                      placeholder={placeholder}
                      value={value}
                      onKeydown={(event) => {
                        if (event.key === "Enter") {
                          setState(key, (event.target as HTMLInputElement).value)
                        }
                      }}
                    />
                  </div>
                )
              case "select":
                return (
                  <div key={key} class="text">
                    <label for={label} style={{ marginRight: "10px" }}>
                      {label}
                    </label>
                    <select
                      data-testid={key}
                      id={label}
                      value={value}
                      onChange={(e) => {
                        setState(key, (e.target as HTMLInputElement).value)
                      }}
                    >
                      <option>-----</option>
                      {options.map((option: any) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              case "number":
                return (
                  <div key={key} class="text">
                    <label for={label} style={{ marginRight: "10px" }}>
                      {label}
                    </label>
                    <input
                      data-testid={key}
                      id={label}
                      type="number"
                      min={min}
                      max={max}
                      value={value}
                      onKeydown={(e) => {
                        if (e.key === "Enter") {
                          const val = parseFloat((e.target as HTMLInputElement).value)
                          setState(key, isNaN(val) ? 0 : val)
                        }
                      }}
                    />
                  </div>
                )
            }
          })}
        </div>
      )
    },
  }
}
