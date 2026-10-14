import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/svelte"

/** The infinite-scroll machine; pass `$props.id()` as the id. Returns an accessor for the connected api. */
export function useInfiniteScroll(props: () => infiniteScroll.Props) {
  const service = useMachine(infiniteScroll.machine, props)
  const api = $derived(infiniteScroll.connect(service, normalizeProps))
  return () => api
}
