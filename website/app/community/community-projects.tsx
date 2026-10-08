"use client"

import type {
  CommunityProject,
  CommunityProjectKind,
  CommunityProjectStatus,
} from "lib/community"
import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  LuArrowUpRight,
  LuChevronLeft,
  LuChevronRight,
  LuSearch,
} from "react-icons/lu"
import { cva } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

function hash(value: string) {
  let h = 0
  for (const char of value) h = (h * 31 + char.charCodeAt(0)) >>> 0
  return h
}

function getInitials(name: string) {
  const parts = name
    .replace(/^zag[-_]?|[-_]?zag$/i, "")
    .split(/[-_\s.]+/)
    .filter(Boolean)
  const initials =
    parts.length > 1
      ? parts[0][0] + parts[1][0]
      : (parts[0] ?? name).slice(0, 2)
  return initials.toUpperCase()
}

// expects a 6-digit hex; anything else falls back to white text
function getContrastText(background: string) {
  const hex = background.replace("#", "")
  if (!/^[0-9a-f]{6}$/i.test(hex)) return "#ffffff"
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.4 ? "#111114" : "#ffffff"
}

function getDescription(project: CommunityProject) {
  const description = project.description.trim()
  if (description) return description
  const target = project.framework ? ` for ${project.framework}` : ""
  return `A community ${project.kind}${target}.`
}

/**
 * The tile picks its look from what the entry provides:
 * logo on the brand color > logo on a neutral tile > initials on a hashed tint.
 */
function ProjectTile({ project }: { project: CommunityProject }) {
  const { logo, brand } = project
  const img = { alt: "", boxSize: "6", objectFit: "contain" } as const

  const tile = {
    boxSize: "10",
    flexShrink: "0",
    rounded: "lg",
    display: "grid",
    placeItems: "center",
    borderWidth: "1px",
    borderColor: "border.subtle",
    overflow: "hidden",
  } as const

  if (logo) {
    return (
      <Box
        {...tile}
        bg="bg.subtle"
        style={brand ? { background: brand } : undefined}
      >
        {typeof logo === "string" ? (
          <styled.img src={logo} {...img} />
        ) : (
          <>
            <styled.img src={logo.light} {...img} _dark={{ display: "none" }} />
            <styled.img
              src={logo.dark}
              {...img}
              display="none"
              _dark={{ display: "block" }}
            />
          </>
        )}
      </Box>
    )
  }

  if (brand) {
    return (
      <Box
        {...tile}
        fontWeight="bold"
        fontSize="sm"
        style={{ background: brand, color: getContrastText(brand) }}
      >
        {getInitials(project.name)}
      </Box>
    )
  }

  // same name, same color, in both themes
  return (
    <Box
      {...tile}
      fontWeight="bold"
      fontSize="sm"
      style={{ ["--hue" as string]: hash(project.name) % 360 }}
      bg="hsl(var(--hue) 55% 92%)"
      color="hsl(var(--hue) 50% 32%)"
      _dark={{
        bg: "hsl(var(--hue) 45% 20%)",
        color: "hsl(var(--hue) 50% 78%)",
      }}
    >
      {getInitials(project.name)}
    </Box>
  )
}

const pill = cva({
  base: {
    fontSize: "xs",
    fontWeight: "medium",
    px: "2",
    py: "0.5",
    rounded: "full",
    whiteSpace: "nowrap",
    bg: "bg.muted",
    color: "fg.muted",
  },
  variants: {
    status: {
      stable: {
        bg: "green.100",
        color: "green.700",
        _dark: { bg: "green.950", color: "green.300" },
      },
      beta: {
        bg: "amber.100",
        color: "amber.800",
        _dark: { bg: "amber.950", color: "amber.300" },
      },
      experimental: {
        bg: "amber.100",
        color: "amber.800",
        _dark: { bg: "amber.950", color: "amber.300" },
      },
      unmaintained: { color: "fg.subtle", textDecoration: "line-through" },
    },
  },
})

function Pill(props: {
  children: React.ReactNode
  status?: CommunityProjectStatus
}) {
  return (
    <span className={pill({ status: props.status })}>{props.children}</span>
  )
}

const actionButton = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    h: "8",
    px: "3",
    rounded: "md",
    borderWidth: "1px",
    borderColor: "border.subtle",
    bg: "bg",
    fontSize: "xs",
    fontWeight: "medium",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "all 0.2s",
    _hover: { bg: "bg.subtle", borderColor: "border.emphasized" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "green.500",
      outlineOffset: "2px",
    },
  },
})

function ProjectRow({
  project,
  sample,
}: {
  project: CommunityProject
  sample: boolean
}) {
  const unmaintained = project.status === "unmaintained"
  return (
    <HStack
      as="li"
      gap="4"
      alignItems="flex-start"
      py="5"
      borderTopWidth="1px"
      borderColor="border.subtle"
      _first={{ borderTopWidth: "0" }}
      opacity={unmaintained ? 0.65 : 1}
    >
      <ProjectTile project={project} />
      <Stack gap="1.5" flex="1" minW="0">
        <HStack gap="2" flexWrap="wrap" rowGap="1">
          <styled.a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            fontWeight="semibold"
            wordBreak="break-word"
            _hover={{ textDecoration: "underline" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "green.500",
              outlineOffset: "2px",
            }}
          >
            {project.name}
          </styled.a>
          {project.framework ? <Pill>{project.framework}</Pill> : null}
          {project.zag ? <Pill>zag {project.zag}</Pill> : null}
          {project.status ? (
            <Pill status={project.status}>{project.status}</Pill>
          ) : null}
          {sample ? (
            <styled.span
              fontFamily="mono"
              fontSize="2xs"
              color="fg.subtle"
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              sample
            </styled.span>
          ) : null}
        </HStack>
        <styled.p
          fontSize="sm"
          color={project.description.trim() ? "fg.muted" : "fg.subtle"}
          fontStyle={project.description.trim() ? "normal" : "italic"}
          lineClamp="2"
          maxW="65ch"
        >
          {getDescription(project)}
        </styled.p>
        <styled.span fontSize="xs" color="fg.subtle">
          by{" "}
          {project.author.github ? (
            <styled.a
              href={`https://github.com/${project.author.github}`}
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: "fg" }}
            >
              {project.author.name}
            </styled.a>
          ) : (
            project.author.name
          )}
        </styled.span>
      </Stack>
      <Box flexShrink="0" display={{ base: "none", sm: "block" }}>
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className={actionButton()}
        >
          Visit <LuArrowUpRight />
        </a>
      </Box>
    </HStack>
  )
}

const kinds: Array<{ value: CommunityProjectKind | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "adapter", label: "Adapters" },
  { value: "package", label: "Packages" },
  { value: "tool", label: "Tools" },
]

const chip = cva({
  base: {
    px: "3",
    h: "8",
    rounded: "full",
    borderWidth: "1px",
    borderColor: "border.subtle",
    fontSize: "sm",
    color: "fg.muted",
    cursor: "pointer",
    _hover: { color: "fg" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "green.500",
      outlineOffset: "2px",
    },
    _pressed: {
      bg: "gray.900",
      color: "white",
      borderColor: "gray.900",
      _dark: { bg: "white", color: "gray.900", borderColor: "white" },
    },
  },
})

function matches(project: CommunityProject, query: string) {
  const haystack = [
    project.name,
    project.description,
    project.framework,
    project.author.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

const PAGE_SIZE = 8

type ListState = {
  query: string
  kind: CommunityProjectKind | "all"
  page: number
}

const defaultState: ListState = { query: "", kind: "all", page: 1 }

// ?page=2&q=angular&kind=adapter, defaults left out so the plain URL stays clean
function readUrlState(): ListState {
  const params = new URLSearchParams(window.location.search)
  const kind = params.get("kind")
  const page = Number(params.get("page"))
  return {
    query: params.get("q") ?? "",
    kind: kinds.some((k) => k.value === kind)
      ? (kind as ListState["kind"])
      : "all",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

function writeUrlState(state: ListState, mode: "push" | "replace") {
  const url = new URL(window.location.href)
  const set = (key: string, value: string | null) =>
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key)
  set("q", state.query.trim() || null)
  set("kind", state.kind === "all" ? null : state.kind)
  set("page", state.page > 1 ? String(state.page) : null)
  if (url.href === window.location.href) return
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url)
}

const pageButton = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1",
    minW: "8",
    h: "8",
    px: "2",
    rounded: "md",
    fontSize: "sm",
    color: "fg.muted",
    cursor: "pointer",
    _hover: { color: "fg", bg: "bg.subtle" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "green.500",
      outlineOffset: "2px",
    },
    _disabled: {
      opacity: 0.4,
      cursor: "default",
      _hover: { bg: "transparent", color: "fg.muted" },
    },
    "&[aria-current=page]": {
      color: "fg",
      borderWidth: "1px",
      borderColor: "border.emphasized",
    },
  },
})

// built on Zag's own pagination machine
function Pagination(props: {
  count: number
  page: number
  onPageChange: (page: number) => void
}) {
  const service = useMachine(pagination.machine, {
    id: useId(),
    count: props.count,
    pageSize: PAGE_SIZE,
    page: props.page,
    onPageChange: (details) => props.onPageChange(details.page),
    translations: { rootLabel: "Community projects pages" },
  })
  const api = pagination.connect(service, normalizeProps)
  if (api.totalPages <= 1) return null

  return (
    <nav {...api.getRootProps()}>
      <HStack
        as="ul"
        listStyle="none"
        gap="1"
        justifyContent="center"
        flexWrap="wrap"
      >
        <li>
          <button className={pageButton()} {...api.getPrevTriggerProps()}>
            <LuChevronLeft /> Previous
          </button>
        </li>
        {api.pages.map((page, i) =>
          page.type === "page" ? (
            <li key={page.value}>
              <button className={pageButton()} {...api.getItemProps(page)}>
                {page.value}
              </button>
            </li>
          ) : (
            <li key={`ellipsis-${i}`}>
              <styled.span
                px="2"
                color="fg.subtle"
                {...api.getEllipsisProps({ index: i })}
              >
                &#8230;
              </styled.span>
            </li>
          ),
        )}
        <li>
          <button className={pageButton()} {...api.getNextTriggerProps()}>
            Next <LuChevronRight />
          </button>
        </li>
      </HStack>
    </nav>
  )
}

export function CommunityProjects(props: {
  projects: CommunityProject[]
  sample: boolean
}) {
  const { projects, sample } = props
  const [{ query, kind, page }, setState] = useState<ListState>(defaultState)
  const listTopRef = useRef<HTMLDivElement>(null)

  // read the URL after mount (the server render has no search params), and on back/forward
  useEffect(() => {
    const sync = () => setState(readUrlState())
    sync()
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  // page changes get their own history entry; typing and filtering replace the current one
  const update = (
    next: Partial<ListState>,
    mode: "push" | "replace" = "replace",
  ) => {
    const state = { query, kind, page, ...next }
    setState(state)
    writeUrlState(state, mode)
  }

  // only offer kinds that have entries, so a filter never leads to an empty list
  const availableKinds = kinds.filter(
    (k) => k.value === "all" || projects.some((p) => p.kind === k.value),
  )

  const visible = useMemo(
    () =>
      projects
        .filter((p) => (kind === "all" || p.kind === kind) && matches(p, query))
        // unmaintained projects sink to the bottom, otherwise keep the listed order
        .toSorted(
          (a, b) =>
            Number(a.status === "unmaintained") -
            Number(b.status === "unmaintained"),
        ),
    [projects, kind, query],
  )
  // a shared ?page=9 lands on the last page instead of an empty list
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  return (
    <Stack gap="5" ref={listTopRef} scrollMarginTop="24">
      <Stack gap="3">
        <HStack
          gap="2"
          px="3"
          h="10"
          rounded="lg"
          borderWidth="1px"
          borderColor="border.subtle"
          bg="bg"
          _focusWithin={{ borderColor: "green.500" }}
        >
          <styled.span color="fg.subtle" display="inline-flex">
            <LuSearch />
          </styled.span>
          <styled.input
            id="community-project-search"
            type="search"
            placeholder="Search by name, framework or author"
            aria-label="Search community projects"
            value={query}
            onChange={(e) => {
              update({ query: e.target.value, page: 1 })
            }}
            flex="1"
            minW="0"
            bg="transparent"
            outline="none"
            fontSize="sm"
          />
          <styled.span
            fontSize="xs"
            color="fg.subtle"
            whiteSpace="nowrap"
            aria-live="polite"
          >
            {visible.length === projects.length
              ? `${projects.length} projects`
              : `${visible.length} of ${projects.length}`}
          </styled.span>
        </HStack>
        {availableKinds.length > 2 ? (
          <HStack
            gap="2"
            flexWrap="wrap"
            role="group"
            aria-label="Filter by kind"
          >
            {availableKinds.map((k) => (
              <button
                key={k.value}
                type="button"
                className={chip()}
                aria-pressed={kind === k.value}
                onClick={() => {
                  update({ kind: k.value, page: 1 })
                }}
              >
                {k.label}
              </button>
            ))}
          </HStack>
        ) : null}
      </Stack>

      {visible.length > 0 ? (
        <Stack gap="6">
          <styled.ul listStyle="none">
            {pageItems.map((project) => (
              <ProjectRow
                key={project.name}
                project={project}
                sample={sample}
              />
            ))}
          </styled.ul>
          <Pagination
            count={visible.length}
            page={currentPage}
            onPageChange={(next) => {
              update({ page: next }, "push")
              // the next page can be shorter, so bring the top of the list back into view
              const reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
              ).matches
              listTopRef.current?.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start",
              })
            }}
          />
        </Stack>
      ) : (
        <Box py="10" textAlign="center" color="fg.muted" fontSize="sm">
          Nothing matches “{query}”.{" "}
          <styled.button
            type="button"
            textDecoration="underline"
            cursor="pointer"
            onClick={() => {
              update(defaultState)
            }}
          >
            Clear search
          </styled.button>
        </Box>
      )}
    </Stack>
  )
}
