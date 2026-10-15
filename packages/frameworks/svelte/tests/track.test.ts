import { createMachine } from "@zag-js/core"
import { mount, settled, unmount } from "svelte"
import Fixture from "./TrackFixture.svelte"

function createWatchedMachine(onChange: VoidFunction) {
  return createMachine<any>({
    initialState() {
      return "idle"
    },
    states: { idle: {} },
    watch({ track, prop }) {
      track([() => prop("value")], onChange)
    },
  })
}

describe("track", () => {
  test("notifies a prop change made before the watch's first run", async () => {
    const onChange = vi.fn()
    const app = mount(Fixture, {
      target: document.createElement("div"),
      props: { machine: createWatchedMachine(onChange), next: true },
    })
    await settled()

    expect(onChange).toHaveBeenCalledOnce()
    await unmount(app)
  })

  test("does not notify when the prop is unchanged at the first run", async () => {
    const onChange = vi.fn()
    const app = mount(Fixture, {
      target: document.createElement("div"),
      props: { machine: createWatchedMachine(onChange), next: false },
    })
    await settled()

    expect(onChange).not.toHaveBeenCalled()
    await unmount(app)
  })
})
