///<reference path="../../type.d.ts"/>
import {
  computed,
  h,
  Fragment,
  ComputedRef,
  ref,
  reactive,
  watch,
  inject,
  InjectionKey,
  defineComponent,
  provide,
  PropType,
} from "vue"

type Prop =
  | { type: "boolean"; label: string; defaultValue: boolean }
  | { type: "string"; label: string; defaultValue: string; placeholder?: string }
  | { type: "select"; options: readonly string[]; defaultValue: string; label: string }
  | { type: "multiselect"; options: readonly string[]; defaultValue: string[]; label: string }
  | { type: "number"; label: string; defaultValue: number; min?: number; max?: number }

type ControlRecord = Record<string, Prop>

type Value<T extends ControlRecord> = {
  [K in keyof T]: T[K] extends { type: "boolean" }
    ? boolean
    : T[K] extends { type: "string" }
    ? string
    : T[K] extends { type: "select" }
    ? T[K]["options"][number]
    : T[K] extends { type: "multiselect" }
    ? T[K]["options"][number][]
    : T[K] extends { type: "number" }
    ? number
    : never
}

export const PropertyControlsInjectionSymbol = Symbol("ChakraPropertyControlsState")

function getDefaultValues<T extends ControlRecord>(obj: T) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as Value<T>,
  )
}

export function useControls<T extends ControlRecord>(config: T) {
  const defaults = getDefaultValues(config)
  const state = ref(defaults)

  function updateState(val: Value<T>) {
    state.value = val
  }

  provide(PropertyControlsInjectionSymbol, () => computed(() => state.value))

  function useControlsState() {
    const _state = inject<() => ComputedRef<Value<T>>>(PropertyControlsInjectionSymbol)
    return {
      state: _state?.()!,
      updateState,
    }
  }

  return {
    context: state,
    useControlsState,
    ui: () => {
      const { updateState, state: __state } = useControlsState()
      const state = computed({
        get() {
          return __state.value
        },
        set<U extends Value<T>>(val: U) {
          updateState(val)
        },
      })

      return (
        <div
          style={{
            display: "inline-flex",
            gap: "24px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid lightgray",
            background: "lightgray",
            margin: "24px",
          }}
        >
          {Object.keys(config).map((key: keyof typeof config) => {
            const { type, label, options, placeholder, min, max } = (config[key] ?? {}) as any
            switch (type) {
              case "boolean":
                return (
                  <div key={key}>
                    <input
                      data-testid={key}
                      id={label}
                      type="checkbox"
                      checked={state.value[key] as boolean}
                      onInput={(e) => {
                        state.value[key] = e.currentTarget.checked
                      }}
                    />
                    <label for={label}>{label}</label>
                  </div>
                )
              case "string":
                return (
                  <div key={key}>
                    <label style={{ marginRight: "10px" }}>{label}</label>
                    <input
                      data-testid={key}
                      type="text"
                      placeholder={placeholder}
                      value={state.value[key] as string}
                      //@ts-expect-error
                      onKeydown={(e) => {
                        if (e.key === "Enter") {
                          state.value[key] = (e.target as HTMLInputElement).value
                        }
                      }}
                    />
                  </div>
                )
              case "select":
                return (
                  <div key={key}>
                    <label for={label} style={{ marginRight: "10px" }}>
                      {label}
                    </label>
                    <select
                      data-testid={key}
                      id={label}
                      value={state.value[key] as string}
                      onChange={(e) => {
                        state.value[key] = (e.target as HTMLSelectElement).value
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
                  <div key={key}>
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
