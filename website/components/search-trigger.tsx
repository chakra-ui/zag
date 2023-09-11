import { Icon } from "@chakra-ui/icon"
import { chakra, forwardRef, type HTMLChakraProps } from "@chakra-ui/system"
import { HiOutlineSearch } from "react-icons/hi"

export const SearchTrigger: any = forwardRef(
  (props: HTMLChakraProps<"button">, ref) => {
    return (
      <chakra.button
        {...props}
        ref={ref}
        type="button"
        width="full"
        display="flex"
        alignItems="center"
        gap="2"
        bg="bg-subtle"
        fontSize="sm"
        py="2"
        pl="2"
        pr="3"
        ring="1px"
        ringColor="border-bold"
        color="gray.500"
      >
        <Icon as={HiOutlineSearch} fontSize="md" />
        Quick search...
        <chakra.span ml="auto" flex="none" fontWeight="semibold" fontSize="xs">
          ⌘K
        </chakra.span>
      </chakra.button>
    )
  },
)
