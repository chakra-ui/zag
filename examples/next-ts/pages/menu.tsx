import { useMachine } from "@ui-machines/react"
import { menu } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import styled from "@emotion/styled"

export const Styles = styled("div")({
  '[role="menu"]': {
    maxWidth: "160px",
    backgroundColor: "white",
    borderRadius: "6px",
    padding: "5px",
    boxShadow: "rgb(22 23 24 / 35%) 0px 10px 38px -10px, rgb(22 23 24 / 20%) 0px 10px 20px -15px",
  },

  '[role="menu"]:focus': {
    outline: "2px dashed var(--ring-color)",
    outlineOffset: "-3px",
  },

  '[role="menuitem"]': {
    all: "unset",
    fontSize: "14px",
    lineHeight: 1,
    color: "rgb(87, 70, 175)",
    display: "flex",
    alignItems: "center",
    height: "25px",
    position: "relative",
    userSelect: "none",
    borderRadius: "3px",
    padding: "0px 5px 0px 25px",

    "&[data-selected]": {
      backgroundColor: "rgb(110, 86, 207)",
      color: "rgb(253, 252, 254)",
    },

    "&[data-disabled]": {
      opacity: 0.4,
    },
  },

  "button[aria-controls]:focus": {
    outline: "2px dashed var(--ring-color)",
    outlineOffset: "-3px",
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

  const { menuProps, getItemProps, triggerProps } = menu.connect(state, send)

  return (
    <Styles>
      <StateVisualizer state={state} />
      <button ref={ref} {...triggerProps}>
        Click me
      </button>
      <ul style={{ width: 300 }} {...menuProps}>
        <li {...getItemProps({ id: "menuitem-1" })}>Edit</li>
        <li {...getItemProps({ id: "menuitem-2" })}>Duplicate</li>
        <li {...getItemProps({ id: "menuitem-3" })}>Delete</li>
      </ul>
    </Styles>
  )
}
