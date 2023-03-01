import { expect, describe, test } from "vitest"
import type { UserDefinedContext } from "@zag-js/tags-input/src/tags-input.types"
import { setupFramework } from "./tags-input.setup"
import { getByPart, getByLabelText, type, pressEnter, click } from "../utils"

const TAG = "Svelte"

describe("@zag-js/tags-input", () => {
  function setupTest(userContext: Partial<UserDefinedContext> = {}) {
    setupFramework(userContext)

    return {
      root: getByPart("root"),
      input: getByPart("input"),
      getDeleteButton: (tag: string) => getByLabelText(`Delete tag ${tag}`),
    }
  }

  test("can add tag", async () => {
    const { root, input } = setupTest()

    await type(input, TAG)
    await pressEnter(input)

    expect(input).toHaveValue("")
    expect(root).toHaveTextContent(TAG)
  })

  test("can delete tag", async () => {
    const { root, getDeleteButton } = setupTest({
      value: [TAG],
    })

    await click(getDeleteButton(TAG))
    expect(root).not.toHaveTextContent(TAG)
  })
})
