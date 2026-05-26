import { act, render } from "@testing-library/react"
import { createMachine, type Machine } from "@zag-js/core"
import { StrictMode, useImperativeHandle, useRef } from "react"
import { useMachine } from "../src"

interface TestHandle {
  send: (event: any) => void
  state: string
}

function TestRig({ machine, handle }: { machine: Machine<any>; handle: { current: TestHandle | null } }) {
  const service = useMachine<any>(machine)
  const ref = useRef<TestHandle | null>(null)
  useImperativeHandle<TestHandle | null, TestHandle>(ref, () => ({
    send: service.send,
    state: service.state.get() as string,
  }))
  // expose via the passed-in container so the test can reach it without a forwardRef chain
  handle.current = ref.current ?? {
    send: service.send,
    state: service.state.get() as string,
  }
  return null
}

function renderStrict(machine: Machine<any>) {
  const handle: { current: TestHandle | null } = { current: null }
  const utils = render(
    <StrictMode>
      <TestRig machine={machine} handle={handle} />
    </StrictMode>,
  )
  return { ...utils, handle }
}

async function flushMicrotasks() {
  // The machine startup is wrapped in queueMicrotask; a couple of awaited promises let
  // both Strict Mode mount passes finish booting.
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe("React Strict Mode", () => {
  test("entry-effect cleanups are composed, not overwritten, across the double mount", async () => {
    // Regression test for chakra-ui/chakra-ui#10793 — under React 19 Strict Mode the
    // mount → cleanup → mount cycle re-enters the initial state and runs entry effects
    // twice. The second cleanup must not clobber the first; otherwise resources captured
    // during the first mount (e.g. body styles, layer-stack entries) leak forever.
    const setupSpy = vi.fn()
    const cleanupSpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "open"
      },
      states: {
        open: {
          effects: ["track"],
          on: {
            CLOSE: { target: "closed" },
          },
        },
        closed: {},
      },
      implementations: {
        effects: {
          track() {
            setupSpy()
            return () => cleanupSpy()
          },
        },
      },
    })

    const { handle } = renderStrict(machine)
    await flushMicrotasks()

    // Strict Mode invokes the layout effect twice, so the entry effect runs twice.
    expect(setupSpy).toHaveBeenCalledTimes(2)
    expect(cleanupSpy).not.toHaveBeenCalled()

    await act(async () => handle.current!.send({ type: "CLOSE" }))
    await flushMicrotasks()

    // Every setup must have a matching cleanup. Before the fix, only the second cleanup
    // would fire because Map#set clobbered the first.
    expect(cleanupSpy).toHaveBeenCalledTimes(2)
  })

  test("mutations made by entry effects are fully reverted on close", async () => {
    // Mirrors the original chakra issue: dialog locks body scroll, then under Strict Mode
    // the body must be fully restored after the dialog closes.
    let lockCount = 0
    const ATTR = "data-test-lock"

    const machine = createMachine<any>({
      initialState() {
        return "open"
      },
      states: {
        open: {
          effects: ["lockScroll"],
          on: {
            CLOSE: { target: "closed" },
          },
        },
        closed: {},
      },
      implementations: {
        effects: {
          lockScroll() {
            lockCount++
            document.body.setAttribute(ATTR, "")
            return () => {
              lockCount--
              if (lockCount === 0) document.body.removeAttribute(ATTR)
            }
          },
        },
      },
    })

    const { handle } = renderStrict(machine)
    await flushMicrotasks()

    expect(document.body.hasAttribute(ATTR)).toBe(true)
    expect(lockCount).toBe(2)

    await act(async () => handle.current!.send({ type: "CLOSE" }))
    await flushMicrotasks()

    expect(lockCount).toBe(0)
    expect(document.body.hasAttribute(ATTR)).toBe(false)
  })

  test("unmount under Strict Mode also fires every entry-effect cleanup", async () => {
    let lockCount = 0

    const machine = createMachine<any>({
      initialState() {
        return "open"
      },
      states: {
        open: {
          effects: ["lockScroll"],
        },
      },
      implementations: {
        effects: {
          lockScroll() {
            lockCount++
            return () => {
              lockCount--
            }
          },
        },
      },
    })

    const { unmount } = renderStrict(machine)
    await flushMicrotasks()

    expect(lockCount).toBe(2)

    await act(async () => unmount())
    await flushMicrotasks()

    expect(lockCount).toBe(0)
  })

  test("root-level (machine.effects) cleanups also compose under Strict Mode", async () => {
    const setupSpy = vi.fn()
    const cleanupSpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      effects: ["rootEffect"],
      states: {
        idle: {},
      },
      implementations: {
        effects: {
          rootEffect() {
            setupSpy()
            return () => cleanupSpy()
          },
        },
      },
    })

    const { unmount } = renderStrict(machine)
    await flushMicrotasks()

    expect(setupSpy).toHaveBeenCalledTimes(2)

    await act(async () => unmount())
    await flushMicrotasks()

    expect(cleanupSpy).toHaveBeenCalledTimes(2)
  })
})
