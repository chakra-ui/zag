import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId, onSettled } from "solid-js"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

const rootItems = [
  { label: "New File", value: "new-file" },
  { label: "Share →", value: "share" },
  { label: "Export →", value: "export" },
  { label: "Delete", value: "delete" },
]

const submenuItems: Record<string, { label: string; value: string }[]> = {
  share: [
    { label: "Email", value: "email" },
    { label: "Copy Link", value: "copy-link" },
  ],
  export: [
    { label: "PDF", value: "pdf" },
    { label: "PNG", value: "png" },
  ],
}

function useControlledMenu() {
  const id = createUniqueId()
  const [open, setOpen] = createSignal(false)
  return useMachine(menu.machine, () => ({
    id,
    open: open(),
    onOpenChange: (details: menu.OpenChangeDetails) => setOpen(details.open),
  }))
}

export default function Page() {
  const rootService = useControlledMenu()
  const root = createMemo(() => menu.connect(rootService, normalizeProps))

  const shareService = useControlledMenu()
  const share = createMemo(() => menu.connect(shareService, normalizeProps))

  const exportService = useControlledMenu()
  const exportMenu = createMemo(() => menu.connect(exportService, normalizeProps))

  const submenus = [
    { value: "share", service: shareService, api: share },
    { value: "export", service: exportService, api: exportMenu },
  ]

  onSettled(() => {
    submenus.forEach(({ service, api }) => {
      root().setChild(service)
      api().setParent(rootService)
    })
  })

  const getRootItemProps = (value: string) => {
    const sub = submenus.find((s) => s.value === value)
    return sub ? root().getTriggerItemProps(sub.api()) : root().getItemProps({ value })
  }

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...root().getTriggerProps()}>
            Click me
          </button>

          <Portal>
            <div {...root().getPositionerProps()}>
              <ul data-testid="menu" {...root().getContentProps()}>
                <For each={rootItems}>
                  {(item) => (
                    <li data-testid={item.value} {...getRootItemProps(item.value)}>
                      {item.label}
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Portal>

          <For each={submenus}>
            {(sub) => (
              <Portal>
                <div {...sub.api().getPositionerProps()}>
                  <ul data-testid={`${sub.value}-submenu`} {...sub.api().getContentProps()}>
                    <For each={submenuItems[sub.value]}>
                      {(item) => (
                        <li data-testid={item.value} {...sub.api().getItemProps({ value: item.value })}>
                          {item.label}
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Portal>
            )}
          </For>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={rootService} label="Root Machine" />
        <StateVisualizer state={shareService} label="Share Machine" />
        <StateVisualizer state={exportService} label="Export Machine" />
      </Toolbar>
    </>
  )
}
