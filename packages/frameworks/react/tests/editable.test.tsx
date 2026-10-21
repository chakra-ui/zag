import { machine } from "../../../machines/editable/src/editable.machine"
import { renderMachine } from "./render"

describe("editable cancel", () => {
  test("restores defaultValue when mounted in edit mode", async () => {
    const { result, send } = renderMachine(machine, { id: "1", defaultValue: "Segment", defaultEdit: true })
    expect(result.current.state.get()).toBe("edit")

    await send({ type: "VALUE.SET", value: "Changed" })
    await send({ type: "CANCEL" })

    expect(result.current.state.get()).toBe("preview")
    expect(result.current.context.get("value")).toBe("Segment")
  })
})
