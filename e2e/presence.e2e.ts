import { test } from "./_test"
import { PresenceModel } from "./models/presence.model"

let I: PresenceModel

test.describe("presence", () => {
  test.beforeEach(async ({ page }) => {
    I = new PresenceModel(page)
    await I.goto()
  })

  test("should unmount after the exit animation", async () => {
    await I.clickToggle()
    await I.seeContentIsOpen()

    await I.clickToggle()
    await I.seeContentExitCompleted()
  })

  test("should play the exit animation when closed during the enter animation", async () => {
    await I.closeContentDuringEnter()
    await I.seeContentExitCompleted()
  })

  test("should unmount when the exit animation is cancelled", async () => {
    await I.clickToggle()
    await I.seeContentIsOpen()

    await I.cancelContentExit()
    await I.clickToggle()
    await I.seeContentExitCancelled()
  })

  test("should stay mounted when reopened during the exit animation", async () => {
    await I.clickToggle()
    await I.seeContentIsOpen()

    await I.clickToggle()
    await I.clickToggle()
    await I.seeContentIsOpen()
    await I.seeContentIsMounted()
  })

  test("should settle on the last state after rapid toggling", async () => {
    await I.toggleRapidly(9)
    await I.seeContentIsOpen()
    await I.seeContentIsMounted()

    await I.toggleRapidly(9)
    await I.seeContentIsUnmounted()
  })
})
