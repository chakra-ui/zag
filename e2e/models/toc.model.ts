import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

export class TocModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/toc/basic") {
    return this.page.goto(url)
  }

  get scrollContainer() {
    return this.page.getByTestId("scroll-container")
  }

  get nav() {
    return this.page.locator("[data-scope='toc'][data-part='nav']")
  }

  clickLink = async (value: string) => {
    await this.page.locator(`[data-scope='toc'][data-part='link'][href='#${value}']`).click()
  }

  scrollContentToEnd = async () => {
    await this.scrollContainer.evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: "instant" }))
  }

  seeHeadingNearTop = async (value: string) => {
    const offset = () =>
      this.page.evaluate((value) => {
        const container = document.querySelector("[data-testid='scroll-container']")!
        const heading = document.getElementById(value)!
        return heading.getBoundingClientRect().top - container.getBoundingClientRect().top
      }, value)
    await expect.poll(offset).toBeLessThan(40)
  }

  seeActiveItemInNav = async () => {
    const visible = () =>
      this.page.evaluate(() => {
        const nav = document.querySelector("[data-scope='toc'][data-part='nav']")!
        const items = [...document.querySelectorAll("[data-scope='toc'][data-part='item'][data-active]")]
        if (!items.length) return false
        const n = nav.getBoundingClientRect()
        const a = items[0].getBoundingClientRect()
        return a.top >= n.top - 1 && a.bottom <= n.bottom + 1
      })
    await expect.poll(visible).toBe(true)
  }
}
