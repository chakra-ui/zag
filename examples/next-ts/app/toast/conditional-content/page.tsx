"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import "@styles/toast.css"

interface ConditionalToastProps {
  actor: toast.Options<string>
  parent: toast.GroupService
  index: number
  showTitle: boolean
  showDescription: boolean
}

function ConditionalToast(props: ConditionalToastProps) {
  const { actor, parent, index, showTitle, showDescription } = props
  const service = useMachine(toast.machine, { ...actor, parent, index })
  const api = toast.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getContentProps()}>
        <p>Your draft is ready.</p>
        {showTitle && <div {...api.getTitleProps()}>{api.title}</div>}
        {showDescription && <div {...api.getDescriptionProps()}>{api.description}</div>}
      </div>
      <button {...api.getCloseTriggerProps()}>
        <XIcon />
      </button>
    </div>
  )
}

export default function ConditionalContent() {
  const [ready, setReady] = useState(false)
  const [store] = useState(() => toast.createStore<string>({ duration: Infinity }))
  const [showTitle, setShowTitle] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const service = useMachine(toast.group.machine, { id: useId(), store })
  const api = toast.group.connect(service, normalizeProps)

  useEffect(() => setReady(true), [])

  return (
    <main>
      <fieldset className="hstack gap-4" disabled={!ready}>
        <label>
          <input type="checkbox" checked={showTitle} onChange={(event) => setShowTitle(event.target.checked)} />
          Show title
        </label>
        <label>
          <input
            type="checkbox"
            checked={showDescription}
            onChange={(event) => setShowDescription(event.target.checked)}
          />
          Show description
        </label>
        <button
          onClick={() =>
            store.create({ id: "draft", title: "Draft saved", description: "All changes are up to date." })
          }
        >
          Create toast
        </button>
      </fieldset>

      <Portal>
        <div {...api.getGroupProps()}>
          {api.getToasts().map((actor, index) => (
            <ConditionalToast
              key={actor.id}
              actor={actor}
              parent={service}
              index={index}
              showTitle={showTitle}
              showDescription={showDescription}
            />
          ))}
        </div>
      </Portal>
    </main>
  )
}
