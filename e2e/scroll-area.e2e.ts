import { expect, test, type Page } from "@playwright/test"

const scrollbar = (page: Page, orientation: string) =>
  page.locator(`[data-scope=scroll-area][data-part=scrollbar][data-orientation=${orientation}]`)
const thumb = (page: Page, orientation: string) =>
  page.locator(`[data-scope=scroll-area][data-part=thumb][data-orientation=${orientation}]`)

test("dragging the vertical thumb only marks the vertical axis", async ({ page }) => {
  await page.goto("/scroll-area/basic")

  const box = (await thumb(page, "vertical").boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()

  await expect(thumb(page, "vertical")).toHaveAttribute("data-dragging", "")
  await expect(scrollbar(page, "vertical")).toHaveAttribute("data-dragging", "")
  await expect(thumb(page, "horizontal")).not.toHaveAttribute("data-dragging")
  await expect(scrollbar(page, "horizontal")).not.toHaveAttribute("data-dragging")
})
