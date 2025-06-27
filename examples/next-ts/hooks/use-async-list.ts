import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/react"

export function useAsyncList<T, C = string>(props: asyncList.Props<T, C>) {
  const service = useMachine(asyncList.machine as asyncList.Machine<T, C>, props)
  return asyncList.connect(service)
}
