import { test } from "@playwright/test"
import { controls } from "./_utils"
import { RatingGroupModel } from "./models/rating-group.model"

let I: RatingGroupModel

test.describe("rating / pointer", () => {
  test.beforeEach(async ({ page }) => {
    I = new RatingGroupModel(page)
    await I.goto()
  })

  test("should be accessible", async () => {
    await I.checkAccessibility()
  })

  test("should set value when item is clicked", async () => {
    await I.clickRating(4)
    await I.seeInputHasValue("4")
  })

  test.skip("highlight when hovered", async () => {
    await I.hoverRating(4)
    await I.seeRatingIsHighlighted(4)

    await I.hoverOut()
    await I.seeRatingIsHighlighted(3)

    await I.hoverRating(4)
    await I.clickRating(4)
    await I.seeInputHasValue("4")
  })

  test("clicking label should focus 3rd item", async () => {
    await I.clickLabel()
    await I.seeRatingIsFocused(3)
  })
})

test.describe("rating / properties", () => {
  test.beforeEach(async ({ page }) => {
    I = new RatingGroupModel(page)
    await I.goto()
  })

  test("should not be selectable when disabled", async () => {
    await controls(I.page).bool("disabled")
    await I.seeControlIsDisabled()
    await I.seeAllRatingsAreDisabled()
  })

  test("should not be selectable when is readonly", async () => {
    await controls(I.page).bool("readOnly")
    await I.seeAllRatingsAreReadonly()
  })
})

test.describe("rating / keyboard", () => {
  test.beforeEach(async ({ page }) => {
    I = new RatingGroupModel(page)
    await I.goto()
  })

  test("should select value on arrow left/right", async () => {
    await I.focusRating(3)

    await I.pressKey("ArrowRight")
    await I.pressKey("ArrowRight")
    await I.seeRatingIsFocused(4)

    await I.pressKey("ArrowLeft")
    await I.pressKey("ArrowLeft")
    await I.seeRatingIsFocused(3)
  })

  test("should select value on arrow home/end", async () => {
    await I.focusRating(3)

    await I.pressKey("Home")
    await I.seeRatingIsFocused(1)
    await I.seeRatingIsHighlighted(1)

    await I.pressKey("End")
    await I.seeRatingIsFocused(5)
    await I.seeRatingIsHighlighted(5)
  })

  test("should remain focusable when value is 0", async () => {
    await I.focusRating(3)

    // decrease value to 0
    await I.pressKey("ArrowLeft", 5)
    await I.seeInputHasValue("0")

    // blur and verify first item is still focusable
    await I.pressKey("Tab")
    await I.seeRatingIsFocusable(1)
  })
})
