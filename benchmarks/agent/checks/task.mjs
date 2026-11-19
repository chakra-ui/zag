// The benchmark task through each screen's agent tools, in both panel modes.
import assert from "node:assert/strict"
import { isCorrect } from "../harness/task.mjs"

// Tab by tab, which every bridge can do whether closed panels unmount or stay.
async function tabByTab({ act, snapshot }) {
  const results = [
    await act(
      { ref: "Project name", action: "setValue", args: ["Atlas"] },
      { ref: "Visibility", action: "setValue", args: ["Internal"] },
      { ref: "Settings", action: "setValue", args: ["Members"] },
    ),
    await act(
      { ref: "Priya Shah", action: "press", args: ["Make admin"] },
      { ref: "Tom Becker", action: "press", args: ["Remove"] },
      { ref: "dialog", action: "press", args: ["Remove"] },
      { ref: "Settings", action: "setValue", args: ["Notifications"] },
    ),
    await act({ ref: "accordion", action: "open", args: ["Email"] }),
  ]
  const email = (await snapshot()).filter(
    (entry) => entry.component === "switch" && /Deploy|Weekly/.test(entry.label) && !entry.in?.includes("Slack"),
  )
  results.push(
    await act(...email.map((entry) => ({ ref: entry.ref, action: "setChecked", args: [/Deploy/.test(entry.label)] }))),
  )
  results.push(await act({ ref: "Save settings", action: "press" }))
  return results
}

export default async function ({ open, check }) {
  for (const screen of ["react-zag", "react-ui-sdk"]) {
    for (const panels of ["keep", "unmount"]) {
      await check(`${screen}, panels ${panels}: tab by tab saves the right settings`, async () => {
        const view = await open({ screen, agent: "", panels })
        const results = await tabByTab(view)
        results.forEach((result, index) =>
          assert.equal(result.ok, true, `act ${index}: ${JSON.stringify(result.error ?? result.rejected)}`),
        )
        assert.equal(isCorrect(await view.saved()), true)
        assert.deepEqual(view.errors, [])
        await view.page.close()
      })
    }
  }

  await check("react-zag, panels keep: the whole task in one act, with nothing to look up first", async () => {
    const view = await open({ screen: "react-zag", agent: "", panels: "keep" })
    const result = await view.act(
      { ref: "Project name", action: "setValue", args: ["Atlas"] },
      { ref: "Visibility", action: "setValue", args: ["Internal"] },
      { ref: "Priya Shah", action: "press", args: ["Make admin"] },
      { ref: "Tom Becker", action: "press", args: ["Remove"] },
      { ref: "dialog", action: "press", args: ["Remove"] },
      { ref: "Email Deploy failures", action: "setChecked", args: [true] },
      { ref: "Email Weekly digest", action: "setChecked", args: [false] },
    )
    assert.equal(result.ok, true, JSON.stringify(result.error ?? result.rejected))
    assert.equal(result.rows["Actions for Priya Shah"], "Priya Shah Admin")
    assert.ok(result.removed.includes("Actions for Tom Becker"))
    assert.equal(result.values["Notifications › Email › Deploy failures"], true)
    assert.equal(result.values["Notifications › Email › Weekly digest"], false)
    assert.equal(result.values["Notifications › Slack › Deploy failures"], true)
    assert.equal((await view.act({ ref: "Save settings", action: "press" })).ok, true)
    assert.equal(isCorrect(await view.saved()), true)
    assert.deepEqual(view.errors, [])
    await view.page.close()
  })
}
