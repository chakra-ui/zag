import type { RequestContext } from "brisa"
import { rerenderInAction } from "brisa/server"

export default function CounterServer({ initialValue = 0 }: { initialValue: number }, { store }: RequestContext) {
  if (!store.has("count")) store.set("count", initialValue)
  store.transferToClient(["count"])

  function increment() {
    store.set("count", store.get("count") + 1)
    rerenderInAction({ type: "targetComponent" })
  }

  function decrement() {
    store.set("count", store.get("count") - 1)
    rerenderInAction({ type: "targetComponent" })
  }

  return (
    <div class="counter">
      <div class="counter-container">
        <h2>Server counter</h2>
        <button class="increment-button" onClick={increment}></button>
        <div class="counter-value">{store.get("count")}</div>
        <button class="decrement-button" onClick={decrement}></button>
      </div>
    </div>
  )
}
