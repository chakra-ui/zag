import * as infiniteScroll from "@zag-js/infinite-scroll"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

/** The infinite-scroll machine with its own id; returns the connected api. */
export function useInfiniteScroll(props: Omit<infiniteScroll.Props, "id">) {
  const service = useMachine(infiniteScroll.machine, { id: useId(), ...props })
  return infiniteScroll.connect(service, normalizeProps)
}
