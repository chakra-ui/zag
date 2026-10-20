import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { XIcon } from "lucide-solid"
import { type Accessor, createMemo, createSignal, createUniqueId, onMount, Show } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/toast.css"

interface ConditionalToastProps {
  actor: Accessor<toast.Options<string>>
  parent: toast.GroupService
  index: Accessor<number>
  showTitle: boolean
  showDescription: boolean
}

function ConditionalToast(props: ConditionalToastProps) {
  const service = useMachine(
    toast.machine,
    createMemo(() => ({ ...props.actor(), parent: props.parent, index: props.index() })),
  )
  const api = createMemo(() => toast.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div data-scope="toast" data-part="content">
        <p>Your draft is ready.</p>
        <Show when={props.showTitle}>
          <div {...api().getTitleProps()}>{api().title}</div>
        </Show>
        <Show when={props.showDescription}>
          <div {...api().getDescriptionProps()}>{api().description}</div>
        </Show>
      </div>
      <button {...api().getCloseTriggerProps()}>
        <XIcon />
      </button>
    </div>
  )
}

export default function ConditionalContent() {
  const [ready, setReady] = createSignal(false)
  const store = toast.createStore<string>({ duration: Infinity })
  const [showTitle, setShowTitle] = createSignal(false)
  const [showDescription, setShowDescription] = createSignal(false)
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  onMount(() => setReady(true))

  return (
    <main>
      <fieldset class="hstack gap-4" disabled={!ready()}>
        <label>
          <input
            type="checkbox"
            checked={showTitle()}
            onChange={(event) => setShowTitle(event.currentTarget.checked)}
          />
          Show title
        </label>
        <label>
          <input
            type="checkbox"
            checked={showDescription()}
            onChange={(event) => setShowDescription(event.currentTarget.checked)}
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
        <div {...api().getGroupProps()}>
          <Key each={api().getToasts()} by={(actor) => actor.id}>
            {(actor, index) => (
              <ConditionalToast
                actor={actor}
                parent={service}
                index={index}
                showTitle={showTitle()}
                showDescription={showDescription()}
              />
            )}
          </Key>
        </div>
      </Portal>
    </main>
  )
}
