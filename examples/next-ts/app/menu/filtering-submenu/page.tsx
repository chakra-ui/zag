"use client"

import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuFilterData } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useEffectOnce } from "@/hooks/use-effect-once"
import "@styles/menu.css"

const { contains } = createFilter({ sensitivity: "base" })

interface FolderSubmenuProps {
  id: string
  parentService: menu.Service
  parent: menu.Api
}

// Rendered only while its trigger matches the parent's query, so filtering the trigger out removes the submenu
function FolderSubmenu(props: FolderSubmenuProps) {
  const { id, parentService, parent } = props
  const [query, setQuery] = useState("")

  const service = useMachine(menu.machine, {
    id,
    composite: false,
    onOpenChange(details) {
      if (!details.open) setQuery("")
    },
  })
  const api = menu.connect(service, normalizeProps)

  useEffectOnce(() => {
    parent.setChild(service)
    api.setParent(parentService)
  })

  const folders = menuFilterData.folders.filter((item) => contains(item.label, query))

  return (
    <>
      <div data-testid="move-to-folder" {...parent.getTriggerItemProps(api)}>
        Move to folder →
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div data-testid="folders-submenu" {...api.getContentProps()}>
            <input
              data-testid="folders-input"
              aria-label="Filter folders"
              placeholder="Search folders..."
              {...mergeProps(api.getInputProps(), {
                value: query,
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.currentTarget.value),
              })}
            />
            {folders.length === 0 && <div data-menu-empty="">No folders found</div>}
            <div {...api.getListProps()}>
              {folders.map((item) => (
                <div key={item.value} data-testid={item.value} {...api.getItemProps({ value: item.value })}>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Portal>
    </>
  )
}

export default function Page() {
  const [query, setQuery] = useState("")
  // Created outside the portal so server and client agree on the submenu's ids
  const folderMenuId = useId()

  const service = useMachine(menu.machine, {
    id: useId(),
    composite: false,
    onOpenChange(details) {
      if (!details.open) setQuery("")
    },
  })
  const api = menu.connect(service, normalizeProps)

  const actions = menuFilterData.actions.filter((item) => contains(item.label, query))
  const showMoveTo = contains("Move to folder", query)

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...api.getTriggerProps()}>
            File
          </button>

          <Portal>
            <div {...api.getPositionerProps()}>
              <div data-testid="menu" {...api.getContentProps()}>
                <input
                  data-testid="input"
                  aria-label="Filter actions"
                  placeholder="Search actions..."
                  {...mergeProps(api.getInputProps(), {
                    value: query,
                    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.currentTarget.value),
                  })}
                />
                {actions.length === 0 && !showMoveTo && <div data-menu-empty="">No actions found</div>}
                <div {...api.getListProps()}>
                  {actions.map((item) => (
                    <div key={item.value} data-testid={item.value} {...api.getItemProps({ value: item.value })}>
                      {item.label}
                    </div>
                  ))}
                  {showMoveTo && <FolderSubmenu id={folderMenuId} parentService={service} parent={api} />}
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
