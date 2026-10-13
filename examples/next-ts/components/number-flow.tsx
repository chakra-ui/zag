import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

interface NumberFlowProps extends Omit<numberFlow.Props, "id"> {
  className?: string
}

export function NumberFlow(props: NumberFlowProps) {
  const { className, ...machineProps } = props
  const service = useMachine(numberFlow.machine, { id: useId(), ...machineProps })
  const api = numberFlow.connect(service, normalizeProps)

  return (
    <span {...api.getRootProps()} className={className}>
      {api.segments.map((segment) =>
        segment.kind === "digit" ? (
          <span key={segment.key} {...api.getDigitProps({ segment })}>
            <span {...api.getDigitTrackProps({ segment })}>
              {api.digitCells.map((cell) => (
                <span key={cell.index} {...api.getDigitCellProps({ segment, cell })}>
                  {cell.glyph}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={segment.key} {...api.getSymbolProps({ segment })}>
            {segment.value}
          </span>
        ),
      )}
      <span {...api.getValueTextProps()}>{api.announcedValueText}</span>
    </span>
  )
}
