import { getPlacement, getPlacementStyles } from "@zag-js/popper"
import { createSignal, onSettled } from "solid-js"

export default function Page() {
  let referenceRef: HTMLButtonElement | undefined
  let floatingRef: HTMLDivElement | undefined
  const [positioned, setPositioned] = createSignal({})

  onSettled(() => {
    if (!referenceRef || !floatingRef) return
    const cleanup = getPlacement(referenceRef, floatingRef, {
      placement: "right-start",
      onComplete(data) {
        setPositioned(data)
      },
    })
    return () => cleanup?.()
  })

  const styles = () => getPlacementStyles(positioned())

  return (
    <div>
      <button ref={referenceRef}>Hello StackBlitz!</button>
      <div style={styles().floating} ref={floatingRef}>
        Start editing to see some magic happen :)
      </div>
    </div>
  )
}
