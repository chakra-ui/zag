import * as numberFlow from "@zag-js/number-flow"
import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createEffect, createMemo, createSignal, createUniqueId, onCleanup } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/number-flow.css"

export default function Page() {
  const [value, setValue] = createSignal(0)
  const [continuous, setContinuous] = createSignal(true)
  const [playing, setPlaying] = createSignal(true)

  createEffect(() => {
    if (!playing()) return
    const id = setInterval(() => setValue((v) => v + Math.round(Math.random() * 45 + 5)), 900)
    onCleanup(() => clearInterval(id))
  })

  const service = useMachine(numberFlow.machine, {
    id: createUniqueId(),
    get value() {
      return value()
    },
    get continuous() {
      return continuous()
    },
    spinTiming: { duration: "800ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  })

  const api = createMemo(() => numberFlow.connect(service, normalizeProps))

  return (
    <>
      <main class="number-flow">
        <div {...api().getRootProps()}>
          <Key each={api().segments} by={(segment) => segment.key}>
            {(segment) => {
              // `Key` runs this once per key, so the getters must read `segment()` inside the
              // JSX. `Show` hands its child a narrowed accessor; narrowing does not otherwise
              // survive two calls to the same accessor.
              const digit = createMemo(() => {
                const current = segment()
                return numberFlow.isDigitSegment(current) ? current : null
              })
              const symbol = () => segment() as numberFlow.SymbolSegment

              return (
                <Show
                  when={digit()}
                  fallback={<span {...api().getSymbolProps({ segment: symbol() })}>{symbol().value}</span>}
                >
                  {(segment) => (
                    <span {...api().getDigitProps({ segment: segment() })}>
                      <span {...api().getDigitTrackProps({ segment: segment() })}>
                        <For each={api().digitCells}>
                          {(cell) => (
                            <span {...api().getDigitCellProps({ segment: segment(), cell })}>{cell.glyph}</span>
                          )}
                        </For>
                      </span>
                    </span>
                  )}
                </Show>
              )
            }}
          </Key>
          <span {...api().getValueTextProps()}>{api().announcedValueText}</span>
        </div>

        <div class="number-flow__actions">
          <button onClick={() => setPlaying((p) => !p)}>{playing() ? "Pause" : "Play"}</button>
          <button onClick={() => setValue(0)}>Reset</button>
          <label>
            <input type="checkbox" checked={continuous()} onChange={(e) => setContinuous(e.currentTarget.checked)} />
            continuous (spin through intermediates)
          </label>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
