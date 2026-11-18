// A change the page refused or changed shows in `act`'s rejected, on the react-zag-rejects screen.
import assert from "node:assert/strict"

export default async function ({ open, check }) {
  const { page, errors, act, snapshot } = await open({ screen: "react-zag-rejects", agent: "" })
  const checkedOf = async (label) => (await snapshot()).find((entry) => entry.label === label)?.checked

  await check("a refused toggle is rejected, and the snapshot keeps the original value", async () => {
    const result = await act({ ref: "Always off", action: "toggle" })
    assert.equal(result.ok, false)
    assert.equal(result.error, undefined)
    assert.deepEqual(result.rejected, [
      { step: 0, ref: result.rejected[0].ref, label: "Always off", requested: true, committed: false },
    ])
    assert.deepEqual(result.changed, {})
    assert.equal(await checkedOf("Always off"), false)
  })

  await check("a refused setChecked is rejected", async () => {
    const result = await act({ ref: "Always off", action: "setChecked", args: [true] })
    assert.equal(result.ok, false)
    assert.equal(result.rejected?.[0]?.requested, true)
    assert.equal(result.rejected?.[0]?.committed, false)
  })

  await check("an accepted change is in changed, with nothing rejected", async () => {
    const result = await act({ ref: "Only on", action: "setChecked", args: [true] })
    assert.equal(result.ok, true)
    assert.equal(result.rejected, undefined)
    assert.equal(result.changed["Only on"], true)
    assert.equal(await checkedOf("Only on"), true)
  })

  await check("the same component refusing the other way is rejected", async () => {
    const result = await act({ ref: "Only on", action: "setChecked", args: [false] })
    assert.equal(result.ok, false)
    assert.equal(result.rejected?.[0]?.requested, false)
    assert.equal(result.rejected?.[0]?.committed, true)
  })

  await check("a value the page changed to something else shows both values", async () => {
    const result = await act({ ref: "Coerced", action: "setChecked", args: [true] })
    assert.equal(result.ok, false)
    assert.equal(result.rejected?.[0]?.requested, true)
    assert.equal(result.rejected?.[0]?.committed, "indeterminate")
    assert.equal(result.changed["Coerced"], "indeterminate")
    assert.equal(await checkedOf("Coerced"), "indeterminate")
  })

  await check("a rejection doesn't stop the steps after it, and each is reported", async () => {
    const result = await act(
      { ref: "Always off", action: "setChecked", args: [true] },
      { ref: "Only on", action: "setChecked", args: [true] },
      { ref: "Coerced", action: "setChecked", args: [false] },
    )
    assert.equal(result.ok, false)
    assert.equal(result.done.length, 3)
    assert.deepEqual(
      result.rejected.map((rejection) => [rejection.step, rejection.label, rejection.requested, rejection.committed]),
      [
        [0, "Always off", true, false],
        [2, "Coerced", false, "indeterminate"],
      ],
    )
  })

  await check("the page threw no errors", async () => assert.deepEqual(errors, []))
  await page.close()
}
