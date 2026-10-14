import { computed, onMounted, ref, toValue, type MaybeRefOrGetter } from "vue"

export interface UsePersistentMapStateProps<T> {
  storageKey: string
  key: MaybeRefOrGetter<string>
  defaultValue: T
}

export function usePersistentMapState<T>(props: UsePersistentMapStateProps<T>) {
  const { storageKey, key, defaultValue } = props

  const map = ref({}) as { value: Record<string, T> }
  const hydrated = ref(false)

  onMounted(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw != null) map.value = JSON.parse(raw)
    } catch {
      // Ignore access errors in restricted environments
    } finally {
      hydrated.value = true
    }
  })

  const value = computed(() => map.value[toValue(key)] ?? defaultValue)

  // No-op before hydration so mount-time callbacks can't overwrite persisted state
  const setValue = (next: T) => {
    if (!hydrated.value) return
    map.value = { ...map.value, [toValue(key)]: next }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(map.value))
    } catch {
      // Ignore access errors in restricted environments
    }
  }

  return { value, setValue, hydrated }
}
