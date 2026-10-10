import Link from "next/link"
import { paginate } from "lib/pagination-utils"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, HStack } from "styled-system/jsx"
import type { SystemStyleObject } from "styled-system/types"
import { useFramework } from "./framework"
import { Icon } from "./ui/icon"

export function usePagination() {
  const { framework } = useFramework()
  const asPath = usePathname()
  const { prev, next } = paginate({ framework, current: asPath })
  return {
    prev,
    next,
    hasPrev: !!prev,
    hasNext: !!next,
  }
}

function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}

type PageLink = NonNullable<ReturnType<typeof usePagination>["prev"]>

const card = css({
  flex: "1",
  minW: "0",
  display: "flex",
  alignItems: "center",
  gap: "3",
  p: "4",
  rounded: "lg",
  borderWidth: "1px",
  borderColor: "border.subtle",
  color: "text.muted",
  transition: "border-color 0.15s",
  _hover: { borderColor: "green.500" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "green.500",
    outlineOffset: "2px",
  },
})

function PageCard(props: { item: PageLink; rel: "prev" | "next" }) {
  const { item, rel } = props
  return (
    <Link href={item.url} rel={rel} className={card}>
      {rel === "prev" && <Icon as={HiChevronLeft} flexShrink="0" />}
      <Box flex="1" minW="0" textAlign={rel === "prev" ? "start" : "end"}>
        <Box textStyle="sm" mb="1">
          {item.group}
        </Box>
        <Box fontWeight="medium" color="text" truncate>
          {item.label}
        </Box>
      </Box>
      {rel === "next" && <Icon as={HiChevronRight} flexShrink="0" />}
    </Link>
  )
}

export function Pagination(props: SystemStyleObject) {
  const { prev, next } = usePagination()
  const isClient = useIsClient()

  if (!isClient || (!prev && !next)) return null

  return (
    <HStack gap="4" {...props}>
      {prev ? <PageCard item={prev} rel="prev" /> : <Box flex="1" />}
      {next ? <PageCard item={next} rel="next" /> : <Box flex="1" />}
    </HStack>
  )
}
