import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, type Accessor } from "solid-js"

/** The infinite-scroll machine with its own id; returns the connected api. */
export function useInfiniteScroll(props: Accessor<Omit<infiniteScroll.Props, "id">>) {
  const id = createUniqueId()
  const service = useMachine(infiniteScroll.machine, () => ({ id, ...props() }))
  return createMemo(() => infiniteScroll.connect(service, normalizeProps))
}
