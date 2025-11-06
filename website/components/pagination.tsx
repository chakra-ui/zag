import { Link } from "components/ui/link"
import { paginate } from "lib/pagination-utils"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import { Box, HStack } from "styled-system/jsx"
import type { SystemStyleObject } from "styled-system/types"
import { useFramework } from "./framework"
import { Icon } from "./ui/icon"

export function usePagination() {
  const { framework } = useFramework()
  const { asPath } = useRouter()
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

export function Pagination(props: SystemStyleObject) {
  const { prev, next } = usePagination()
  const isClient = useIsClient()

  if (!isClient) return null

  return (
    <HStack
      justify="space-between"
      gap="10"
      mb="10"
      color="gray.700"
      {...props}
    >
      {prev ? (
        <Link
          href={prev.url}
          rel="prev"
          flex="1"
          textAlign="start"
          textDecoration="none"
          _hover={{ color: "green.500" }}
        >
          <HStack gap="1" color="text">
            <Icon as={HiChevronLeft} />
            <span>Previous</span>
          </HStack>
          <Box color="green.500" fontWeight="semibold" fontSize="md" mt="1">
            {prev.label}
          </Box>
        </Link>
      ) : (
        <Box className="pagination__empty" flex="1" />
      )}
      {next ? (
        <Link
          href={next.url}
          rel="next"
          flex="1"
          textAlign="end"
          textDecoration="none"
          _hover={{ color: "green.500" }}
        >
          <HStack justifyContent="flex-end" gap="1" color="text">
            <span>Next</span>
            <Icon as={HiChevronRight} />
          </HStack>
          <Box color="green.500" fontWeight="semibold" fontSize="md" mt="1">
            {next.label}
          </Box>
        </Link>
      ) : (
        <Box className="pagination__empty" flex="1" />
      )}
    </HStack>
  )
}
