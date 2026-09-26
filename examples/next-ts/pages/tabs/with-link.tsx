import { normalizeProps, useMachine } from "@zag-js/react"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useRouter } from "next/router"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const router = useRouter()
  const query = router.query
  const [value, setValue] = useState("nils")
  const [navigations, setNavigations] = useState<string[]>([])

  const controlled = query.controlled === "true"
  // a controlled setup that rejects every change: the value stays "nils"
  const locked = query.controlled === "locked"
  const manual = query.manual === "true"

  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "nils",
    value: locked ? "nils" : controlled ? value : undefined,
    activationMode: manual ? "manual" : "automatic",
    onValueChange(details) {
      if (locked) return
      setValue(details.value ?? "none")
    },
    navigate(details) {
      setNavigations((prev) => [...prev, details.value])
      router.push(`#${details.value}`)
    },
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <>
      <main className="tabs">
        <div>
          <button data-testid="set-value" onClick={() => api.setValue("agnes")}>
            Select Agnes with API
          </button>
          <button data-testid="set-prop" onClick={() => setValue("joke")}>
            Select Joke with prop
          </button>
          <button data-testid="select-next" onClick={() => api.selectNext(api.value ?? undefined)}>
            Select next
          </button>
        </div>
        <p>
          Navigations: <output data-testid="navigations">{navigations.join(",") || "none"}</output>
        </p>
        <div {...api.getRootProps()}>
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
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
