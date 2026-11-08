import { expect, test } from "./_test"

test.describe("dismissable prevent-dismiss", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dismissable/prevent-dismiss")
    await page.getByTestId("trigger").click()
    await expect(page.getByTestId("panel")).toBeVisible()
  })

  test("should stay open on outside click and Escape while the reply is dirty", async ({ page }) => {
    await page.getByTestId("reply").fill("Yes, it ships on the 12th.")

    await page.getByTestId("outside").click()
    await expect(page.getByTestId("panel")).toBeVisible()
    await expect(page.getByTestId("hint")).toHaveText("Your reply is not sent yet. Clear it to close this panel.")

    await page.getByTestId("reply").fill("")
    await expect(page.getByTestId("hint")).toHaveText("")

    await page.getByTestId("reply").fill("Still drafting")
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("panel")).toBeVisible()
    await expect(page.getByTestId("hint")).not.toHaveText("")
  })

  test("should stay open when the trigger is clicked while the reply is dirty", async ({ page }) => {
    await page.getByTestId("reply").fill("Yes, it ships on the 12th.")
    await page.getByTestId("trigger").click()
    await expect(page.getByTestId("panel")).toBeVisible()
    await expect(page.getByTestId("hint")).not.toHaveText("")

    await page.getByTestId("reply").fill("")
    await page.getByTestId("trigger").click()
    await expect(page.getByTestId("panel")).toBeHidden()
  })

  test("should close on outside click once the reply is cleared", async ({ page }) => {
    await page.getByTestId("reply").fill("Draft")
    await page.getByTestId("reply").fill("")
    await page.getByTestId("outside").click()
    await expect(page.getByTestId("panel")).toBeHidden()
  })

  test("should close on Escape when clean and reopen with a fresh state", async ({ page }) => {
    await page.getByTestId("reply").focus()
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("panel")).toBeHidden()

    await page.getByTestId("trigger").click()
    await expect(page.getByTestId("panel")).toBeVisible()
    await expect(page.getByTestId("hint")).toHaveText("")
  })
})
