// What the app sees of an agent's changes, and what it keeps from one, on the react-zag-safety screen.
import assert from "node:assert/strict"

export default async function ({ open, check }) {
  const view = await open({ screen: "react-zag-safety", agent: "" })
  const { page, act, snapshot } = view
  const log = () => page.evaluate(() => window.__log)

  await check('changes made through api methods that take a reason report "agent"', async () => {
    const result = await act(
      { ref: "Help", action: "open", args: ["FAQ"] },
      { ref: "Sections", action: "setValue", args: ["Danger zone"] },
      { ref: "Sections", action: "setValue", args: ["Account"] },
    )
    assert.equal(result.ok, true, JSON.stringify(result.error ?? result.rejected))
    assert.deepEqual((await log()).reasons, ["accordion:agent", "tabs:agent", "tabs:agent"])
  })

  await check("a password is filled but never read back, and isn't taken for a rejection", async () => {
    const entry = (await snapshot()).find((one) => one.label === "Password")
    assert.equal(entry.value, "[redacted]")
    const result = await act({ ref: "Password", action: "setValue", args: ["correct horse"] })
    assert.equal(result.ok, true, JSON.stringify(result.rejected))
    assert.equal(result.values["Account › Password"], "[redacted]")
    assert.ok(!JSON.stringify(result).includes("correct horse"))
    assert.ok(!JSON.stringify(result).includes("hunter2"))
    assert.equal(await page.getByLabel("Password").inputValue(), "correct horse")
  })

  await check("a press marked data-agent-confirm needs a person when nothing allows it", async () => {
    const entry = (await snapshot()).find((one) => one.label === "Delete project")
    assert.equal(entry.confirm, "Deletes the project and all its files")
    const result = await act({ ref: "Delete project", action: "press" })
    assert.equal(result.ok, false)
    assert.match(result.error.message, /^Needs a person: Deletes the project/)
    assert.equal((await log()).deleted, 0)
  })

  await check(
    "registerTools registers three tools with the browser's agent, and its allow decides every step",
    async () => {
      const outcome = await page.evaluate(async () => {
        const tools = {}
        const asked = []
        let approve = false
        document.modelContext = { registerTool: (tool) => void (tools[tool.name] = tool) }
        const unregister = window.__registerTools(window.__agent, {
          allow: (step) => {
            asked.push([step.action, step.label, step.confirm ?? null])
            return !step.confirm || approve
          },
        })
        const steps = { steps: [{ ref: "Delete project", action: "press" }] }
        const refused = await tools.act.execute(steps)
        approve = true
        const approved = await tools.act.execute(steps)
        const read = await tools.snapshot.execute({})
        unregister()
        delete document.modelContext
        return {
          names: Object.keys(tools).sort(),
          annotations: Object.fromEntries(Object.entries(tools).map(([name, tool]) => [name, tool.annotations])),
          refused,
          approved,
          asked,
          read: Array.isArray(read),
          deleted: window.__log.deleted,
        }
      })
      assert.deepEqual(outcome.names, ["act", "query", "snapshot"])
      assert.equal(outcome.annotations.act.consequentialHint, true)
      assert.equal(outcome.annotations.snapshot.readOnlyHint, true)
      assert.equal(outcome.refused.ok, false)
      assert.match(outcome.refused.error.message, /^Not allowed/)
      assert.equal(outcome.approved.ok, true, JSON.stringify(outcome.approved.error))
      assert.deepEqual(outcome.asked, [
        ["press", "Delete project", "Deletes the project and all its files"],
        ["press", "Delete project", "Deletes the project and all its files"],
      ])
      assert.equal(outcome.read, true)
      assert.equal(outcome.deleted, 1)
    },
  )

  await check("registerTools needs an allow, and does nothing without WebMCP", async () => {
    const outcome = await page.evaluate(() => {
      let threw = false
      try {
        window.__registerTools(window.__agent, {})
      } catch {
        threw = true
      }
      const unregister = window.__registerTools(window.__agent, { allow: () => true })
      return { threw, unregister: typeof unregister }
    })
    assert.deepEqual(outcome, { threw: true, unregister: "function" })
  })

  await check("the page threw no errors", async () => assert.deepEqual(view.errors, []))
  await page.close()
}
