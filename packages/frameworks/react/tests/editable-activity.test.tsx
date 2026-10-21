import { act, render } from "@testing-library/react"
import { machine as editableMachine } from "../../../machines/editable/src/editable.machine"
import { Activity } from "react"
import { useMachine } from "../src"

interface EditableHandle {
  send: (event: { type: string; value?: string }) => void
  getValue: () => string
  getPreviousValue: () => string
  getState: () => string
}

function EditableRig({
  handle,
  ...props
}: {
  handle: { current: EditableHandle | null }
  defaultValue?: string
  defaultEdit?: boolean
  value?: string
}) {
  const service = useMachine(editableMachine, { id: "activity-editable", ...props })
  handle.current = {
    send: (event) => service.send(event as any),
    getValue: () => service.context.get("value") as string,
    getPreviousValue: () => service.context.get("previousValue") as string,
    getState: () => service.state.get() as string,
  }
  return (
    <>
      <input id="editable:activity-editable:input" />
      <button id="editable:activity-editable:edit" type="button" />
      <button id="editable:activity-editable:cancel" type="button" />
    </>
  )
}

function renderEditableInActivity(props: { defaultValue?: string; defaultEdit?: boolean; value?: string }) {
  const handle: { current: EditableHandle | null } = { current: null }
  const utils = render(
    <Activity mode="visible">
      <EditableRig handle={handle} {...props} />
    </Activity>,
  )
  const update = (mode: "visible" | "hidden") =>
    utils.rerender(
      <Activity mode={mode}>
        <EditableRig handle={handle} {...props} />
      </Activity>,
    )
  return { handle, update }
}

async function flush() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe("editable machine with React Activity", () => {
  test("hide/show during edit does not overwrite previousValue before cancel", async () => {
    const { handle, update } = renderEditableInActivity({ defaultValue: "Original" })
    await flush()

    await act(() => handle.current?.send({ type: "EDIT" }))
    expect(handle.current?.getState()).toBe("edit")

    await act(() => handle.current?.send({ type: "VALUE.SET", value: "Changed" }))
    expect(handle.current?.getValue()).toBe("Changed")
    expect(handle.current?.getPreviousValue()).toBe("Original")

    await act(() => update("hidden"))
    await act(() => update("visible"))
    await flush()

    expect(handle.current?.getPreviousValue()).toBe("Original")

    await act(() => handle.current?.send({ type: "CANCEL" }))
    expect(handle.current?.getState()).toBe("preview")
    expect(handle.current?.getValue()).toBe("Original")
  })

  test("initial previousValue matches empty defaultValue", async () => {
    const { handle } = renderEditableInActivity({ defaultValue: "" })
    await flush()

    await act(() => handle.current?.send({ type: "EDIT" }))
    await act(() => handle.current?.send({ type: "VALUE.SET", value: "x" }))
    await act(() => handle.current?.send({ type: "CANCEL" }))

    expect(handle.current?.getValue()).toBe("")
  })

  test("initial previousValue matches defaultEdit mount value", async () => {
    const { handle } = renderEditableInActivity({ defaultValue: "Segment", defaultEdit: true })
    await flush()

    expect(handle.current?.getState()).toBe("edit")
    expect(handle.current?.getPreviousValue()).toBe("Segment")

    await act(() => handle.current?.send({ type: "VALUE.SET", value: "Changed" }))
    await act(() => handle.current?.send({ type: "CANCEL" }))

    expect(handle.current?.getValue()).toBe("Segment")
  })

  test("controlled value prop initializes previousValue", async () => {
    const { handle } = renderEditableInActivity({ value: "Controlled", defaultValue: "Segment" })
    await flush()

    expect(handle.current?.getValue()).toBe("Controlled")
    expect(handle.current?.getPreviousValue()).toBe("Controlled")

    await act(() => handle.current?.send({ type: "EDIT" }))
    await act(() => handle.current?.send({ type: "VALUE.SET", value: "Draft" }))
    await act(() => handle.current?.send({ type: "CANCEL" }))

    expect(handle.current?.getValue()).toBe("Controlled")
  })
})
