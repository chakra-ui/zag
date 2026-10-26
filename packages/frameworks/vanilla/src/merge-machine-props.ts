import { isPlainObject } from "@zag-js/utils"

const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyDescriptors } = Object

export function mergeMachineProps<T>(prev: T, next: Partial<T>): T {
  if (Object.is(prev, next)) return prev
  if (!isPlainObject(prev) || !isPlainObject(next)) {
    return next === undefined ? prev : (next as T)
  }

  let result: any = prev
  // Copy descriptors, not values, so getters stay live
  const set = (key: string, descriptor: PropertyDescriptor) => {
    if (result === prev) result = Object.defineProperties({}, getOwnPropertyDescriptors(prev))
    defineProperty(result, key, descriptor)
  }

  for (const [key, descriptor] of Object.entries(getOwnPropertyDescriptors(next))) {
    if (!descriptor.enumerable) continue
    if (descriptor.get) {
      set(key, descriptor)
      continue
    }

    const nextValue = descriptor.value
    if (nextValue === undefined) continue

    const prevIsGetter = !!getOwnPropertyDescriptor(prev, key)?.get
    const prevValue = (prev as any)[key]
    const value =
      isPlainObject(prevValue) && isPlainObject(nextValue) ? mergeMachineProps(prevValue, nextValue) : nextValue
    if (!prevIsGetter && Object.is(prevValue, value)) continue
    set(key, { value, writable: true, enumerable: true, configurable: true })
  }

  return result
}
