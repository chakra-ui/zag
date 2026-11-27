import { test } from "./_test"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

const sides = [
  { swipeDirection: "up", dir: "ltr", side: "up" },
  { swipeDirection: "start", dir: "ltr", side: "left" },
  { swipeDirection: "end", dir: "ltr", side: "right" },
  { swipeDirection: "start", dir: "rtl", side: "right" },
  { swipeDirection: "end", dir: "rtl", side: "left" },
] as const

for (const { swipeDirection, dir, side } of sides) {
  test.describe(`drawer / sides / ${swipeDirection} ${dir}`, () => {
    test.beforeEach(async ({ page }) => {
      I = new DrawerModel(page)
      await I.goto()
      await I.controls.select("swipeDirection", swipeDirection)
      await I.controls.select("dir", dir)
      await I.clickTrigger()
      await I.waitForOpenState()
    })

    test(`opens from the ${side} edge and closes when swiped toward it`, async () => {
      await I.seeSide(side)
      await I.mouseDragGrabberToward({ direction: side })
      await I.waitForClosedState()
      await I.dontSeeContent()
    })
  })
}
