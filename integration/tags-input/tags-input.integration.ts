import { expect, describe, test, vi } from "vitest"
import type { UserDefinedContext } from "@zag-js/tags-input/src/tags-input.types"
import { setupVue } from "./tags-input.vue"
import { click, clickOutside, getByPart } from "../utils"

describe.each([["vue", setupVue]])("@zag-js/tags-input machine %s", (_, setupFramework) => {
  function setupTest(userContext: Partial<UserDefinedContext> = {}) {
    setupFramework(userContext)

    return {
      root: getByPart("root"),
      input: getByPart("input"),
    }
  }

  test("isInteractionOutside can prevent loosing visual focus on click outside", async () => {
    const isInteractionOutside = vi.fn(() => false)
    const { root, input } = setupTest({
      isInteractionOutside,
    })
    await click(input)
    expect(root).toHaveAttribute("data-focus")

    await clickOutside()
    expect(root).toHaveAttribute("data-focus")

    isInteractionOutside.mockImplementationOnce(() => true)
    await clickOutside()
    expect(root).not.toHaveAttribute("data-focus")
  })
})
