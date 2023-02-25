import { expect, describe, test, vi } from "vitest"
import type { UserDefinedContext } from "@zag-js/tags-input/src/tags-input.types"
import userEvent from "@testing-library/user-event"
import { setupVue } from "./tags-input.vue"

async function clickOutside() {
  await userEvent.click(document.body)
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

describe.each([["vue", setupVue]])("@zag-js/tags-input machine %s", (_, setupFramework) => {
  function setupTest(userContext: Partial<UserDefinedContext> = {}) {
    const { getState, send } = setupFramework(userContext)

    function expectStateToBe(value: ReturnType<typeof getState>["value"]) {
      expect(getState().value).toBe(value)
    }

    return {
      send,
      expectStateToBe,
    }
  }

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
