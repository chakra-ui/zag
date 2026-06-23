import * as asyncList from "@zag-js/async-list"
import Alpine from "alpinejs"
import { AlpineMachine } from "../lib/machine"

export function useAsyncList<T, C = string>(props: asyncList.Props<T, C>) {
  const machine = new AlpineMachine(asyncList.machine as asyncList.Machine<T, C>, { value: props })
  const api = Alpine.reactive({ value: asyncList.connect(machine.service) })
  machine.init()
  Alpine.effect(() => {
    api.value = asyncList.connect(machine.service)
  })
  return api
}
