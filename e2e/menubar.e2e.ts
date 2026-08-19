import { test } from "@playwright/test"
import { MenubarModel } from "./models/menubar.model"

let I: MenubarModel

test.describe("menubar", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenubarModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("has correct aria roles", async () => {
    await I.seeMenubarRole()
  })

  test("roving tabindex: only the first trigger is tabbable initially", async () => {
    await I.seeTriggerIsTabbable("file")
    await I.seeTriggerIsNotTabbable("edit")
    await I.seeTriggerIsNotTabbable("view")
  })

  test("arrow keys move focus and roving tabindex between triggers", async () => {
    await I.focusTrigger("file")
    await I.pressKey("ArrowRight")
    await I.seeTriggerIsFocused("edit")
    await I.seeTriggerIsTabbable("edit")
    await I.seeTriggerIsNotTabbable("file")

    await I.pressKey("ArrowRight")
    await I.seeTriggerIsFocused("view")

    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("edit")
  })

  test("arrow navigation loops at the ends", async () => {
    await I.focusTrigger("file")
    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("view")
    await I.pressKey("ArrowRight")
    await I.seeTriggerIsFocused("file")
  })

  test("Home/End jump to first/last trigger", async () => {
    await I.focusTrigger("edit")
    await I.pressKey("End")
    await I.seeTriggerIsFocused("view")
    await I.pressKey("Home")
    await I.seeTriggerIsFocused("file")
  })

  test("typeahead jumps focus to the matching trigger", async () => {
    await I.focusTrigger("file")
    await I.pressKey("v")
    await I.seeTriggerIsFocused("view")
    // wait for the typeahead buffer to reset before the next match
    await I.page.waitForTimeout(500)
    await I.pressKey("e")
    await I.seeTriggerIsFocused("edit")
  })

  test("clicking a trigger opens its menu and sets hasOpenMenu", async () => {
    await I.clickTrigger("file")
    await I.seeMenuIsOpen("file")
    await I.seeHasOpenMenu(true)
  })

  test("ArrowDown on a focused trigger opens the menu", async () => {
    await I.focusTrigger("edit")
    await I.pressKey("ArrowDown")
    await I.seeMenuIsOpen("edit")
    await I.seeHasOpenMenu(true)
  })

  test("Escape closes the menu and restores focus to the trigger", async () => {
    await I.clickTrigger("file")
    await I.seeMenuIsOpen("file")
    await I.pressKey("Escape")
    await I.seeMenuIsClosed("file")
    await I.seeHasOpenMenu(false)
    await I.seeTriggerIsFocused("file")
  })

  test("hovering a sibling trigger switches the open menu", async () => {
    await I.clickTrigger("file")
    await I.seeMenuIsOpen("file")
    await I.hoverTrigger("edit")
    await I.seeMenuIsClosed("file")
    await I.seeMenuIsOpen("edit")
    await I.seeHasOpenMenu(true)
  })

  test("ArrowRight switches to the next menu while one is open", async () => {
    await I.clickTrigger("file")
    await I.seeMenuIsOpen("file")
    await I.pressKey("ArrowRight")
    await I.seeMenuIsClosed("file")
    await I.seeMenuIsOpen("edit")
    await I.seeHasOpenMenu(true)
  })

  test("ArrowLeft switches to the previous menu while one is open", async () => {
    await I.clickTrigger("edit")
    await I.seeMenuIsOpen("edit")
    await I.pressKey("ArrowLeft")
    await I.seeMenuIsClosed("edit")
    await I.seeMenuIsOpen("file")
    await I.seeHasOpenMenu(true)
  })

  test("can arrow-switch across multiple menus consecutively", async () => {
    await I.clickTrigger("file")
    await I.seeMenuIsOpen("file")
    await I.pressKey("ArrowRight")
    await I.seeMenuIsOpen("edit")
    await I.pressKey("ArrowRight")
    await I.seeMenuIsOpen("view")
    await I.seeMenuIsClosed("edit")
    await I.pressKey("ArrowRight")
    await I.seeMenuIsOpen("file")
  })

  test("a disabled menubar disables all its triggers", async () => {
    await I.goto("/menubar/basic?disabled=true")
    await I.seeMenubarIsDisabled()
    await I.seeTriggerIsDisabled("file")
    await I.seeTriggerIsDisabled("edit")
    await I.seeTriggerIsDisabled("view")
  })

  test.describe("nested submenu", () => {
    test.beforeEach(async () => {
      await I.goto("/menubar/nested")
    })

    test("ArrowRight on a submenu trigger opens the submenu instead of switching menus", async () => {
      await I.clickTrigger("edit")
      await I.seeMenuIsOpen("edit")
      // last item is the "Find" submenu trigger
      await I.pressKey("ArrowUp")
      await I.seeItemIsHighlighted("find:trigger")
      await I.pressKey("ArrowRight")
      await I.seeSubmenuIsOpen("find:content")
      await I.seeMenuIsOpen("edit")
      await I.seeMenuIsClosed("view")
    })

    test("ArrowLeft inside the submenu closes it back to the parent menu", async () => {
      await I.clickTrigger("edit")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowRight")
      await I.seeSubmenuIsOpen("find:content")
      await I.pressKey("ArrowLeft")
      await I.seeSubmenuIsClosed("find:content")
      await I.seeMenuIsOpen("edit")
      await I.seeMenuIsClosed("file")
    })

    test("ArrowRight on a regular item still switches to the next menu", async () => {
      await I.clickTrigger("edit")
      await I.pressKey("Home")
      await I.seeItemIsHighlighted("undo")
      await I.pressKey("ArrowRight")
      await I.seeMenuIsClosed("edit")
      await I.seeMenuIsOpen("view")
    })

    test("ArrowRight on a leaf item inside the submenu closes the chain and switches to the next menu", async () => {
      await I.clickTrigger("edit")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowRight")
      await I.seeSubmenuIsOpen("find:content")
      await I.seeItemIsHighlighted("find-text")
      // leaf item -> closes the submenu and parent, opens the next menubar menu
      await I.pressKey("ArrowRight")
      await I.seeSubmenuIsClosed("find:content")
      await I.seeMenuIsClosed("edit")
      await I.seeMenuIsOpen("view")
    })
  })

  test.describe("vertical orientation", () => {
    test.beforeEach(async () => {
      await I.goto("/menubar/vertical")
    })

    test("Up/Down move focus between triggers without opening", async () => {
      await I.focusTrigger("file")
      await I.pressKey("ArrowDown")
      await I.seeTriggerIsFocused("edit")
      await I.seeMenuIsClosed("edit")
      await I.pressKey("ArrowUp")
      await I.seeTriggerIsFocused("file")
    })

    test("ArrowRight opens the focused menu (fly-out)", async () => {
      await I.focusTrigger("edit")
      await I.pressKey("ArrowRight")
      await I.seeMenuIsOpen("edit")
    })

    test("ArrowLeft closes the menu back to its trigger", async () => {
      await I.focusTrigger("edit")
      await I.pressKey("ArrowRight")
      await I.seeMenuIsOpen("edit")
      await I.pressKey("ArrowLeft")
      await I.seeMenuIsClosed("edit")
      await I.seeTriggerIsFocused("edit")
    })

    test("switching siblings: close to trigger, step down, reopen", async () => {
      await I.focusTrigger("edit")
      await I.pressKey("ArrowRight")
      await I.seeMenuIsOpen("edit")
      await I.pressKey("ArrowLeft")
      await I.pressKey("ArrowDown")
      await I.seeTriggerIsFocused("view")
      await I.pressKey("ArrowRight")
      await I.seeMenuIsOpen("view")
      await I.seeMenuIsClosed("edit")
    })
  })
})
