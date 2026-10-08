"use client"

import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import type { CommunityProject } from "lib/community"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useId } from "react"
import {
  LuArrowUpRight,
  LuChevronLeft,
  LuChevronRight,
  LuSearch,
} from "react-icons/lu"
import { cva } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

const PAGE_SIZE = 10

function ProjectRow({ project }: { project: CommunityProject }) {
  return (
    <HStack
      as="li"
      gap="4"
      alignItems="flex-start"
      py="5"
      borderTopWidth="1px"
      borderColor="border.subtle"
      _first={{ borderTopWidth: "0" }}
    >
      <Box
        boxSize="10"
        flexShrink="0"
        rounded="lg"
        display="grid"
        placeItems="center"
        borderWidth="1px"
        borderColor="border.subtle"
        bg="bg.subtle"
      >
        <styled.img src={project.logo} alt="" boxSize="6" objectFit="contain" />
      </Box>
      <Stack gap="1.5" flex="1" minW="0">
        <HStack gap="2" flexWrap="wrap" rowGap="1">
          <styled.span fontWeight="semibold" wordBreak="break-word">
            {project.name}
          </styled.span>
        </HStack>
        <styled.p fontSize="sm" color="fg.muted" maxW="65ch">
          {project.description}
        </styled.p>
        <styled.span fontSize="xs" color="fg.subtle">
          by{" "}
          <styled.a
            href={`https://github.com/${project.author}`}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: "fg" }}
          >
            {project.author}
          </styled.a>
        </styled.span>
      </Stack>
      <styled.a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${project.name}`}
        flexShrink="0"
        display="inline-flex"
        alignItems="center"
        gap="1.5"
        h="8"
        px="3"
        rounded="md"
        borderWidth="1px"
        borderColor="border.subtle"
        fontSize="xs"
        fontWeight="medium"
        _hover={{ bg: "bg.subtle", borderColor: "border.emphasized" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "green.500",
          outlineOffset: "2px",
        }}
      >
        Visit <LuArrowUpRight />
      </styled.a>
    </HStack>
  )
}

const pageButton = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1",
    minW: "8",
    h: "8",
    px: "2",
    justifyContent: "center",
    rounded: "md",
    fontSize: "sm",
    color: "fg.muted",
    cursor: "pointer",
    _hover: { color: "fg", bg: "bg.subtle" },
    _disabled: { opacity: 0.4, cursor: "default" },
    "&[aria-current=page]": {
      color: "fg",
      borderWidth: "1px",
      borderColor: "border.emphasized",
    },
  },
})

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
  })
  const api = pagination.connect(service, normalizeProps)
  if (api.totalPages <= 1) return null

  return (
    <nav {...api.getRootProps()}>
      <HStack as="ul" listStyle="none" gap="1" justifyContent="center">
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
              <span {...api.getEllipsisProps({ index: i })}>&#8230;</span>
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

// ?q=lit&page=2 lives in the URL, so a shared link or the back button lands on the same list
export function CommunityProjects(props: { projects: CommunityProject[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const query = params.get("q") ?? ""

  // page changes get a history entry, typing replaces the current one
  const setParams = (q: string, page: number, mode: "push" | "replace") => {
    const next = new URLSearchParams()
    if (q) next.set("q", q)
    if (page > 1) next.set("page", String(page))
    const search = next.toString()
    router[mode](search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    })
  }

  const matches = props.projects.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const page = Math.min(
    Math.max(1, Number(params.get("page")) || 1),
    totalPages,
  )
  const items = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Stack gap="5">
      <HStack
        gap="2"
        px="3"
        h="10"
        rounded="lg"
        borderWidth="1px"
        borderColor="border.subtle"
        _focusWithin={{ borderColor: "green.500" }}
      >
        <LuSearch />
        <styled.input
          type="search"
          placeholder="Search by name"
          aria-label="Search community projects"
          defaultValue={query}
          onChange={(e) => setParams(e.target.value, 1, "replace")}
          flex="1"
          bg="transparent"
          outline="none"
          fontSize="sm"
        />
      </HStack>
      {items.length > 0 ? (
        <styled.ul listStyle="none">
          {items.map((project) => (
            <ProjectRow key={project.name} project={project} />
          ))}
        </styled.ul>
      ) : (
        <styled.p py="10" textAlign="center" color="fg.muted" fontSize="sm">
          Nothing matches “{query}”.
        </styled.p>
      )}
      <Pagination
        count={matches.length}
        page={page}
        onPageChange={(next) => setParams(query, next, "push")}
      />
    </Stack>
  )
}
