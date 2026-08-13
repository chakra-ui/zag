import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/number-flow.module.css"

interface NumberFlowProps extends Omit<numberFlow.Props, "id"> {}

export function NumberFlow(props: NumberFlowProps) {
  const service = useMachine(numberFlow.machine, {
    id: useId(),
    defaultValue: 1234,
    ...props,
  })

  const api = numberFlow.connect(service, normalizeProps)

  return (
    <div className={styles.Wrapper}>
      <div className={styles.Root} {...api.getRootProps()}>
        {api.segments.map((segment) =>
          segment.kind === "digit" ? (
            <span
              key={segment.key}
              className={styles.Digit}
              {...api.getDigitProps({ segment })}
            >
              <span {...api.getDigitTrackProps({ segment })}>
                {api.digitCells.map((cell) => (
                  <span
                    key={cell.index}
                    className={styles.Cell}
                    {...api.getDigitCellProps({ segment, cell })}
                  >
                    {cell.glyph}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span
              key={segment.key}
              className={styles.Symbol}
              {...api.getSymbolProps({ segment })}
            >
              {segment.value}
            </span>
          ),
        )}
        <span {...api.getValueTextProps()}>{api.announcedValueText}</span>
      </div>

      <div className={styles.Actions}>
        <button
          className={styles.Button}
          onClick={() => api.setValue(api.value - 1234)}
        >
          Decrement
        </button>
        <button
          className={styles.Button}
          onClick={() => api.setValue(api.value + 1234)}
        >
          Increment
        </button>
        <button
          className={styles.Button}
          onClick={() => api.setValue(Math.round(Math.random() * 99999))}
        >
          Randomize
        </button>
      </div>
    </div>
  )
}
