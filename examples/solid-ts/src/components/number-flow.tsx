import * as numberFlow from "@zag-js/number-flow"
import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For, Show, splitProps } from "solid-js"

interface NumberFlowProps extends Omit<numberFlow.Props, "id"> {
  class?: string
}

export function NumberFlow(props: NumberFlowProps) {
  const [local, machineProps] = splitProps(props, ["class"])
  const id = createUniqueId()
  const service = useMachine(numberFlow.machine, () => ({ id, ...machineProps }))
  const api = createMemo(() => numberFlow.connect(service, normalizeProps))

  return (
    <span {...api().getRootProps()} class={local.class}>
      <Key each={api().segments} by={(segment) => segment.key}>
        {(segment) => {
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
                      {(cell) => <span {...api().getDigitCellProps({ segment: segment(), cell })}>{cell.glyph}</span>}
                    </For>
                  </span>
                </span>
              )}
            </Show>
          )
        }}
      </Key>
      <span {...api().getValueTextProps()}>{api().announcedValueText}</span>
    </span>
  )
}
