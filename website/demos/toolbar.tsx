import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggleGroup from "@zag-js/toggle-group"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import {
  RxClipboard,
  RxCopy,
  RxFontBold,
  RxFontItalic,
  RxScissors,
  RxUnderline,
} from "react-icons/rx"
import styles from "../styles/machines/toolbar.module.css"

const formats = [
  { value: "bold", label: "Bold", icon: RxFontBold },
  { value: "italic", label: "Italic", icon: RxFontItalic },
  { value: "underline", label: "Underline", icon: RxUnderline },
]

const actions = [
  { value: "cut", label: "Cut", icon: RxScissors },
  { value: "copy", label: "Copy", icon: RxCopy },
  { value: "paste", label: "Paste", icon: RxClipboard },
]

function FormatGroup(props: { api: toolbar.Api }) {
  const { api: toolbarApi } = props
  const service = useMachine(toggleGroup.machine, {
    id: useId(),
    multiple: true,
    defaultValue: ["bold"],
    disabled: toolbarApi.disabled,
    orientation: toolbarApi.orientation,
  })
  const api = toggleGroup.connect(service, normalizeProps)

  return (
    <div className={styles.Group} {...api.getRootProps()}>
      {formats.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          className={styles.Item}
          aria-label={label}
          {...api.getItemProps({ value })}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}

interface ToolbarProps extends Omit<toolbar.Props, "id"> {}

export function Toolbar(props: ToolbarProps) {
  const service = useMachine(toolbar.machine, { id: useId(), ...props })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <div
      className={styles.Root}
      aria-label="Text formatting"
      {...api.getRootProps()}
    >
      <FormatGroup api={api} />

      <div className={styles.Separator} {...api.getSeparatorProps()} />

      <div
        className={styles.Group}
        {...api.getGroupProps({ value: "clipboard" })}
      >
        {actions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            className={styles.Item}
            aria-label={label}
            {...api.getItemProps({ value })}
          >
            <Icon />
          </button>
        ))}
      </div>
    </div>
  )
}
