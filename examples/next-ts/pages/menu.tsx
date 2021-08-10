import { useMachine } from "@ui-machines/react"
import { menu } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import styled from "@emotion/styled"

const Styles = styled("div")({
  '[role="menu"]': {
    marginTop: "10px",
    listStyleType: "none",
    padding: "8px",
    maxWidth: "160px",
    background: "#413c3c",
    borderRadius: "4px",
    color: "#fbf9f5",
  },
  '[role="menu"]:focus': {
    outline: "2px solid transparent",
    outlineOffset: "3px",
    boxShadow: "0 0 0 3px var(--ring-color)",
  },
  '[role="menuitem"]': {
    userSelect: "none",
    cursor: "default",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  '[role="menuitem"][data-selected="true"]': {
    background: "rgba(196, 196, 196, 0.2)",
  },
  "button[aria-controls]": {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "0",
    background: "wheat",
    fontSize: "1rem",
    fontWeight: 500,
  },
  "button[aria-controls]:focus": {
    outline: "2px solid transparent",
    outlineOffset: "3px",
    boxShadow: "0 0 0 3px var(--ring-color)",
  },
})

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      uid: "234",
      onSelect: console.log,
    }),
  )

  const ref = useMount<HTMLButtonElement>(send)

  const { menuListProps, getMenuItemProps, menuButtonProps } = menu.connect(state, send)

  return (
    <Styles>
      <StateVisualizer state={state} />
      <button ref={ref} {...menuButtonProps}>
        Click me
      </button>
      <ul style={{ width: 300 }} {...menuListProps}>
        <li {...getMenuItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...getMenuItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...getMenuItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>
    </Styles>
  )
}
