import { defineComponent, h, Fragment, computed } from "vue"
import { menu } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { css } from "@emotion/css"

const styles = css({
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
  '[role="menuitem"][data-selected]': {
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

export default defineComponent({
  name: "Menu",
  setup() {
    const [state, send] = useMachine(
      menu.machine.withContext({
        uid: "234",
        onSelect: console.log,
      }),
    )
    const _ref = useMount(send)

    const connect = computed(() => menu.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <div className={styles}>
          <button ref={_ref} {...connect.value.triggerProps}>
            Click me
          </button>
          <ul style={{ width: 300 }} {...connect.value.menuProps}>
            <li {...connect.value.getItemProps({ id: "menuitem-1" })}>Edit</li>
            <li {...connect.value.getItemProps({ id: "menuitem-2" })}>Duplicate</li>
            <li {...connect.value.getItemProps({ id: "menuitem-3" })}>Delete</li>
          </ul>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
