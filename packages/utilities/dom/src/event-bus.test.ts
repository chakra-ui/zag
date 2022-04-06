import { addPointerEvent } from "./listener"
import { fireEvent } from "@testing-library/dom"
import { callAll } from "@zag-js/utils"

test("should add multiple listeners", () => {
  const called = { pointermove: 0, pointerup: 0 }

  function handlePointerMove() {
    called.pointermove++
  }

  function handlePointerUp() {
    called.pointerup++
  }

  const cleanup = callAll(
    addPointerEvent(document, "pointermove", handlePointerMove, false),
    addPointerEvent(document, "pointerup", handlePointerUp, false),
    addPointerEvent(document, "pointercancel", handlePointerUp, false),
    addPointerEvent(document, "contextmenu", handlePointerUp, false),
  )

  fireEvent(document, new MouseEvent("mousemove"))
  fireEvent(document, new MouseEvent("mouseup"))
  fireEvent(document, new MouseEvent("contextmenu"))

  cleanup()

  fireEvent(document, new MouseEvent("mouseup"))

  expect(called).toMatchObject({
    pointermove: 1,
    pointerup: 2,
  })
})
