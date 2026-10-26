import { createMachine } from "@zag-js/core"
import { VanillaMachine } from "../src/machine"

// Run with: pnpm exec tsx packages/frameworks/vanilla/bench/update-props.ts
// Pass update counts as arguments to measure longer-lived instances.
const counts = process.argv.slice(2).map(Number)
const machine = createMachine<any>({
  initialState: () => "idle",
  states: { idle: {} },
  watch({ prop, track }) {
    track([() => prop("value")], () => {})
  },
})

const results = []
for (const kind of ["object", "function"] as const) {
  for (const updates of counts.length ? counts : [100, 1_000, 2_000, 4_000]) {
    const service = new VanillaMachine(machine, { id: "bench", value: -1 })
    service.start()
    let start = performance.now()
    for (let value = 0; value < updates; value++) {
      service.updateProps(kind === "object" ? { value } : () => ({ value }))
    }
    const updateMs = performance.now() - start

    start = performance.now()
    for (let i = 0; i < 1_000; i++) {
      if (service.prop("value") !== updates - 1) throw new Error("Unexpected prop value")
    }
    results.push({ kind, updates, updateMs: +updateMs.toFixed(2), readMs: +(performance.now() - start).toFixed(2) })
    service.stop()
  }
}
console.table(results)
