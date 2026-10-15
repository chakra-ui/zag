import { expect, test } from "@playwright/test"
import { part } from "./_utils"
import { StepsModel } from "./models/steps.model"

let I: StepsModel

test.describe("steps / basic", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("starts on the first step", async () => {
    await I.seeCurrentStep("first")
    await I.seeStepState("second", "incomplete")
    await I.dontSeeCompletedContent()
  })

  test("next marks the departing step completed", async () => {
    await I.clickNext()
    await I.seeCurrentStep("second")
    await I.seeStepState("first", "complete")
  })

  test("prev goes back without un-completing", async () => {
    await I.clickNext()
    await I.clickPrev()
    await I.seeCurrentStep("first")
    await I.seeStepState("first", "complete")
  })

  test("prev is disabled on the first step", async () => {
    await expect(I.previousTrigger).toBeDisabled()
  })

  test("walking to the end shows the completed content", async () => {
    await I.clickNext()
    await I.clickNext()
    await I.clickNext()
    await I.seeCompletedContent()
  })

  test("finishing moves focus to the completed content", async () => {
    await I.clickNext()
    await I.clickNext()
    await I.clickNext()
    const completed = I.getCompletedContent()
    await expect(completed).toBeFocused()
    await expect(completed).not.toHaveAttribute("role", "tabpanel")
    await expect(completed).not.toHaveAttribute("aria-labelledby")
    await I.checkAccessibility()
  })

  test("a trigger click jumps without completing", async () => {
    await I.clickTrigger("third")
    await I.seeCurrentStep("third")
    await I.seeStepState("first", "skipped")
  })

  test("skip is offered only on an optional step", async () => {
    await I.dontSeeSkipTrigger()
    await I.clickNext()
    await I.seeCurrentStep("second")
    await I.seeSkipTrigger()
  })

  test("skipping advances without completing the step", async () => {
    await I.clickNext()
    await I.clickSkip()
    await I.seeCurrentStep("third")
    await I.seeStepState("second", "skipped")
  })

  test("content follows the current step", async () => {
    await expect(I.getContent("first")).toBeVisible()
    await expect(I.getContent("second")).not.toBeVisible()
    await I.clickNext()
    await expect(I.getContent("first")).not.toBeVisible()
    await expect(I.getContent("second")).toBeVisible()
  })

  test("keyboard: arrows move focus without changing the step", async () => {
    await I.focusTrigger("first")
    await I.pressKey("ArrowRight")
    await I.seeTriggerIsFocused("second")
    await I.seeCurrentStep("first")

    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("first")
  })

  test("keyboard: enter activates the focused step", async () => {
    await I.focusTrigger("first")
    await I.pressKey("ArrowRight")
    await I.pressKey("Enter")
    await I.seeCurrentStep("second")
  })

  test("keyboard: home and end jump to the ends", async () => {
    await I.focusTrigger("first")
    await I.pressKey("End")
    await I.seeTriggerIsFocused("third")

    await I.pressKey("Home")
    await I.seeTriggerIsFocused("first")
  })

  test("keyboard: arrows stop at the boundaries", async () => {
    await I.focusTrigger("first")
    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("first")

    await I.pressKey("End")
    await I.pressKey("ArrowRight")
    await I.seeTriggerIsFocused("third")
  })

  test("keyboard: arrows follow reading direction in rtl", async () => {
    await I.controls.select("dir", "rtl")
    await I.focusTrigger("first")
    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("second")
    await I.seeCurrentStep("first")

    await I.pressKey("ArrowRight")
    await I.seeTriggerIsFocused("first")
  })

  test("back from the completed view returns to the last step", async () => {
    await I.clickNext()
    await I.clickNext()
    await I.clickNext()
    await I.seeCompletedContent()
    await I.clickPrev()
    await I.dontSeeCompletedContent()
    await I.seeCurrentStep("third")
  })

  test("linear mode blocks jumping ahead", async () => {
    await I.controls.bool("linear", true)
    await I.seeTriggerIsDisabled("third")
    await I.seeCurrentStep("first")
  })

  test("linear mode allows returning to a completed step", async () => {
    await I.controls.bool("linear", true)
    await I.clickNext()
    await I.seeCurrentStep("second")
    await I.seeTriggerIsEnabled("first")
    await I.clickTrigger("first")
    await I.seeCurrentStep("first")
  })
})

test.describe("steps / controlled", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto("/steps/controlled")
  })

  test("follows the external value", async () => {
    await I.seeCurrentStep("shipping")
    await I.clickButton("Go to Review")
    await I.seeCurrentStep("review")
  })

  test("next writes back to the external value", async ({ page }) => {
    await I.clickNext()
    await I.seeCurrentStep("payment")
    await expect(page.getByText("External state:")).toContainText("payment")
  })

  test("completing writes the completed position back", async ({ page }) => {
    await I.clickNext()
    await I.clickNext()
    await I.clickNext()
    await I.seeCompletedContent()
    await expect(page.getByText("External state:")).toContainText("complete")
    await expect(page.getByText("External state:")).toContainText("onComplete: shipping,payment,review")
  })

  test("the external value can show the completed position", async () => {
    await I.clickButton("Show completed")
    await I.seeCompletedContent()
    await I.clickPrev()
    await I.seeCurrentStep("review")
  })
})

test.describe("steps / validation", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto("/steps/validation")
  })

  test("blocks next and shows the error while the step is invalid", async ({ page }) => {
    await expect(page.getByText("Name must be at least 3 characters")).toHaveCount(0)
    await I.clickNext()
    await I.seeCurrentStep("details")
    await expect(page.getByText("Name must be at least 3 characters")).toBeVisible()
  })

  test("linear mode keeps later steps out of reach", async () => {
    await I.seeTriggerIsDisabled("review")
  })

  test("walks through and submits", async ({ page }) => {
    await page.getByLabel("Project name").fill("Atlas")
    await I.clickNext()
    await I.seeStepState("details", "complete")
    await page.getByRole("combobox", { name: "Region" }).selectOption("eu-west")
    await I.clickNext()
    await I.clickNext()
    await I.seeCurrentStep("review")
    await I.clickButton("Create project")
    await I.seeCompletedContent()
    await expect(I.getCompletedContent()).toContainText("Atlas")
  })

  test("earlier steps stay reachable from the headers", async ({ page }) => {
    await page.getByLabel("Project name").fill("Atlas")
    await I.clickNext()
    await I.clickTrigger("details")
    await I.seeCurrentStep("details")
  })
})

test.describe("steps / conditional steps", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto("/steps/conditional-steps")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  const fillProfile = async () => {
    await I.page.getByLabel("Your name").fill("Ada")
    await I.clickNext()
  }

  test("choosing solo removes the invite step and updates the count", async ({ page }) => {
    await fillProfile()
    await expect(page.getByText("Step 2 of 4")).toBeVisible()
    await page.getByLabel("Just me").check()
    await expect(page.getByText("Step 2 of 3")).toBeVisible()
    await expect(I.getTrigger("invite")).toHaveCount(0)
    await I.clickNext()
    await I.seeCurrentStep("calendar")
  })

  test("optional steps can be done later", async () => {
    await fillProfile()
    await I.dontSeeSkipTrigger()
    await I.clickNext()
    await I.seeSkipTrigger()
    await I.clickSkip()
    await I.seeStepState("invite", "skipped")
    await I.clickSkip()
    await I.seeCompletedContent()
  })

  test("progress bar announces the current step", async ({ page }) => {
    const progress = page.locator(part("steps", "progress"))
    await expect(progress).toHaveAttribute("aria-label", "Progress")
    await expect(progress).toHaveAttribute("aria-valuetext", "Step 1 of 4: Profile")
    await fillProfile()
    await expect(progress).toHaveAttribute("aria-valuetext", "Step 2 of 4: Usage")
    await expect(page.locator(part("steps", "root"))).toHaveCSS("--steps-percent", "25%")
  })
})

test.describe("steps / url sync", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto("/steps/url-sync")
  })

  test("syncs the step with the url", async ({ page }) => {
    await page.getByLabel("Email").fill("ada@example.com")
    await I.clickNext()
    await I.seeCurrentStep("shipping")
    await expect(page).toHaveURL(/step=shipping/)
  })

  test("browser back returns to the previous step", async ({ page }) => {
    await page.getByLabel("Email").fill("ada@example.com")
    await I.clickNext()
    await expect(page).toHaveURL(/step=shipping/)
    await page.goBack()
    await I.seeCurrentStep("contact")
  })

  test("digital-only carts skip shipping", async ({ page }) => {
    await page.getByLabel("Email").fill("ada@example.com")
    await page.getByLabel("My cart only has digital items").check()
    await expect(I.getTrigger("shipping")).toHaveCount(0)
    await I.clickNext()
    await I.seeCurrentStep("payment")
    await I.clickButton("Place order")
    await I.seeCompletedContent()
    await expect(page).toHaveURL(/step=confirmation/)
  })
})

test.describe("steps / locked steps", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto("/steps/locked-steps")
  })

  const verify = async () => {
    await I.page.getByLabel("Password", { exact: true }).fill("secret")
    await I.clickNext()
    await I.clickNext()
    await I.page.getByLabel("6-digit code").fill("123456")
    await I.clickButton("Verify")
    await I.seeCompletedContent()
  }

  test("earlier steps can be revisited before verifying", async () => {
    await I.page.getByLabel("Password", { exact: true }).fill("secret")
    await I.clickNext()
    await I.clickPrev()
    await I.seeCurrentStep("password")
  })

  test("verifying locks every earlier step", async () => {
    await verify()
    await expect(I.previousTrigger).toBeDisabled()
    await I.seeTriggerIsDisabled("password")
    await I.seeTriggerIsDisabled("verify")
  })

  test("cancel starts over", async ({ page }) => {
    await page.getByLabel("Password", { exact: true }).fill("secret")
    await I.clickNext()
    await I.clickButton("Cancel")
    await I.seeCurrentStep("password")
    await expect(page.getByLabel("Password", { exact: true })).toHaveValue("")
  })
})

test.describe("steps / persisted progress", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto("/steps/persisted-progress")
  })

  test("resumes where the user left off", async ({ page }) => {
    await I.seeCurrentStep("domain")
    await I.clickNext()
    await I.clickNext()
    await I.seeCurrentStep("payouts")
    await page.reload()
    await I.seeCurrentStep("payouts")
    await I.seeStepState("branding", "complete")
  })

  test("a finished setup stays finished after reload", async ({ page }) => {
    for (let i = 0; i < 4; i++) await I.clickNext()
    await I.seeCompletedContent()
    await page.reload()
    await I.seeCompletedContent()
    await I.clickPrev()
    await I.seeCurrentStep("review")
  })

  test("reset clears the saved progress", async ({ page }) => {
    await I.clickNext()
    await I.clickButton("Reset progress")
    await page.reload()
    await I.seeCurrentStep("domain")
    await I.dontSeeStepState("domain", "complete")
  })
})

test.describe("steps / async items", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto("/steps/async-items")
  })

  test("initializes onto the first step once items arrive", async () => {
    await I.seeCurrentStep("profile")
  })

  test("clearing items mid-flow leaves navigation inert", async ({ page }) => {
    await I.seeCurrentStep("profile")
    await I.clickNext()
    await I.seeCurrentStep("team")

    await I.clickButton("Clear items")
    await expect(page.getByText("the value is null")).toBeVisible()
  })

  test("clearing items leaves the completed position, and restoring resumes nearby", async ({ page }) => {
    for (let i = 0; i < 4; i++) await I.clickNext()
    await I.seeCompletedContent()

    await I.clickButton("Clear items")
    await I.dontSeeCompletedContent()
    await expect(page.getByText("the value is null")).toBeVisible()

    await I.clickButton("Restore items")
    await I.seeCurrentStep("done")
  })

  test("disabling every item clears the value, and re-enabling resumes", async ({ page }) => {
    await I.clickNext()
    await I.seeCurrentStep("team")

    await I.clickButton("Disable all")
    await expect(page.getByText("the value is null")).toBeVisible()
    await expect(I.nextTrigger).toBeDisabled()
    await expect(I.getContent("team")).not.toBeVisible()

    await I.clickButton("Restore items")
    await I.seeCurrentStep("team")
  })

  test("restoring items recovers a usable step", async () => {
    await I.seeCurrentStep("profile")
    await I.clickButton("Clear items")
    await I.clickButton("Restore items")
    await I.seeCurrentStep("profile")
  })
})
