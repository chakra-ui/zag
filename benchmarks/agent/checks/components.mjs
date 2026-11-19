// Every component the bridge describes beyond the benchmark's own, on the react-zag-components screen: each is
// listed, and each action drives its machine.
import assert from "node:assert/strict"

export default async function ({ open, check }) {
  const view = await open({ screen: "react-zag-components", agent: "" })
  const { page, act, snapshot } = view
  const log = () => page.evaluate(() => window.__log)
  const entryOf = async (label) => {
    const entry = (await snapshot()).find((one) => one.label === label)
    assert.ok(entry, `${label} isn't listed`)
    return entry
  }
  const run = async (...steps) => {
    const result = await act(...steps)
    assert.equal(result.ok, true, JSON.stringify(result.error ?? result.rejected))
    return result
  }
  // Acts, then checks the state the component now reports.
  const expectState = async (label, steps, state) => {
    await run(...steps.map((step) => ({ ref: label, ...step })))
    const entry = await entryOf(label)
    for (const [key, value] of Object.entries(state)) assert.deepEqual(entry[key], value, `${label} ${key}`)
  }

  await check("every described component is listed, and a hidden input isn't taken for a field", async () => {
    const entries = await snapshot()
    const kinds = new Set(entries.map((entry) => entry.component))
    for (const kind of [
      "radio-group",
      "toggle-group",
      "toggle",
      "slider",
      "angle-slider",
      "number-input",
      "pin-input",
      "password-input",
      "editable",
      "tags-input",
      "combobox",
      "listbox",
      "gridlist",
      "cascade-select",
      "date-picker",
      "date-input",
      "color-picker",
      "rating-group",
      "file-upload",
      "tree-view",
      "collapsible",
      "popover",
      "drawer",
      "floating-panel",
      "hover-card",
      "tooltip",
      "navigation-menu",
      "pagination",
      "steps",
      "carousel",
      "splitter",
      "timer",
    ]) {
      assert.ok(kinds.has(kind), `no ${kind}`)
    }
    assert.ok(
      entries.every((entry) => entry.label),
      `unnamed: ${entries.filter((entry) => !entry.label).map((e) => e.ref)}`,
    )
    assert.deepEqual(
      entries.filter((entry) => entry.component === "field").map((entry) => entry.label),
      [],
      "only Zag parts are on this screen",
    )
    assert.deepEqual(view.errors, [])
  })

  await check("radio group, toggle group and toggle", async () => {
    await expectState("Plan", [{ action: "setValue", args: ["Pro"] }], { value: "pro" })
    await expectState(
      "Text style",
      [
        { action: "setValue", args: [["Bold", "Italic"]] },
        { action: "toggle", args: ["Bold"] },
      ],
      { value: ["italic"] },
    )
    await expectState("Mute", [{ action: "toggle" }], { pressed: true })
  })

  await check("sliders and a number input, with a value the slider rounds reported as rejected", async () => {
    await expectState("Volume", [{ action: "setValue", args: [40] }], { value: 40 })
    const rounded = await act({ ref: "Volume", action: "setValue", args: [42] })
    assert.equal(rounded.ok, false)
    assert.equal(rounded.rejected[0].requested, 42)
    assert.notEqual(rounded.rejected[0].committed, 42)
    await expectState("Rotation", [{ action: "setValue", args: [90] }], { value: 90 })
    await expectState("Seats", [{ action: "setValue", args: [4] }, { action: "increment" }], { value: 5 })
  })

  await check("a pin input, and a one-time code and a password that are filled but never read back", async () => {
    await expectState("Room code", [{ action: "setValue", args: ["1234"] }], { value: "1234" })
    const code = await run({ ref: "Verification code", action: "setValue", args: ["9876"] })
    assert.ok(!JSON.stringify(code).includes("9876"))
    assert.equal((await entryOf("Verification code")).value, "[redacted]")
    const password = await run({ ref: "New password", action: "setValue", args: ["hunter3"] })
    assert.ok(!JSON.stringify(password).includes("hunter3"))
    assert.ok(!JSON.stringify(await snapshot()).includes("old-secret"))
    assert.equal(await page.getByLabel("New password").inputValue(), "hunter3")
  })

  await check("editable and tags input", async () => {
    await expectState("Board title", [{ action: "setValue", args: ["Roadmap"] }], { value: "Roadmap" })
    await expectState(
      "Labels",
      [
        { action: "add", args: ["ui"] },
        { action: "remove", args: ["bug"] },
      ],
      { value: ["ui"] },
    )
  })

  await check("combobox, listbox, gridlist and cascade select pick by label", async () => {
    await expectState("Fruit", [{ action: "setValue", args: ["Banana"] }], { value: "Banana" })
    await expectState("Office", [{ action: "setValue", args: ["Oslo"] }], { value: "Oslo" })
    await expectState("Mailboxes", [{ action: "setValue", args: ["Archive"] }], { value: "Archive" })
    await expectState("Location", [{ action: "setValue", args: ["Kyoto"] }], { value: "Japan / Kyoto" })
  })

  await check("dates take ISO strings, and a color takes any CSS color", async () => {
    await expectState("Due date", [{ action: "setValue", args: ["2026-12-24"] }], { value: "2026-12-24" })
    await expectState("Start date", [{ action: "setValue", args: ["2027-01-05"] }], { value: "2027-01-05" })
    await run({ ref: "Brand color", action: "setValue", args: ["#ff0000"] })
    assert.equal((await entryOf("Brand color")).value, "rgba(255, 0, 0, 1)")
  })

  await check("rating, file upload and tree view", async () => {
    await expectState("Rating", [{ action: "setValue", args: [4] }], { value: 4 })
    await run({ ref: "Add sample files", action: "press" })
    await expectState("Attachments", [{ action: "remove", args: ["notes.txt"] }], { value: ["photo.png"] })
    await expectState(
      "Project files",
      [
        { action: "expand", args: ["src"] },
        { action: "select", args: ["app.tsx"] },
      ],
      { value: ["src/app.tsx"], expanded: ["src"] },
    )
  })

  await check("a collapsible opens, and the field inside it can then be filled", async () => {
    await run(
      { ref: "Advanced options", action: "open" },
      { ref: "Proxy URL", action: "setValue", args: ["http://proxy.local"] },
    )
    assert.equal(await page.getByLabel("Proxy URL").inputValue(), "http://proxy.local")
  })

  await check("popups press their own buttons", async () => {
    // A popover opens itself to press one.
    await run({ ref: "Share link", action: "press", args: ["Copy link"] })
    await run({ ref: "Share link", action: "close" })
    await run({ ref: "Cart", action: "open" }, { ref: "Cart", action: "press", args: ["Checkout"] })
    await run({ ref: "Cart", action: "close" })
    await run({ ref: "Notes", action: "open" }, { ref: "Notes", action: "press", args: ["Pin"] })
    await run({ ref: "Notes", action: "close" })
    await run({ ref: "Archive", action: "press" })
    assert.deepEqual((await log()).pressed, ["copy link", "checkout", "pin", "archive"])
  })

  await check("a hover card shows what it says when opened", async () => {
    await expectState("@ada", [{ action: "open" }], { open: true })
    assert.deepEqual((await entryOf("@ada")).text, ["Ada Lovelace, first programmer"])
  })

  await check("navigation menu, pagination, steps, carousel and splitter", async () => {
    await expectState("Main", [{ action: "open", args: ["Products"] }], { open: "products" })
    await expectState("Main", [{ action: "close" }], { open: null })
    await expectState("Results pages", [{ action: "setPage", args: [3] }, { action: "next" }], { page: 4 })
    await expectState("Signup", [{ action: "setValue", args: ["Profile"] }, { action: "next" }], { value: "review" })
    await expectState("Gallery", [{ action: "scrollTo", args: [2] }], { page: 2 })
    await expectState("Layout", [{ action: "resize", args: ["sidebar", 30] }], { sizes: [30, 70] })
  })

  await check("a timer starts and pauses", async () => {
    await expectState("Stopwatch", [{ action: "start" }], { running: true })
    await expectState("Stopwatch", [{ action: "pause" }], { paused: true })
  })

  await check("a toast is listed with its text, and presses its action", async () => {
    const result = await run({ ref: "Delete message", action: "press" })
    assert.ok(
      result.added?.some((line) => line.includes("toast: Message deleted")),
      JSON.stringify(result.added),
    )
    await run({ ref: "Message deleted", action: "press", args: ["Undo"] })
    assert.ok((await log()).pressed.includes("undo"))
  })
}
