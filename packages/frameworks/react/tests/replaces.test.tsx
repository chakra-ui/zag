import { act } from "@testing-library/react"
import { createMachine } from "@zag-js/core"
import { renderMachine } from "./render"

// mirrors the shape every `setOpen` machine uses: OPEN only in `closed`, CLOSE only in `open`
const toggleMachine = (onOpenChange: (open: boolean) => void) =>
  createMachine<any>({
    initialState() {
      return "closed"
    },
    states: {
      closed: {
        on: { OPEN: { target: "open", actions: ["invokeOnOpen"] } },
      },
      open: {
        on: { CLOSE: { target: "closed", actions: ["invokeOnClose"] } },
      },
    },
    implementations: {
      actions: {
        invokeOnOpen: () => onOpenChange(true),
        invokeOnClose: () => onOpenChange(false),
      },
    },
  })

describe("replaces", () => {
  test("a later event in the same tick replaces an earlier one", async () => {
    const onOpenChange = vi.fn()
    const { result } = renderMachine(toggleMachine(onOpenChange))

    // the shape that used to leave the component open
    await act(async () => {
      result.current.send({ type: "OPEN", replaces: "open" })
      result.current.send({ type: "CLOSE", replaces: "open" })
    })

    expect(result.current.state.get()).toBe("closed")
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test("repeating the same event in a tick runs it once", async () => {
    const onOpenChange = vi.fn()
    const { result } = renderMachine(toggleMachine(onOpenChange))

    await act(async () => {
      for (let i = 0; i < 5; i++) result.current.send({ type: "OPEN", replaces: "open" })
    })

    expect(result.current.state.get()).toBe("open")
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  test("events in separate ticks are all delivered", async () => {
    const onOpenChange = vi.fn()
    const { result } = renderMachine(toggleMachine(onOpenChange))

    await act(async () => result.current.send({ type: "OPEN", replaces: "open" }))
    await act(async () => result.current.send({ type: "CLOSE", replaces: "open" }))

    expect(result.current.state.get()).toBe("closed")
    expect(onOpenChange.mock.calls.flat()).toEqual([true, false])
  })

  test("different keys do not replace each other", async () => {
    const onOpenChange = vi.fn()
    const { result } = renderMachine(toggleMachine(onOpenChange))

    await act(async () => {
      result.current.send({ type: "OPEN", replaces: "open" })
      result.current.send({ type: "NOOP", replaces: "other" })
    })

    expect(result.current.state.get()).toBe("open")
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  test("untagged events are never replaced", async () => {
    const onOpenChange = vi.fn()
    const { result } = renderMachine(toggleMachine(onOpenChange))

    // internal sends (escape, interact-outside) carry no `replaces` key
    await act(async () => {
      result.current.send({ type: "OPEN" })
      result.current.send({ type: "CLOSE" })
    })

    expect(result.current.state.get()).toBe("closed")
    expect(onOpenChange.mock.calls.flat()).toEqual([true, false])
  })
})
