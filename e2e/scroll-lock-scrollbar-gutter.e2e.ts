import { expect, test } from "./_test"

// Headless Chromium hides scrollbars (hide-scrollbars) and uses overlay ones (0px wide), so there is
// no gutter to observe. Bring back classic scrollbars for this file. Styling them with
// ::-webkit-scrollbar is no way out: Chromium then drops the stable gutter while the page is locked.
test.use({
  launchOptions: {
    ignoreDefaultArgs: ["--hide-scrollbars"],
    args: ["--disable-features=OverlayScrollbar"],
  },
})

test.describe("scroll lock scrollbar gutter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/scroll-lock/scrollbar-gutter")
  })

  test("the page has a classic scrollbar and reserves its gutter", async ({ page }) => {
    const info = await page.evaluate(() => ({
      gutter: getComputedStyle(document.documentElement).scrollbarGutter,
      scrollbar: window.innerWidth - document.documentElement.clientWidth,
    }))
    expect(info.gutter).toBe("stable")
    expect(info.scrollbar).toBeGreaterThan(0)
  })

  test("the header keeps its width and no padding is added when locked", async ({ page }) => {
    const header = page.getByTestId("header")
    const before = (await header.boundingBox())!.width

    await page.getByTestId("toggle-lock").click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")

    const after = (await header.boundingBox())!.width
    expect(after).toBe(before)

    const html = await page.evaluate(() => {
      const s = document.documentElement.style
      return { overflow: s.overflow, paddingRight: s.paddingRight, paddingLeft: s.paddingLeft }
    })
    expect(html).toEqual({ overflow: "hidden", paddingRight: "", paddingLeft: "" })
  })

  test("without the gutter zag pads the page to keep the header width instead", async ({ page }) => {
    await page.addStyleTag({ content: "html { scrollbar-gutter: auto !important }" })
    const header = page.getByTestId("header")
    const before = (await header.boundingBox())!.width
    const scrollbar = await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)

    await page.getByTestId("toggle-lock").click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")

    expect((await header.boundingBox())!.width).toBe(before)
    expect(await page.evaluate(() => document.documentElement.style.paddingRight)).toBe(`${scrollbar}px`)
  })

  test("the scrollbar width is exposed as a CSS variable", async ({ page }) => {
    const scrollbar = await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)
    await page.getByTestId("toggle-lock").click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")
    const value = await page.evaluate(() => document.documentElement.style.getPropertyValue("--scrollbar-width"))
    expect(value).toBe(`${scrollbar}px`)
  })

  test("unlocking restores the page", async ({ page }) => {
    const toggle = page.getByTestId("toggle-lock")
    await toggle.click()
    await expect(page.locator("body")).toHaveAttribute("data-scroll-lock", "")
    await toggle.click()
    await expect(page.locator("body")).not.toHaveAttribute("data-scroll-lock", "")
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("")
  })
})
