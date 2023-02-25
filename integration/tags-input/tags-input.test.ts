import { expect, describe, test } from "vitest"
import { machine, connect } from "@zag-js/tags-input"
import type { UserDefinedContext } from "@zag-js/tags-input/src/tags-input.types"
import userEvent from "@testing-library/user-event"
import { setupTestVue } from "./tags-input.vue"

function clickOutside() {
  return userEvent.click(document.body)
}

function setupTest(userContext: Partial<UserDefinedContext> = {}) {
  const tagsMachine = machine({
    id: "foo",
    ...userContext,
  })
  setupTestVue(tagsMachine, connect)

  const { state, send } = tagsMachine
  function expectStateToBe(value: (typeof state)["value"]) {
    expect(state.value).toBe(value)
  }

  return {
    send,
    expectStateToBe,
  }
}

describe("@zag-js/tags-input machine", () => {
  test("has idle state after click outside", async () => {
    const { send, expectStateToBe } = setupTest()
    send("FOCUS")
    expectStateToBe("focused:input")
    await clickOutside()
    expectStateToBe("idle")
  })
})
