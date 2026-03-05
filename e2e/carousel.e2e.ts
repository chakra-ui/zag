import { test } from "@playwright/test"
import { CarouselModel } from "./models/carousel.model"

let I: CarouselModel

test.describe("carousel", () => {
  test.beforeEach(async ({ page }) => {
    I = new CarouselModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
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

  test.skip("[loop=true] autoplay start/stop", async ({ page }) => {
    await I.controls.bool("loop", true)
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

  test("tiny drag and release keeps current page", async () => {
    await I.seeIndicatorIsActive(0)

    await I.swipeCarousel("left", 20, 120, false)
    await I.holdDrag(40)
    await I.releaseDrag()
    await I.waitForScrollSettle()

    await I.seeIndicatorIsActive(0)
    await I.seeItemInView(0)
    await I.seeItemInView(1)
  })

  test("drag interruption and immediate restart resolves to final drag target", async () => {
    await I.swipeCarousel("left", 320, 300, false)
    await I.holdDrag(60)
    await I.releaseDrag()

    await I.swipeCarousel("left", 320, 300, false)
    await I.holdDrag(80)
    await I.releaseDrag()
    await I.waitForScrollSettle()

    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)
  })

  test("indicator click during settling wins over drag settle target", async () => {
    await I.swipeCarousel("left", 320, 400, false)
    await I.holdDrag(70)
    await I.releaseDrag()

    await I.clickIndicator(2)
    await I.waitForScrollSettle()

    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)
  })

  test("wheel scroll followed by drag updates to the correct final page", async () => {
    await I.wheelCarousel(500)
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)

    await I.swipeCarousel("left", 320, 400, false)
    await I.holdDrag(80)
    await I.releaseDrag()
    await I.waitForScrollSettle()

    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)
  })

  test("rapid next trigger clicks settle on the last page without desync", async () => {
    await I.nextTrigger.click({ clickCount: 2, delay: 20 })

    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)
    await I.seeNextTriggerIsDisabled()
  })

  test("vertical orientation supports wheel, drag, and keyboard page updates", async () => {
    await I.controls.select("orientation", "vertical")
    await I.clickNextTrigger()
    await I.seeIndicatorIsActive(1)

    await I.focusIndicator(1)
    await I.pressKey("ArrowDown")
    await I.seeIndicatorIsActive(2)
    await I.seeNextTriggerIsDisabled()

    await I.wheelCarousel(0, 500)
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)

    await I.swipeCarousel("down", 320, 400, false)
    await I.holdDrag(80)
    await I.releaseDrag()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
  })

  test("rtl mode keeps trigger, keyboard, and wheel navigation in sync", async () => {
    await I.controls.select("dir", "rtl")

    await I.clickNextTrigger()
    await I.seeIndicatorIsActive(1)

    await I.focusIndicator(1)
    await I.pressKey("ArrowLeft")
    await I.seeIndicatorIsActive(2)
    await I.seeNextTriggerIsDisabled()

    await I.wheelCarousel(500)
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)

    await I.clickPrevTrigger()
    await I.seeIndicatorIsActive(1)
  })

  test("loop=false boundary stress keeps page clamped at first and last pages", async () => {
    await I.controls.bool("loop", false)
    await I.seePrevTriggerIsDisabled()
    await I.seeIndicatorIsActive(0)

    await I.swipeCarousel("right", 420, 450, false)
    await I.holdDrag(70)
    await I.releaseDrag()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)

    await I.wheelCarousel(-500)
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)

    await I.clickNextTrigger()
    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
    await I.seeNextTriggerIsDisabled()

    await I.swipeCarousel("left", 420, 450, false)
    await I.holdDrag(70)
    await I.releaseDrag()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)

    await I.wheelCarousel(500)
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
  })

  test("switching orientation while on page 2 keeps page state and navigation coherent", async () => {
    await I.clickIndicator(2)
    await I.seeIndicatorIsActive(2)
    await I.waitForScrollSettle()

    await I.controls.select("orientation", "vertical")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
    await I.seeNextTriggerIsDisabled()

    await I.clickPrevTrigger()
    await I.seeIndicatorIsActive(1)

    await I.controls.select("orientation", "horizontal")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)

    await I.clickNextTrigger()
    await I.seeIndicatorIsActive(2)
  })

  test("switching dir while mid-page preserves page and remaps keyboard navigation", async () => {
    await I.clickNextTrigger()
    await I.seeIndicatorIsActive(1)

    await I.controls.select("dir", "rtl")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)

    await I.focusIndicator(1)
    await I.pressKey("ArrowLeft")
    await I.seeIndicatorIsActive(2)

    await I.controls.select("dir", "ltr")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)

    await I.focusIndicator(2)
    await I.pressKey("ArrowLeft")
    await I.seeIndicatorIsActive(1)
  })

  test("changing slidesPerPage at runtime clamps and preserves coherent page state", async () => {
    await I.clickIndicator(2)
    await I.seeIndicatorIsActive(2)
    await I.waitForScrollSettle()

    await I.controls.num("slidesPerPage", "3")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(3)
    await I.seeItemInView(4)
    await I.seeItemInView(5)
    await I.seeNextTriggerIsDisabled()

    await I.controls.num("slidesPerPage", "1")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
    await I.seePrevTriggerIsEnabled()
    await I.seeNextTriggerIsEnabled()

    await I.clickNextTrigger()
    await I.seeIndicatorIsActive(2)
  })

  test("slidesPerMove='auto' advances by slidesPerPage", async () => {
    await I.controls.select("slidesPerMove", "auto")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)

    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(2)
    await I.seeItemInView(3)
    await I.dontSeeItemInView(1)
  })

  test("slidesPerMove='1' advances one slide per page transition", async () => {
    await I.controls.select("slidesPerMove", "1")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)

    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(1)
    await I.seeItemInView(2)
    await I.dontSeeItemInView(0)

    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(2)
    await I.seeItemInView(3)
    await I.dontSeeItemInView(1)
  })

  test("slidesPerMove='2' advances two slides per page transition", async () => {
    await I.controls.select("slidesPerMove", "2")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)

    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(2)
    await I.seeItemInView(3)
    await I.dontSeeItemInView(1)

    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)
    await I.dontSeeItemInView(3)
  })

  test("changing slidesPerMove at runtime while mid-page clamps to valid page and keeps controls in sync", async () => {
    await I.controls.select("slidesPerMove", "1")
    await I.waitForScrollSettle()

    await I.clickIndicator(4)
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(4)
    await I.seeItemInView(4)
    await I.seeItemInView(5)

    await I.controls.select("slidesPerMove", "2")
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)
    await I.seeNextTriggerIsDisabled()
  })

  test("click and drag navigation converge to the same page state", async () => {
    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(2)
    await I.seeItemInView(3)

    await I.clickPrevTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)

    await I.swipeCarousel("left", 320, 450, false)
    await I.holdDrag(80)
    await I.releaseDrag()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(2)
    await I.seeItemInView(3)
  })

  test("loop=true wraps both directions at boundaries with coherent indicator state", async () => {
    await I.controls.bool("loop", true)
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)

    await I.clickPrevTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)

    await I.clickNextTrigger()
    await I.waitForScrollSettle()
    await I.seeIndicatorIsActive(0)
    await I.seeItemInView(0)
    await I.seeItemInView(1)
  })

  test("drag release after hold keeps indicator in sync with snapped page", async () => {
    await I.swipeCarousel("left", 320, 500, false)
    await I.holdDrag(180)
    await I.releaseDrag()

    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(2)
    await I.seeItemInView(3)
    await I.dontSeeItemInView(0)
  })

  test("dragging back after hold updates page to previous snap point", async () => {
    await I.clickIndicator(2)
    await I.seeIndicatorIsActive(2)
    await I.waitForScrollSettle()

    await I.swipeCarousel("right", 320, 500, false)
    await I.holdDrag(180)
    await I.releaseDrag()

    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(2)
    await I.seeItemInView(3)
    await I.dontSeeItemInView(4)
  })

  test("repeated drag-hold-release cycles maintain page state", async () => {
    await I.swipeCarousel("left", 320, 500, false)
    await I.holdDrag(120)
    await I.releaseDrag()
    await I.seeIndicatorIsActive(1)

    await I.swipeCarousel("left", 320, 500, false)
    await I.holdDrag(180)
    await I.releaseDrag()
    await I.seeIndicatorIsActive(2)
    await I.seeItemInView(4)
    await I.seeItemInView(5)

    await I.swipeCarousel("right", 320, 500, false)
    await I.holdDrag(150)
    await I.releaseDrag()
    await I.seeIndicatorIsActive(1)
    await I.seeItemInView(2)
    await I.seeItemInView(3)
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
