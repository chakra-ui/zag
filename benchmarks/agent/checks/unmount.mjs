// How Zag's bridge reports a page whose closed tabs unmount: compact additions, remembered values,
// reopening a tab for a remembered field, removals and row changes.
import assert from "node:assert/strict"
import { isCorrect } from "../harness/task.mjs"

export default async function ({ open, check }) {
  const view = await open({ screen: "react-zag", agent: "", panels: "unmount" })
  const { act, snapshot } = view

  await check("the first snapshot lists only what's on the General tab", async () => {
    const labels = (await snapshot()).map((entry) => entry.label)
    assert.deepEqual(labels.sort(), ["Project name", "Save settings", "Settings", "Visibility"])
  })

  await check(
    "opening a tab lists what came onto the page as one line each, and keeps the closed tab's values",
    async () => {
      const result = await act(
        { ref: "Project name", action: "setValue", args: ["Atlas"] },
        { ref: "Visibility", action: "setValue", args: ["Internal"] },
        { ref: "Settings", action: "setValue", args: ["Members"] },
      )
      assert.equal(result.ok, true)
      assert.equal(result.added.length, 24)
      assert.ok(
        result.added.every((line) => typeof line === "string" && line.length < 60),
        result.added[0],
      )
      assert.ok(
        result.added.some((line) => line.endsWith("menu: Actions for Priya Shah [Make admin, Remove]")),
        "a menu's line lists its items",
      )
      assert.equal(result.removed, undefined, "a closed tab's fields aren't removed")
      assert.equal(result.values["General › Project name"], "Atlas")
      assert.equal(result.values["General › Visibility"], "Internal")
    },
  )

  await check("a closed tab's fields show in the snapshot as offPage, with their values", async () => {
    const offPage = (await snapshot()).filter((entry) => entry.offPage)
    assert.deepEqual(offPage.map((entry) => [entry.label, entry.value]).sort(), [
      ["Project name", "Atlas"],
      ["Visibility", "Internal"],
    ])
  })

  await check("removals and row changes are reported even when a later step closes their tab", async () => {
    const result = await act(
      { ref: "Priya Shah", action: "press", args: ["Make admin"] },
      { ref: "Tom Becker", action: "press", args: ["Remove"] },
      { ref: "dialog", action: "press", args: ["Remove"] },
      { ref: "Project name", action: "setValue", args: ["Atlas"] },
      { ref: "Settings", action: "setValue", args: ["Notifications"] },
    )
    assert.equal(result.ok, true, JSON.stringify(result.error))
    assert.equal(result.rows["Actions for Priya Shah"], "Priya Shah Admin")
    assert.deepEqual(result.removed.sort(), ["Actions for Tom Becker", "Remove Tom Becker?"])
    assert.equal(result.done[3], 'setValue ["Atlas"] on Project name', "a remembered field reopens its tab")
  })

  await check("a component never seen fails with the sections that may hold it", async () => {
    const result = await act({ ref: "Push Deploy failures", action: "setChecked", args: [true] })
    assert.equal(result.ok, false)
    assert.match(result.error.message, /It may be behind one of these.*accordion \(c\d+\): Email, Slack/)
  })

  await check("a name that starts with a closed section's opens that section first", async () => {
    const result = await act({ ref: "Email Deploy failures", action: "setChecked", args: [true] })
    assert.equal(result.ok, true, JSON.stringify(result.error))
    assert.equal(result.values["Notifications › Email › Deploy failures"], true)
  })

  await check("the task finishes and saves the right settings", async () => {
    const result = await act(
      { ref: "accordion", action: "open", args: ["Email"] },
      { ref: "Email Deploy failures", action: "setChecked", args: [true] },
      { ref: "Email Weekly digest", action: "setChecked", args: [false] },
      { ref: "Save settings", action: "press" },
    )
    assert.equal(result.ok, true, JSON.stringify(result.error ?? result.rejected))
    assert.equal(isCorrect(await view.saved()), true)
    assert.deepEqual(view.errors, [])
  })

  await view.page.close()
}
