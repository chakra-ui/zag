import { normalizeProps, useMachine } from "@zag-js/react"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useRouter } from "next/router"
import { useId, useState } from "react"

export default function Page() {
  const { query, isReady } = useRouter()
  const [value, setValue] = useState("nils")
  const [clicks, setClicks] = useState(0)
  const [navigations, setNavigations] = useState(0)
  const [events, setEvents] = useState<string[]>([])

  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "nils",
    value: query.controlled ? value : undefined,
    onValueChange(details) {
      setValue(details.value)
      setEvents((events) => [...events, `value:${details.value}`])
    },
    activationMode: query.manual ? "manual" : "automatic",
    deselectable: !!query.deselectable,
    ...(query.noNavigate && { navigate: null }),
    ...(query.custom && {
      navigate(details: tabs.NavigateDetails) {
        setNavigations((count) => count + 1)
        setEvents((events) => [...events, `navigate:${details.value}`])
        if (query.throwNavigate) throw new Error("Navigation failed")
      },
    }),
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <main className="tabs" data-ready={isReady && !service.context.get("ssr")}>
      <div>
        <button onClick={() => api.setValue("agnes")}>Select Agnes with API</button>
        <button onClick={() => setValue("joke")}>Select Joke with prop</button>
        <button onClick={() => api.selectNext(api.value ?? undefined)}>Select next with API</button>
        <button onClick={() => api.selectPrev(api.value ?? undefined)}>Select previous with API</button>
      </div>
      <p>
        Selected: <output data-testid="value">{api.value ?? "none"}</output>
      </p>
      <p>
        Clicks: <output data-testid="clicks">{clicks}</output>
      </p>
      <p>
        Custom navigations: <output data-testid="navigations">{navigations}</output>
      </p>
      <p>
        Events: <output data-testid="events">{events.join(",")}</output>
      </p>
      <div
        {...api.getRootProps()}
        onClick={(event) => {
          if (!(event.target instanceof HTMLAnchorElement)) return
          setClicks((count) => count + 1)
          if (query.cancel) event.preventDefault()
        }}
      >
        <div {...api.getIndicatorProps()} />
        <div {...api.getListProps()}>
          {tabsData.map((data) => (
            <a href={`#${data.id}`} {...(api.getTriggerProps({ value: data.id }) as any)} key={data.id}>
              {data.label}
            </a>
          ))}
        </div>
        {tabsData.map((data) => (
          <div {...api.getContentProps({ value: data.id })} key={data.id}>
            <p>{data.content}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
