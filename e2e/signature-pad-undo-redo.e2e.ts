import { expect, test, type Page } from "./_test"

async function drawStroke(page: Page, y: number) {
  const box = await page.locator("[data-signature-pad-control]").boundingBox()
  if (!box) throw new Error("signature control not found")
  await page.mouse.move(box.x + 30, box.y + y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 30, box.y + y + 10, { steps: 10 })
  await page.mouse.up()
}

test.describe("signature-pad undo-redo", () => {
  test("undo and redo walk the controlled path history", async ({ page }) => {
    await page.goto("/signature-pad/undo-redo")
    const count = page.getByTestId("stroke-count")
    const strokes = page.locator("[data-signature-pad-control] path")
    const undo = page.getByRole("button", { name: "Undo" })
    const redo = page.getByRole("button", { name: "Redo" })

    await expect(undo).toBeDisabled()
    await drawStroke(page, 30)
    await drawStroke(page, 80)
    await expect(count).toHaveText("2 strokes")
    await expect(strokes).toHaveCount(2)

    await undo.click()
    await expect(count).toHaveText("1 stroke")
    await expect(strokes).toHaveCount(1)
    await expect(redo).toBeEnabled()

    await redo.click()
    await expect(count).toHaveText("2 strokes")
    await expect(redo).toBeDisabled()

    await undo.click()
    await drawStroke(page, 120)
    await expect(count).toHaveText("2 strokes")
    await expect(redo).toBeDisabled()
  })
})
