import { useNavigate, useSearchParams } from "@solidjs/router"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tabs.css"

export default function Page() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const has = (key: string) => searchParams[key] !== undefined
  const query = {
    controlled: has("controlled"),
    automatic: has("automatic"),
    native: has("native"),
    cancel: has("cancel"),
  }
  const [value, setValue] = createSignal<string | null>("nils")

  const id = createUniqueId()
  const service = useMachine(tabs.machine, (): tabs.Props => ({
    id,
    defaultValue: "nils",
    value: query.controlled ? value() : undefined,
    onValueChange(details) {
      setValue(details.value)
    },
    activationMode: query.automatic ? "automatic" : "manual",
    ...(!query.native && {
      navigate(details: tabs.NavigateDetails) {
        navigate(`#${details.value}`)
      },
    }),
  }))

  const api = createMemo(() => tabs.connect(service, normalizeProps))

  return (
    <>
      <main class="tabs" data-ready={!service.context.get("ssr")}>
        <div>
          <button onClick={() => api().setValue("agnes")}>Select Agnes with API</button>
          <button onClick={() => setValue("joke")}>Select Joke with prop</button>
        </div>
        <p>
          Selected: <output data-testid="value">{api().value ?? "none"}</output>
        </p>
        <div
          {...api().getRootProps()}
          onClick={(event) => {
            if (query.cancel) event.preventDefault()
          }}
        >
          <div {...api().getIndicatorProps()} />
          <div {...api().getListProps()}>
            <For each={tabsData}>
              {(data) => (
                <a href={`#${data.id}`} {...(api().getTriggerProps({ value: data.id }) as any)}>
                  {data.label}
                </a>
              )}
            </For>
          </div>
          <For each={tabsData}>
            {(data) => (
              <div {...api().getContentProps({ value: data.id })}>
                <p>{data.content}</p>
                {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
              </div>
            )}
          </For>
        </div>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
