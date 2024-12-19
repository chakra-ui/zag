import { test } from "@playwright/test"
import { CarouselModel } from "./models/carousel.model"

let I: CarouselModel

test.describe("carousel", () => {
  test.beforeEach(async ({ page }) => {
    I = new CarouselModel(page)
    await I.goto()
  })

  test("renders correctly", async () => {
    await I.seeNumOfItems(6)
    await I.seeIndicatorIsActive(0)
    await I.seeItemInView(0)
    await I.seeItemInView(1)
    await I.dontSeeItemInView(2)
  })

  test("next/prev buttons navigate carousel", async () => {
    await I.seePrevTriggerIsDisabled()
    await I.clickNextTrigger()
    await I.seeIndicatorIsActive(1)
    await I.seePrevTriggerIsEnabled()
  })

  test("autoplay start/stop", async ({ page }) => {
    await page.clock.install()

    await I.clickAutoplayTrigger()
    await I.seeAutoplayIsOn()

    await page.clock.fastForward(5000)
    await I.seeIndicatorIsActive(1)

    await I.clickAutoplayTrigger()
    await I.seeAutoplayIsOff()

    await page.clock.fastForward(5000)
    await I.seeIndicatorIsActive(1)
  })

  test("clicking indicator scrolls to correct slide", async () => {
    await I.clickIndicator(2)
    await I.seeIndicatorIsActive(2)

    await I.seeItemInView(4)
    await I.seeItemInView(5)
  })

  test("scroll to a specific index via button", async () => {
    await I.clickScrollToButton(4)
    await I.seeItemInView(4)
  })

  test("dragging behavior", async () => {
    await I.swipeCarousel("left", 400)
    await I.seeItemInView(3)
    await I.dontSeeItemInView(0)
    await I.dontSeeItemInView(1)
  })

  test("indicator keyboard navigation", async () => {
    await I.focusIndicator(0)
    await I.pressKey("ArrowRight")
    await I.seeItemInView(1)
  })

  test("[loop=true] should loop slides", async () => {
    await I.controls.bool("loop")
    await I.seePrevTriggerIsEnabled()

    await I.clickNextTrigger()
    await I.clickNextTrigger()
    await I.seeItemInView(5)

    await I.clickNextTrigger()
    await I.seeItemInView(0)
  })
})
