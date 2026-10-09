import { expect, test, type Page } from "@playwright/test"

const scrollbar = (page: Page, orientation: string) =>
  page.locator(`[data-scope=scroll-area][data-part=scrollbar][data-orientation=${orientation}]`)
const thumb = (page: Page, orientation: string) =>
  page.locator(`[data-scope=scroll-area][data-part=thumb][data-orientation=${orientation}]`)

async function press(page: Page, x: number, y: number) {
  await page.mouse.move(x, y)
  await page.mouse.down()
}

test.describe("scroll-area / dragging", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/scroll-area/basic")
    await expect(thumb(page, "vertical")).toBeVisible()
    await expect(thumb(page, "horizontal")).toBeVisible()
  })

  test("dragging the vertical thumb only marks the vertical axis", async ({ page }) => {
    const box = (await thumb(page, "vertical").boundingBox())!
    await press(page, box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 20, { steps: 4 })

    await expect(thumb(page, "vertical")).toHaveAttribute("data-dragging", "")
    await expect(scrollbar(page, "vertical")).toHaveAttribute("data-dragging", "")
    await expect(thumb(page, "horizontal")).not.toHaveAttribute("data-dragging")
    await expect(scrollbar(page, "horizontal")).not.toHaveAttribute("data-dragging")

    await page.mouse.up()
    await expect(thumb(page, "vertical")).not.toHaveAttribute("data-dragging")
  })

  test("dragging the horizontal thumb only marks the horizontal axis", async ({ page }) => {
    const box = (await thumb(page, "horizontal").boundingBox())!
    await press(page, box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2, { steps: 4 })

    await expect(thumb(page, "horizontal")).toHaveAttribute("data-dragging", "")
    await expect(scrollbar(page, "horizontal")).toHaveAttribute("data-dragging", "")
    await expect(thumb(page, "vertical")).not.toHaveAttribute("data-dragging")
    await expect(scrollbar(page, "vertical")).not.toHaveAttribute("data-dragging")

    await page.mouse.up()
    await expect(thumb(page, "horizontal")).not.toHaveAttribute("data-dragging")
  })

  test("pressing the vertical track only marks the vertical axis", async ({ page }) => {
    const track = (await scrollbar(page, "vertical").boundingBox())!
    await press(page, track.x + track.width / 2, track.y + track.height * 0.75)

    await expect(scrollbar(page, "vertical")).toHaveAttribute("data-dragging", "")
    await expect(scrollbar(page, "horizontal")).not.toHaveAttribute("data-dragging")
    await expect(thumb(page, "horizontal")).not.toHaveAttribute("data-dragging")

    await page.mouse.up()
  })
})
