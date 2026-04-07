import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/react"

export function useAsyncList<Item, Filter = string, Sorting = undefined, Cursor = string>(
  props: asyncList.Props<Item, Filter, Sorting, Cursor>,
) {
  const service = useMachine(asyncList.machine as asyncList.Machine<Item, Filter, Sorting, Cursor>, props)
  return asyncList.connect(service)
}
