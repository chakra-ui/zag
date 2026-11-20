import { expect, test } from "./_test"

const height = (el: { evaluate: (fn: (el: HTMLElement) => number) => Promise<number> }) =>
  el.evaluate((el) => el.getBoundingClientRect().height)

test.describe("autoresize chat-composer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/autoresize/chat-composer")
  })

  test("grows with Shift+Enter lines and stops at five rows", async ({ page }) => {
    const composer = page.getByRole("textbox", { name: "Message" })
    const initial = await height(composer)

    await composer.click()
    await page.keyboard.type("First line")
    await page.keyboard.press("Shift+Enter")
    await page.keyboard.type("Second line")
    await expect.poll(() => height(composer)).toBeGreaterThan(initial)
    await expect(page.getByTestId("messages").getByRole("listitem")).toHaveCount(2)

    for (let i = 3; i <= 8; i++) {
      await page.keyboard.press("Shift+Enter")
      await page.keyboard.type(`Line ${i}`)
    }
    const capped = await height(composer)
    // five 20px rows, 16px padding and a 2px border
    expect(capped).toBe(118)
    await page.keyboard.press("Shift+Enter")
    await page.keyboard.type("Line 9")
    await expect.poll(() => height(composer)).toBe(capped)
    await expect(composer).toHaveCSS("overflow-y", "scroll")
  })

  test("Enter sends the message, clears the composer and shrinks it back", async ({ page }) => {
    const composer = page.getByRole("textbox", { name: "Message" })
    const initial = await height(composer)

    await composer.click()
    await page.keyboard.type("Running 5 minutes late")
    await page.keyboard.press("Shift+Enter")
    await page.keyboard.type("Start without me")
    await expect.poll(() => height(composer)).toBeGreaterThan(initial)

    await page.keyboard.press("Enter")

    const messages = page.getByTestId("messages").getByRole("listitem")
    await expect(messages).toHaveCount(3)
    expect(await messages.last().innerText()).toBe("Running 5 minutes late\nStart without me")
    await expect(composer).toHaveValue("")
    await expect.poll(() => height(composer)).toBe(initial)
  })

  test("Enter on an empty composer sends nothing", async ({ page }) => {
    const composer = page.getByRole("textbox", { name: "Message" })
    await composer.click()
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("messages").getByRole("listitem")).toHaveCount(2)
  })
})
