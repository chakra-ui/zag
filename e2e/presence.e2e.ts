import { expect, test } from "./_test"

const content = '[data-scope="presence"]'

test.describe("presence", () => {
  test("should play the exit animation when closed during the enter animation", async ({ page }) => {
    await page.goto("/presence/basic")

    const exitAnimationEnded = await page.evaluate(
      (selector) =>
        new Promise<boolean>((resolve) => {
          const toggle = document.querySelector<HTMLButtonElement>("main button")!
          let closing = false
          let ended = false

          document.addEventListener(
            "animationstart",
            (event) => {
              const target = event.target as Element
              if (closing || !target.matches(selector) || target.getAttribute("data-state") !== "open") return
              closing = true
              setTimeout(() => toggle.click(), 50)
            },
            true,
          )

          document.addEventListener(
            "animationend",
            (event) => {
              const target = event.target as Element
              if (target.matches(selector) && target.getAttribute("data-state") === "closed") ended = true
            },
            true,
          )

          const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) return
            observer.disconnect()
            resolve(ended)
          })

          toggle.click()
          requestAnimationFrame(() => observer.observe(document.body, { childList: true, subtree: true }))
        }),
      content,
    )

    expect(exitAnimationEnded).toBe(true)
    await expect(page.locator(content)).toHaveCount(0)
  })
})
