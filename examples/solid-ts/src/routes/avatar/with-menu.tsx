import * as avatar from "@zag-js/avatar"
import * as menu from "@zag-js/menu"
import { avatarData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/avatar.css"
import "@styles/menu.css"

const triggerStyle = {
  border: "none",
  background: "none",
  padding: "0",
  "border-radius": "9999px",
  cursor: "pointer",
}

export default function Page() {
  const avatarService = useMachine(avatar.machine, { id: createUniqueId() })
  const avatarApi = createMemo(() => avatar.connect(avatarService, normalizeProps))

  const menuService = useMachine(menu.machine, { id: createUniqueId(), onSelect: console.log })
  const menuApi = createMemo(() => menu.connect(menuService, normalizeProps))

  return (
    <main class="avatar">
      {/* The button is both the menu trigger and the avatar root */}
      <button
        {...mergeProps(menuApi().getTriggerProps(), avatarApi().getRootProps())}
        data-size="sm"
        style={triggerStyle}
      >
        <span {...avatarApi().getFallbackProps()}>PA</span>
        <img alt="" referrerPolicy="no-referrer" src={avatarData.full[0]} {...avatarApi().getImageProps()} />
      </button>

      <Show when={menuApi().open}>
        <Portal>
          <div {...menuApi().getPositionerProps()}>
            <ul {...menuApi().getContentProps()}>
              <li {...menuApi().getItemProps({ value: "profile" })}>Profile</li>
              <li {...menuApi().getItemProps({ value: "settings" })}>Settings</li>
              <li {...menuApi().getItemProps({ value: "signout" })}>Sign out</li>
            </ul>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
