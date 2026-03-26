import styles from "../../../../shared/src/css/tabs.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useRouter } from "next/router"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const router = useRouter()

  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "nils",
    activationMode: "manual",
    navigate(details) {
      router.push(`#${details.value}`)
    },
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <>
      <main className="tabs">
        <div {...api.getRootProps()} className={styles.Root}>
          <div {...api.getListProps()} className={styles.List}>
            {tabsData.map((data) => (
              <a href={`#${data.id}`} {...(api.getTriggerProps({ value: data.id }) as any)} key={data.id}>
                {data.label}
              </a>
            ))}
          </div>
          {tabsData.map((data) => (
            <div {...api.getContentProps({ value: data.id })} className={styles.Content} key={data.id}>
              <p>{data.content}</p>
              {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
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
