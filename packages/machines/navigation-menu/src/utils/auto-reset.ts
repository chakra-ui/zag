import type { Bindable, BindableFn, BindableParams } from "@zag-js/core"

export function autoReset<T>(
  bindable: BindableFn,
  props: () => BindableParams<T> & { resetAfter: number },
): Bindable<T> {
  const value = bindable(props)

  const timer = bindable.ref<NodeJS.Timeout | undefined>(undefined)

  const resetValue = () =>
    setTimeout(() => {
      value.set(value.initial as T)
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
