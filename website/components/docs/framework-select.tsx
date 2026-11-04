import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { frameworks, type Framework } from "lib/framework-utils"
import { usePathname, useRouter } from "next/navigation"
import { HiCheck, HiChevronDown } from "react-icons/hi"
import { useFramework } from "./framework"
import * as styles from "./framework-select.css"

export function FrameworkSelect(props: { id?: string }) {
  const { framework, setFramework } = useFramework()
  const router = useRouter()
  const asPath = usePathname()

  const service = useMachine(menu.machine, {
    id: props.id ?? "framework-select",
    positioning: { strategy: "fixed", placement: "bottom-end", gutter: 6 },
    onSelect({ value }) {
      const next = value as Framework
      setFramework?.(next)
      if (asPath.includes(framework) && next !== framework) {
        router.replace(asPath.replace(framework, next))
      }
    },
  })

  const api = menu.connect(service, normalizeProps)
  const current = frameworks[framework]

  return (
    <>
      <button
        className={styles.trigger}
        aria-label={`Framework: ${current.label}, switch framework`}
        {...api.getTriggerProps()}
      >
        <current.icon aria-hidden />
        {current.label}
        <HiChevronDown className={styles.chevron} aria-hidden />
      </button>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div className={styles.content} {...api.getContentProps()}>
              {Object.entries(frameworks).map(([key, value]) => (
                <div
                  key={key}
                  className={styles.item}
                  {...api.getOptionItemProps({
                    type: "radio",
                    value: key,
                    checked: key === framework,
                  })}
                >
                  <value.icon aria-hidden />
                  {value.label}
                  {key === framework && (
                    <HiCheck className={styles.check} aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
