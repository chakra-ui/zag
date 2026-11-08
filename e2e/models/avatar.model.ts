import { expect, type Page, type Route } from "@playwright/test"
import { Model } from "./model"

// A 1x1 PNG, so tests never depend on the network
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
)

export class AvatarModel extends Model {
  /** Image URLs that are held: they never finish loading */
  private held = new Set<string>()

  constructor(public page: Page) {
    super(page)
  }

  async goto(url = "/avatar/status") {
    await this.page.route("**/randomuser.me/**", (route: Route) => {
      const url = route.request().url()
      if ([...this.held].some((part) => url.includes(part))) return
      return route.fulfill({ contentType: "image/png", body: PNG })
    })
    // A held image would block the load event
    await this.page.goto(url, { waitUntil: "domcontentloaded" })
  }

  /** Keeps images whose URL contains `part` loading forever */
  holdImage(part: string) {
    this.held.add(part)
  }

  private get image() {
    return this.page.locator("[data-avatar-image]")
  }

  private get fallback() {
    return this.page.locator("[data-avatar-fallback]")
  }

  click(name: string) {
    return this.page.getByRole("button", { name }).click()
  }

  seeStatus(status: "loading" | "loaded" | "error") {
    return expect(this.page.getByRole("status", { name: "Load status" })).toHaveText(status)
  }

  /** Checks the latest statuses reported by `onStatusChange` */
  seeLatestStatusReports(...statuses: string[]) {
    return expect(this.page.getByRole("status", { name: "Status reports" })).toHaveText(
      new RegExp(`${statuses.join(",")}$`),
    )
  }

  async seeImage() {
    await expect(this.image).toBeVisible()
    await expect(this.fallback).toBeHidden()
  }

  async seeFallback() {
    await expect(this.fallback).toBeVisible()
    await expect(this.image).toBeHidden()
  }
}
