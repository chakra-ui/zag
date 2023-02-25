import type { UserDefinedContext } from "./tags-input.types"
import { expect, describe, test, afterEach } from "vitest"
import { machine } from "./tags-input.machine"
import userEvent from "@testing-library/user-event"

function clickOutside() {
  return userEvent.click(document.body)
}

function createElement(tag: keyof HTMLElementTagNameMap, id: string) {
  const el = document.createElement(tag)
  document.body.append(el)
  el.id = id
  return el
}

function setupTest(userContext: Partial<UserDefinedContext> = {}) {
  const input = createElement("input", "foo")
  const { state, send } = machine({
    id: "bar",
    ids: {
      input: input.id,
    },
    ...userContext,
  })

  function expectStateToBe(value: (typeof state)["value"]) {
    expect(state.value).toBe(value)
  }

  return {
    send,
    expectStateToBe,
  }
}

afterEach(() => {
  document.body.innerHTML = ""
})

describe("@zag-js/tags-input machine", () => {
  test("has idle state after click outside", async () => {
    const { send, expectStateToBe } = setupTest()
    send("FOCUS")
    expectStateToBe("focused:input")
    await clickOutside()
    expectStateToBe("idle")
  })

  test("isInteractionOutside can keep focus after click outside", async () => {
    const isInteractionOutside = vi.fn(() => false)
    const { send, expectStateToBe } = setupTest({
      isInteractionOutside,
    })

    send("FOCUS")
    await clickOutside()
    expectStateToBe("focused:input")

    isInteractionOutside.mockImplementationOnce(() => true)
    await clickOutside()
    expectStateToBe("idle")
  })
})
