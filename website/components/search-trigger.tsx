import { styled } from "styled-system/jsx"
import { HiOutlineSearch } from "react-icons/hi"
import { forwardRef } from "react"
import { Icon } from "components/ui/icon"

export const SearchTrigger = forwardRef<HTMLButtonElement, any>(
  function SearchTrigger(props, ref) {
    return (
      <styled.button
        {...props}
        ref={ref}
        type="button"
        width="full"
        display="flex"
        alignItems="center"
        gap="2"
        bg="bg.subtle"
        fontSize="sm"
        py="2"
        pl="2"
        pr="3"
        borderWidth="1px"
        borderColor="border"
        color="gray.500"
        cursor="pointer"
        _hover={{ bg: "bg.muted" }}
      >
        <Icon as={HiOutlineSearch} fontSize="1em" />
        Quick search...
        <styled.span ml="auto" flex="none" fontWeight="semibold" fontSize="xs">
          ⌘K
        </styled.span>
      </styled.button>
    )
  },
)
