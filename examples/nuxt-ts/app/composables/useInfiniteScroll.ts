import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, toValue, type MaybeRefOrGetter } from "vue"

/** The infinite-scroll machine with its own id; returns the connected api. */
export function useInfiniteScroll(props: MaybeRefOrGetter<Omit<infiniteScroll.Props, "id">>) {
  const id = useId()
  const service = useMachine(
    infiniteScroll.machine,
    computed(() => ({ id, ...toValue(props) })),
  )
  return computed(() => infiniteScroll.connect(service, normalizeProps))
}
