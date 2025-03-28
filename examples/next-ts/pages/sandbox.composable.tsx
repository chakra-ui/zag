import { Bindable, BindableFn, BindableParams } from "@zag-js/core"
import { useMachine } from "@zag-js/react"
import { isFunction } from "@zag-js/utils"

interface ValidateParams<T> {
  validate?: (b: T) => boolean
  defaultValid?: boolean
  onValidityChange?: (props: { valid: boolean; lastValid: T }) => void
}

function withLastValid<T>(bindable: BindableFn, props: () => BindableParams<T> & ValidateParams<T>): Bindable<T> {
  const value = bindable(props)

  const lastValidValue = bindable(() => ({
    defaultValue: props().validate?.(value.get()) ? value.get() : undefined,
  }))

  const valid = bindable<boolean>(() => ({
    defaultValue: props().defaultValid,
    onChange(valid) {
      props().onValidityChange?.({ valid, lastValid: lastValidValue.get() })
    },
  }))

  return {
    ...value,
    set(valueOrFn) {
      const nextValue = isFunction(valueOrFn) ? valueOrFn(value.get()) : valueOrFn
      if (props().validate?.(nextValue)) {
        lastValidValue.set(nextValue)
        valid.set(true)
      } else {
        valid.set(false)
      }
      value.set(nextValue)
    },
  }
}

function withAutoreset<T>(bindable: BindableFn, props: () => BindableParams<T> & { resetAfter: number }): Bindable<T> {
  const value = bindable(props)

  const timer = bindable.ref<NodeJS.Timeout | undefined>(undefined)

  const resetValue = () =>
    setTimeout(() => {
      value.set(value.initial)
    }, props().resetAfter)

  bindable.cleanup(() => {
    if (timer.get()) clearTimeout(timer.get()!)
    timer.set(undefined)
  })

  return {
    ...value,
    set(valueOrFn) {
      value.set(valueOrFn)
      const currentTimer = timer.get()
      if (currentTimer) clearTimeout(currentTimer)
      timer.set(resetValue())
    },
  }
}

export default function Page() {
  const service = useMachine({
    initialState() {
      return "idle"
    },

    context({ bindable }) {
      return {
        count: withLastValid<string>(bindable, () => ({
          defaultValue: "hello",
          validate(value) {
            return value.length > 3
          },
          onValidityChange(valid) {
            console.log("valid", valid)
          },
        })),
        index: withAutoreset<number>(bindable, () => ({
          defaultValue: 0,
          resetAfter: 1000,
        })),
      }
    },

    states: {
      idle: {
        on: {
          CLICK: { target: "active" },
        },
      },
    },
  })
  return (
    <main>
      <div>{service.context.get("count")}</div>
      <button onClick={() => service.context.set("count", "df")}>Click</button>
      <hr />
      <div>{service.context.get("index")}</div>
      <button onClick={() => service.context.set("index", (prev) => prev + 1)}>Click</button>
    </main>
  )
}
