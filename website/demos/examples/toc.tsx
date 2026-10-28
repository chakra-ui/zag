import { normalizeProps, useMachine } from "@zag-js/react"
import * as toc from "@zag-js/toc"
import { useId, useMemo, useRef, useState } from "react"
import styles from "../../styles/machines/toc.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const sections = [
  { slug: "introduction", label: "Introduction", depth: 2 },
  { slug: "installation", label: "Installation", depth: 2 },
  { slug: "packages", label: "Packages", depth: 3 },
  { slug: "usage", label: "Usage", depth: 2 },
  { slug: "styling", label: "Styling", depth: 3 },
  { slug: "faq", label: "FAQ", depth: 2 },
]

const copy =
  "Machines own the behavior and you own the markup. Each section here is tall enough to scroll, so the table of contents can follow along as headings enter and leave the container."

function useSections() {
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, "")
  return useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        value: `${prefix}-${section.slug}`,
      })),
    [prefix],
  )
}

type Section = ReturnType<typeof useSections>[number]

const label = (item: toc.TocItem) =>
  sections.find((section) => item.value.endsWith(`-${section.slug}`))?.label

function useToc(items: Section[], props: Partial<toc.Props> = {}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const service = useMachine(toc.machine, {
    id: useId(),
    items,
    scrollEl: () => scrollRef.current,
    ...props,
  })
  return [toc.connect(service, normalizeProps), scrollRef] as const
}

interface ViewProps {
  api: toc.Api
  items: Section[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  indicator?: boolean
  itemState?: boolean
  compact?: boolean
}

function View(props: ViewProps) {
  const { api, items } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <nav
        className={styles.Nav}
        data-compact={props.compact ? "" : undefined}
        {...api.getNavProps()}
      >
        <h5 className={styles.Title} {...api.getTitleProps()}>
          On this page
        </h5>
        <ul className={styles.List} {...api.getListProps()}>
          {props.indicator && (
            <div className={styles.Indicator} {...api.getIndicatorProps()} />
          )}
          {items.map((item) => {
            const state = api.getItemState({ item })
            return (
              <li
                key={item.value}
                className={styles.Item}
                {...api.getItemProps({ item })}
              >
                <a
                  href={`#${item.value}`}
                  className={styles.Link}
                  {...api.getLinkProps({ item })}
                >
                  {item.label}
                  {props.itemState && (state.first || state.last) && (
                    <span className={styles.Badge}>
                      {state.first && state.last
                        ? "only"
                        : state.first
                          ? "first"
                          : "last"}
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className={styles.Scroller} ref={props.scrollRef}>
        {items.map((item) => (
          <section key={item.value} className={styles.Section}>
            {item.depth === 2 ? (
              <h2 id={item.value}>{item.label}</h2>
            ) : (
              <h3 id={item.value}>{item.label}</h3>
            )}
            <p>{copy}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

export function TocIndicator() {
  const items = useSections()
  const [api, scrollRef] = useToc(items)
  return <View api={api} items={items} scrollRef={scrollRef} indicator />
}

export function TocObserver() {
  const items = useSections()
  const [api, scrollRef] = useToc(items, {
    rootMargin: "-20px 0% -40% 0%",
    threshold: 0,
  })
  return (
    <Stack>
      <View api={api} items={items} scrollRef={scrollRef} indicator />
      <Log label="active" value={show(api.activeItems.map(label))} />
    </Stack>
  )
}

export function TocScrollContainer() {
  const items = useSections()
  const [api, scrollRef] = useToc(items)
  return <View api={api} items={items} scrollRef={scrollRef} indicator />
}

export function TocNoAutoScroll() {
  const items = useSections()
  const [api, scrollRef] = useToc(items, { autoScroll: false })
  return (
    <View api={api} items={items} scrollRef={scrollRef} indicator compact />
  )
}

export function TocActiveChange() {
  const [value, setValue] = useState<string[]>([])
  const items = useSections()
  const [api, scrollRef] = useToc(items, {
    onActiveChange: (details) =>
      setValue(details.activeItems.map((item) => label(item) ?? item.value)),
  })
  return (
    <Stack>
      <View api={api} items={items} scrollRef={scrollRef} indicator />
      <Log label="onActiveChange" value={show(value)} />
    </Stack>
  )
}

export function TocControlled() {
  const items = useSections()
  const [activeIds, setActiveIds] = useState([items[0].value])
  const [api, scrollRef] = useToc(items, {
    activeIds,
    onActiveChange: (details) => setActiveIds(details.activeIds),
  })
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => setActiveIds([items[3].value])}>
          Mark Usage active
        </Ghost>
        <Ghost onClick={() => setActiveIds([])}>Clear</Ghost>
      </Row>
      <View api={api} items={items} scrollRef={scrollRef} indicator />
    </Stack>
  )
}

export function TocItemState() {
  const items = useSections()
  const [api, scrollRef] = useToc(items)
  return (
    <View api={api} items={items} scrollRef={scrollRef} indicator itemState />
  )
}
