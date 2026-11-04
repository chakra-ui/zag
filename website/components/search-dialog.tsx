import { Portal } from "@zag-js/react"
import { getSection, useSearch } from "lib/use-search"
import type { SearchMetaItem } from "lib/search-meta"
import Link from "next/link"
import { Fragment, useEffect, useState } from "react"
import { HiOutlineSearch } from "react-icons/hi"
import { LuChevronRight } from "react-icons/lu"
import { css } from "styled-system/css"
import * as styles from "./search-dialog.css"
import { SearchTrigger } from "./search-trigger"

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  guides: "Developer",
  components: "Components",
  utilities: "Utilities",
  blog: "Blog",
}

// headings show the page they sit on
const getPage = (item: SearchMetaItem) =>
  item.type === "lvl1" ? null : item.hierarchy.lvl1

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function Highlight(props: { text: string; query: string }) {
  const { text, query } = props
  if (query.length < 3) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"))
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className={styles.mark}>
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  )
}

export function Search() {
  const { dialog_api, combobox_api, results } = useSearch()
  const open = dialog_api.open
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const timer = setTimeout(() => setMounted(false), styles.EXIT_MS)
    return () => clearTimeout(timer)
  }, [open])

  const query = combobox_api.inputValue.trim()
  const noResults = query.length >= 3 && results.length === 0
  const contentProps = combobox_api.getContentProps()
  const state = open ? "open" : "closed"

  return (
    <>
      <SearchTrigger {...dialog_api.getTriggerProps()} />
      {(open || mounted) && (
        <Portal>
          <div
            className={styles.backdrop}
            {...dialog_api.getBackdropProps()}
            hidden={false}
            data-state={state}
          />
          <div
            className={styles.positioner}
            {...dialog_api.getPositionerProps()}
          >
            <div
              className={styles.panel}
              {...dialog_api.getContentProps()}
              hidden={false}
              inert={!open || undefined}
              data-state={state}
            >
              <h2
                className={css({ srOnly: true })}
                {...dialog_api.getTitleProps()}
              >
                Search the docs
              </h2>

              <div className={styles.root} {...combobox_api.getRootProps()}>
                <div className={styles.inputRow}>
                  <HiOutlineSearch aria-hidden />
                  <input
                    className={styles.input}
                    {...combobox_api.getInputProps()}
                    placeholder="Search docs"
                  />
                  <button
                    type="button"
                    className={styles.esc}
                    {...dialog_api.getCloseTriggerProps()}
                    aria-label="Close search"
                  >
                    esc
                  </button>
                </div>

                <div
                  {...contentProps}
                  hidden={contentProps.hidden || results.length === 0}
                >
                  <div className={styles.list} {...combobox_api.getListProps()}>
                    {results.map((item, index) => {
                      const section = getSection(item)
                      const startsGroup =
                        index === 0 ||
                        getSection(results[index - 1]) !== section
                      return (
                        <Fragment key={item.url}>
                          {startsGroup && (
                            <div className={styles.group} aria-hidden>
                              {sectionLabels[section] ?? section}
                            </div>
                          )}
                          <Link
                            href={item.url}
                            className={styles.item}
                            {...combobox_api.getItemProps({ item })}
                          >
                            {getPage(item) && (
                              <>
                                <span className={styles.trail}>
                                  {getPage(item)}
                                </span>
                                <LuChevronRight
                                  className={styles.chevron}
                                  aria-hidden
                                />
                              </>
                            )}
                            <span className={styles.itemTitle}>
                              <Highlight text={item.content} query={query} />
                            </span>
                          </Link>
                        </Fragment>
                      )
                    })}
                  </div>
                </div>

                {results.length === 0 && (
                  <output className={styles.status}>
                    {noResults ? (
                      <>
                        <strong>No results for &ldquo;{query}&rdquo;</strong>
                        Try a component name, like menu or dialog.
                      </>
                    ) : (
                      "Loading…"
                    )}
                  </output>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
