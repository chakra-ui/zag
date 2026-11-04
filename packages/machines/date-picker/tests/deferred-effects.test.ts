// @vitest-environment jsdom
import { VanillaMachine } from "@zag-js/vanilla"
import { describe, expect, test } from "vitest"
import { machine } from "../src"

async function tick() {
  await Promise.resolve()
  await Promise.resolve()
}

describe("date picker with deferred tracked effects", () => {
  test("text committed in the start input is not written into the end input", async () => {
    document.body.innerHTML = `
      <div id="datepicker:dp:control">
        <input data-part="input" />
        <input data-part="input" />
      </div>`
    const [start, end] = Array.from(document.querySelectorAll<HTMLInputElement>("input"))

    const service = new VanillaMachine(machine, {
      id: "dp",
      selectionMode: "range",
    })
    service.start()

    // Hold back tracked effects, as frameworks with after-frame scheduling do.
    const internals = service as any
    const run = internals.callTrackers
    internals.callTrackers = () => {}

    service.send({ type: "INPUT.FOCUS", index: 0 })
    await tick()
    service.send({ type: "INPUT.CHANGE", index: 0, value: "1/15/2024" })
    await tick()
    service.send({ type: "INPUT.ENTER", index: 0, value: "1/15/2024" })
    await tick()
    service.send({ type: "INPUT.FOCUS", index: 1 })
    await tick()

    run()
    await tick()

    expect(start.value).toBe("01/15/2024")
    expect(end.value).toBe("")
    service.stop()
  })
})
