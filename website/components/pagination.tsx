import Icon from "@chakra-ui/icon"
import { Box, HStack, type StackProps } from "@chakra-ui/layout"
import { paginate } from "lib/pagination-utils"
import Link from "next/link"
import { useRouter } from "next/router"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import { useFramework } from "./framework"

export function usePagination() {
  const { framework } = useFramework()
  const { asPath } = useRouter()
  const { prev, next } = paginate({ framework, current: asPath })
  return { prev, next, hasPrev: !!prev, hasNext: !!next }
}

export function Pagination(props: StackProps) {
  const { prev, next } = usePagination()
  return (
    <HStack
      justify="space-between"
      spacing="10"
      mb="10"
      color="gray.700"
      {...props}
    >
      {prev ? (
        <Box as={Link} href={prev.url} rel="prev" flex="1" textAlign="start">
          <HStack spacing="1" color="text-bold">
            <Icon as={HiChevronLeft} />
            <span>Previous</span>
          </HStack>
          <Box color="green.500" fontWeight="semibold" fontSize="md" mt="1">
            {prev.label}
          </Box>
        </Box>
      ) : (
        <Box className="pagination__empty" flex="1" />
      )}
      {next ? (
        <Box as={Link} href={next.url} rel="next" flex="1" textAlign="end">
          <HStack spacing="1" justify="flex-end" color="text-bold">
            <span>Next</span>
            <Icon as={HiChevronRight} />
          </HStack>
          <Box color="green.500" fontWeight="semibold" fontSize="md" mt="1">
            {next.label}
          </Box>
        </Box>
      ) : (
        <Box className="pagination__empty" flex="1" />
      )}
    </HStack>
  )
}
