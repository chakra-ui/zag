import * as numberFlow from "@zag-js/number-flow"
import { numberFlowControls } from "@zag-js/shared"
import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/number-flow.css"

export default function Page() {
  const controls = useControls(numberFlowControls)
  const [animations, setAnimations] = createSignal({ started: 0, completed: 0 })

  const service = useMachine(
    numberFlow.machine,
    controls.mergeProps<numberFlow.Props>({
      id: createUniqueId(),
      defaultValue: 1234,
      onAnimationStart() {
        setAnimations((prev) => ({ ...prev, started: prev.started + 1 }))
      },
      onAnimationComplete() {
        setAnimations((prev) => ({ ...prev, completed: prev.completed + 1 }))
      },
    }),
  )

  const api = createMemo(() => numberFlow.connect(service, normalizeProps))

  const randomDelta = () => Math.round(Math.random() * 900 + 1)

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
          <button onClick={() => api().setValue(api().value - randomDelta())}>Decrement</button>
          <button onClick={() => api().setValue(api().value + randomDelta())}>Increment</button>
          <button onClick={() => api().setValue(Math.round(Math.random() * 99999))}>Randomize</button>
          <button onClick={() => api().setValue(0)}>Reset</button>
          <span class="number-flow__value" data-testid="value">
            value: {api().value} {api().animating ? "(rolling)" : ""}
          </span>
          <span class="number-flow__value" data-testid="animations">
            animations: {animations().started} started / {animations().completed} completed
          </span>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
