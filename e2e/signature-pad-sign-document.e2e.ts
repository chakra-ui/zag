import { expect, test, type Page } from "./_test"

async function drawStroke(page: Page, y: number) {
  const box = await page.locator("[data-signature-pad-control]").boundingBox()
  if (!box) throw new Error("signature control not found")
  await page.mouse.move(box.x + 30, box.y + y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 30, box.y + y + 10, { steps: 10 })
  await page.mouse.up()
}

test.describe("signature-pad sign-document", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signature-pad/sign-document")
  })

  test("submitting without a signature shows an error", async ({ page }) => {
    await page.getByLabel("Full name").fill("Ada Lovelace")
    await page.getByRole("button", { name: "Sign lease" }).click()
    await expect(page.getByText("Sign above to continue")).toBeVisible()
    await expect(page.getByTestId("form-output")).toHaveCount(0)
  })

  test("submits the signature as a PNG data URL, and reset clears it", async ({ page }) => {
    await page.getByLabel("Full name").fill("Ada Lovelace")
    await drawStroke(page, 40)
    await expect(page.locator("input[name='signature']")).toHaveValue(/^data:image\/png/)
    await page.getByRole("button", { name: "Sign lease" }).click()

    const output = page.getByTestId("form-output")
    await expect(output).toContainText("signer=Ada Lovelace")
    await expect(output).toContainText("signature=data:image/png;base64,")
    await expect(page.getByText("Sign above to continue")).toHaveCount(0)

    await page.getByRole("button", { name: "Start over" }).click()
    await expect(output).toHaveCount(0)
    await expect(page.getByLabel("Full name")).toHaveValue("")
    await expect(page.locator("[data-signature-pad-control] path")).toHaveCount(0)
  })
})
