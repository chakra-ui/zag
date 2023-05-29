import Icon from "@chakra-ui/icon"
import { HStack } from "@chakra-ui/layout"
import { FaChevronRight } from "react-icons/fa"

export function WorkshopLink() {
  return (
    <HStack
      display={{ base: "none", lg: "flex" }}
      as="a"
      px="3"
      py="1"
      fontSize="sm"
      color="text-badge"
      bg="bg-badge"
      align="center"
      href="/creator-workshop"
      className="group"
    >
      <b>Creator's Workshop</b>
      <svg width="2" height="2" fill="currentColor" aria-hidden="true">
        <circle cx="1" cy="1" r="1"></circle>
      </svg>
      <span className="ml-2">Learn how to use Zag from its creator</span>
      <Icon as={FaChevronRight} w="auto" fontSize="10px" />
    </HStack>
  )
}
