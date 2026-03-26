import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/collapsible.module.css"
import { LuChevronsUpDown } from "react-icons/lu"

interface CollapsibleProps extends Omit<collapsible.Props, "id"> {}

export function Collapsible(props: CollapsibleProps) {
  const service = useMachine(collapsible.machine, {
    id: useId(),
    ...props,
  })

  const api = collapsible.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Click to Toggle
        <LuChevronsUpDown />
      </button>
      <div className={styles.Content} {...api.getContentProps()}>
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna sfsd. Ut enim ad minimdfd
          v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
          sunt in culpa qui officia deserunt mollit anim id est laborum.{" "}
          <a href="#">Some Link</a>
        </p>
      </div>
    </div>
  )
}
