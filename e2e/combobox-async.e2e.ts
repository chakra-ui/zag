import { expect, test, type Page } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel
const swapiPeople = ["Luke Skywalker", "Leia Organa", "Lando Calrissian", "Han Solo"]

const mockSwapiPeople = async (page: Page, options: { gate?: Promise<void> } = {}) => {
  await page.route("https://swapi.py4e.com/api/people/*", async (route) => {
    const search = new URL(route.request().url()).searchParams.get("search")?.toLowerCase() ?? ""
    // hold filtered requests until the test releases them, to observe the loading state
    if (search && options.gate) await options.gate
    const people = swapiPeople
      .filter((name) => name.toLowerCase().includes(search))
      .map((name, index) => ({ name, url: `https://swapi.py4e.com/api/people/${index + 1}/` }))

    // superseded requests are aborted by the page while held
    await route
      .fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: people.length,
          next: null,
          previous: null,
          results: people,
        }),
      })
      .catch(() => {})
  })
}

test.describe("combobox / async", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
  })

  test("should filter server results as user types", async ({ page }) => {
    await mockSwapiPeople(page)

    await I.goto("/combobox/async")
    await I.clickInput()
    await I.type("lan")
    await I.seeDropdown()

    await I.seeItem("Lando Calrissian")
    await I.dontSeeItem("Leia Organa")
    await I.dontSeeItem("Luke Skywalker")
  })

  test("should select fetched item", async ({ page }) => {
    await mockSwapiPeople(page)

    await I.goto("/combobox/async")
    await I.clickInput()
    await I.type("luk")
    await I.seeDropdown()
    await I.clickItem("Luke Skywalker")

    await I.seeInputHasValue("Luke Skywalker")
    await I.seeSelectedText("Luke Skywalker", "selected-value")
  })

  test("[a11y] should announce the result count after typing", async ({ page }) => {
    await mockSwapiPeople(page)

    await I.goto("/combobox/async")
    await I.clickInput()
    await I.type("lan")
    await I.seeItem("Lando Calrissian")
    await expect(I.liveRegion()).toHaveText("1 result")

    await I.type("zzz")
    await expect(I.liveRegion()).toHaveText("No results")
  })

  test("[a11y] should mark the listbox busy and not announce no results while loading", async ({ page }) => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    await mockSwapiPeople(page, { gate })

    await I.goto("/combobox/async")
    await I.clickTrigger()
    await I.seeDropdown()
    await I.dontSeeListIsBusy()

    await I.type("zzz")
    await I.seeListIsBusy()
    await expect(I.liveRegion()).toHaveText("Loading results")
    // still loading well past the settle delay: no premature "No results"
    await I.wait(1500)
    await expect(I.liveRegion()).toHaveText("Loading results")

    release()
    await expect(I.liveRegion()).toHaveText("No results")
  })
})
