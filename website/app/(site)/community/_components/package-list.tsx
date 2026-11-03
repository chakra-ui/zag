"use client"

import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import type { CommunityProject } from "lib/community"
import { filterProjects } from "lib/filter-projects"
import Image from "next/image"
import { useId, useState } from "react"
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"
import { community, packageList, showcaseCard } from "styled-system/recipes"

const pageSize = 6

export function PackageList(props: { projects: CommunityProject[] }) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const results = filterProjects(props.projects, query)

  const service = useMachine(pagination.machine, {
    id: useId(),
    count: results.length,
    pageSize,
    page,
    onPageChange: (details) => setPage(details.page),
  })
  const api = pagination.connect(service, normalizeProps)

  const styles = packageList()
  const card = showcaseCard()
  const meta = community()

  return (
    <div className={styles.root}>
      <input
        type="search"
        aria-label="Search community packages"
        placeholder="Search by name, description or author"
        className={styles.search}
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value)
          setPage(1)
        }}
      />

      {results.length === 0 ? (
        <p className={styles.empty}>No packages match “{query.trim()}”.</p>
      ) : (
        <div className={styles.grid}>
          {api.slice(results).map((project) => (
            <a
              key={project.href}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={card.root}
            >
              <div className={card.media} data-part="media">
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={card.body}>
                <div className={card.text}>
                  <div className={meta.packageHead}>
                    <h3 className={card.name}>{project.name}</h3>
                    <span className={meta.author}>@{project.author}</span>
                  </div>
                  <p className={card.description}>{project.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {api.totalPages > 1 && (
        <nav {...api.getRootProps()} className={styles.pager}>
          <button {...api.getPreviousTriggerProps()} className={styles.trigger}>
            <BiChevronLeft aria-hidden />
          </button>
          {api.pages.map((item, index) =>
            item.type === "page" ? (
              <button
                key={item.value}
                {...api.getItemProps(item)}
                className={styles.item}
              >
                {item.value}
              </button>
            ) : (
              <span
                key={`ellipsis-${index}`}
                {...api.getEllipsisProps({ index })}
                className={styles.ellipsis}
              >
                …
              </span>
            ),
          )}
          <button {...api.getNextTriggerProps()} className={styles.trigger}>
            <BiChevronRight aria-hidden />
          </button>
        </nav>
      )}
    </div>
  )
}
