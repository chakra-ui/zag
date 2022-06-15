import { h, Fragment, Ref, ref, inject, provide } from "vue"
import { ControlRecord, ControlValue } from "@zag-js/types"
import { controlsContainerStyle } from "@zag-js/shared"

const ControlsSymbol = Symbol("use-controls")

function getDefaultValues<T extends ControlRecord>(obj: T) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as ControlValue<T>,
  )
}

export function useControls<T extends ControlRecord>(config: T) {
  const defaults = getDefaultValues(config)
  const state = ref(defaults)

  provide(ControlsSymbol, state)

  function useControlsState() {
    return inject<Ref<ControlValue<T>>>(ControlsSymbol)!
  }

  return {
    context: state,
    useControlsState,
    ui: () => {
      const state = useControlsState()
      return (
        <div class={controlsContainerStyle}>
          {Object.keys(config).map((key: keyof ControlValue<T>) => {
            const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
            switch (type) {
              case "boolean":
                return (
                  <div key={key} class="checkbox">
                    <input
                      data-testid={key}
                      id={label}
                      type="checkbox"
                      checked={state.value[key] as boolean}
                      onInput={(e) => {
                        //@ts-expect-error
                        state.value[key] = e.currentTarget.checked
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
                      value={state.value[key] as string}
                      onKeydown={(event) => {
                        if (event.key === "Enter") {
                          //@ts-expect-error
                          state.value[key] = (event.target as HTMLInputElement).value
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
                      value={state.value[key] as string}
                      onChange={(e) => {
                        //@ts-expect-error
                        state.value[key] = (e.target as HTMLSelectElement).value
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
                      value={state.value[key] as number}
                      onKeydown={(e) => {
                        if (e.key === "Enter") {
                          //@ts-expect-error
                          state.value[key] = (e.target as HTMLInputElement).valueAsNumber
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
