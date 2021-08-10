import { useMachine } from "@ui-machines/react"
import { menu } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      uid: "234",
      onSelect: console.log,
    }),
  )

  const ref = useMount<HTMLButtonElement>(send)

  const { menuListProps, getMenuItemProps, menuButtonProps } = menu.connect(
    state,
    send,
  )

  return (
    <div className="App">
      <StateVisualizer state={state} />
      <button ref={ref} {...menuButtonProps}>
        Click me
      </button>
      <ul style={{ width: 300 }} {...menuListProps}>
        <li {...getMenuItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...getMenuItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...getMenuItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>
    </div>
  )
}
