import { expect, test } from "@playwright/test"
import { AccordionModel } from "./models/accordion.model"

let I: AccordionModel

test.describe("accordion", () => {
  test.beforeEach(async ({ page }) => {
    I = new AccordionModel(page)
  })

  test.describe("single", () => {
    test.beforeEach(async () => {
      await I.goto()
    })

    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("clicking a trigger opens its content", async () => {
      await I.clickTrigger("home")
      await I.seeContent("home")
      await I.seeTriggerIsExpanded("home")
    })

    test("clicking an open trigger closes its content", async () => {
      await I.clickTrigger("home")
      await I.clickTrigger("home")
      await I.dontSeeContent("home")
      await I.seeTriggerIsExpanded("home", false)
    })

    test("[collapsible=false] clicking an open trigger keeps it open", async () => {
      await I.controls.bool("collapsible", false)
      await I.clickTrigger("home")
      await I.clickTrigger("home")
      await I.seeContent("home")
    })

    test("opening another item closes the previous one", async () => {
      await I.clickTrigger("home")
      await I.clickTrigger("about")
      await I.seeContent("about")
      await I.dontSeeContent("home")
    })

    test("Enter and Space toggle the focused item", async () => {
      await I.focusTrigger("home")
      await I.pressKey("Enter")
      await I.seeContent("home")
      await I.pressKey("Space")
      await I.dontSeeContent("home")
    })

    test("Tab moves focus to the next trigger", async () => {
      await I.focusTrigger("home")
      await I.pressKey("Tab")
      await I.seeTriggerIsFocused("about")
    })
  })

  test.describe("multiple", () => {
    test.beforeEach(async () => {
      await I.goto()
      await I.controls.bool("multiple")
    })

    test("opening another item keeps the previous one open", async () => {
      await I.clickTrigger("home")
      await I.clickTrigger("about")
      await I.seeContent("home")
      await I.seeContent("about")
    })

    test("opens several items from the keyboard", async () => {
      await I.focusTrigger("home")
      await I.pressKey("Enter")
      await I.pressKey("Tab")
      await I.pressKey("Enter")
      await I.seeContent("home")
      await I.seeContent("about")
    })
  })

  test.describe("disabled item", () => {
    test.beforeEach(async () => {
      await I.goto("/accordion/disabled-item")
    })

    test("can't be opened", async () => {
      const trigger = I.getTriggerByLabel("Billing")
      await expect(trigger).toBeDisabled()
      await trigger.click({ force: true })
      await expect(I.page.locator("[data-accordion-item-content]", { hasText: "invoices" })).toBeHidden()
    })

    test("is skipped by Tab", async () => {
      await I.getTriggerByLabel("Notifications").focus()
      await I.pressKey("Tab")
      await expect(I.getTriggerByLabel("Security")).toBeFocused()
    })
  })

  test.describe("controlled", () => {
    test.beforeEach(async () => {
      await I.goto("/accordion/controlled")
    })

    test("expand all and collapse all update every item", async () => {
      const openContent = I.page.locator("[data-accordion-item-content]:not([hidden])")
      await I.page.getByRole("button", { name: "Expand all" }).click()
      await expect(openContent).toHaveCount(4)
      await I.page.getByRole("button", { name: "Collapse all" }).click()
      await expect(openContent).toHaveCount(0)
    })
  })

  test.describe("find in page", () => {
    test.beforeEach(async () => {
      await I.goto("/accordion/find-in-page")
    })

    test("closed items stay searchable", async () => {
      await expect(I.getContentByValue("payment")).toHaveAttribute("hidden", "until-found")
    })

    test("a match opens its item", async () => {
      await I.revealByFind("payment")
      await expect(I.getContentByValue("payment")).toBeVisible()
      await expect(I.getContentByValue("payment")).not.toHaveAttribute("hidden")
    })

    test("closing a found item makes it searchable again", async () => {
      await I.revealByFind("payment")
      await I.getTriggerByLabel("Which payment methods do you accept?").click()
      await expect(I.getContentByValue("payment")).toHaveAttribute("hidden", "until-found")
    })
  })
})
