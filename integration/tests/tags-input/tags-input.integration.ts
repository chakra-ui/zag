import { expect, describe, test, vi } from "vitest"
import type { UserDefinedContext } from "@zag-js/tags-input/src/tags-input.types"
import { setupFramework } from "./tags-input.setup"
import { click, clickOutside, getByPart } from "../utils"

describe("@zag-js/tags-input", () => {
  function setupTest(userContext: Partial<UserDefinedContext> = {}) {
    setupFramework(userContext)

    return {
      root: getByPart("root"),
      input: getByPart("input"),
    }
  }

  test("onInteractOutside can prevent loosing visual focus on click outside", async () => {
    const onInteractOutside = vi.fn((event: Event) => {
      event.preventDefault()
    })
    const { root, input } = setupTest({
      onInteractOutside,
    })
    await click(input)
    expect(root).toHaveAttribute("data-focus")

    await clickOutside()
    expect(root).toHaveAttribute("data-focus")

    onInteractOutside.mockImplementationOnce(() => null)
    await clickOutside()
    expect(root).not.toHaveAttribute("data-focus")
  })
})
