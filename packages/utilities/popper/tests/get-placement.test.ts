// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest"
import { getPlacement } from "../src/get-placement"

function setup(contentZIndex: string, positionerZIndex?: string) {
  const reference = document.createElement("button")
  const positioner = document.createElement("div")
  const content = document.createElement("div")

  content.style.zIndex = contentZIndex
  if (positionerZIndex) positioner.style.zIndex = positionerZIndex

  positioner.append(content)
  document.body.append(reference, positioner)

  return { positioner, reference }
}

async function position(reference: HTMLElement, positioner: HTMLElement) {
  let resolvePositioned!: VoidFunction
  const positioned = new Promise<void>((resolve) => {
    resolvePositioned = resolve
  })
  const cleanup = getPlacement(reference, positioner, {
    listeners: false,
    onComplete() {
      setTimeout(resolvePositioned)
    },
  })
  await positioned
  return cleanup
}

afterEach(() => {
  document.body.innerHTML = ""
})

describe("z-index", () => {
  test.each(["auto", "7"])("preserves a consumer inline value when content is %s", async (contentZIndex) => {
    const { positioner, reference } = setup(contentZIndex, "777")

    const cleanup = await position(reference, positioner)
    expect(positioner.style.zIndex).toBe("777")
    cleanup()
  })

  test("hoists a concrete content value", async () => {
    const { positioner, reference } = setup("7")

    const cleanup = await position(reference, positioner)
    expect(positioner.style.zIndex).toBe("var(--z-index)")
    expect(positioner.style.getPropertyValue("--z-index")).toBe("7")
    cleanup()
  })

  test("removes a stale value owned by popper", async () => {
    const { positioner, reference } = setup("7")

    const cleanup = await position(reference, positioner)
    expect(positioner.style.zIndex).toBe("var(--z-index)")
    cleanup()

    const nextContent = document.createElement("div")
    nextContent.style.zIndex = "auto"
    positioner.firstElementChild?.replaceWith(nextContent)

    const cleanupNext = await position(reference, positioner)
    expect(positioner.style.zIndex).toBe("")
    cleanupNext()
  })
})
