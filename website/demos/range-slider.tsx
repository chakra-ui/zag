import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/slider.module.css"

interface RangeSliderProps extends Omit<slider.Props, "id"> {}

export function RangeSlider(props: RangeSliderProps) {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "quantity",
    defaultValue: [10, 60],
    ...props,
    thumbSize: { width: 20, height: 20 },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div>
        <label className={styles.Label} {...api.getLabelProps()}>
          Quantity
        </label>
        <output className={styles.ValueText} {...api.getValueTextProps()}>
          <b>{api.value.join(" - ")}</b>
        </output>
      </div>

      <div className={styles.Control} {...api.getControlProps()}>
        <div className={styles.Track} {...api.getTrackProps()}>
          <div className={styles.Range} {...api.getRangeProps()} />
        </div>
        {api.value.map((_, index) => (
          <div
            className={styles.Thumb}
            key={index}
            {...api.getThumbProps({ index })}
          >
            <input {...api.getHiddenInputProps({ index })} />
          </div>
        ))}
      </div>
    </div>
  )
}
