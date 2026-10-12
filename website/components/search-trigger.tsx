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
        aria-label="Search the docs"
        width="full"
        display="flex"
        alignItems="center"
        gap="2"
        bg="bg"
        fontSize="sm"
        py="2"
        pl="2"
        pr="3"
        borderWidth="1px"
        borderColor="border"
        color="text.muted"
        cursor="pointer"
        rounded="sm"
      >
        <Icon as={HiOutlineSearch} fontSize="md" />
        <styled.span hideBelow="md">Quick search...</styled.span>
        <styled.span
          hideBelow="md"
          ml="auto"
          flex="none"
          fontWeight="semibold"
          fontSize="xs"
        >
          ⌘K
        </styled.span>
      </styled.button>
    )
  },
)
