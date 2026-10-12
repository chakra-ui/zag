"use client"

import { usePathname } from "next/navigation"
import { HiChevronRight } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, HStack, styled } from "styled-system/jsx"

const pill = css({
  px: "4",
  py: "2",
  rounded: "full",
  fontFamily: "mono",
  fontSize: "sm",
  fontWeight: "semibold",
  whiteSpace: "nowrap",
})

const missing = css({
  maxW: "16rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  borderWidth: "2px",
  borderStyle: "dashed",
  borderColor: "border.bold",
  color: "text.muted",
  animation: "zi-missing 2.4s ease-in-out infinite",
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
})

export function MissingState() {
  const pathname = usePathname()
  return (
    <HStack gap="0" flexWrap="wrap" justify="center" rowGap="3" aria-hidden>
      <style>{`
        @keyframes zi-missing {
          0%, 70%, 100% { transform: translateX(0) }
          75% { transform: translateX(-4px) }
          80% { transform: translateX(4px) }
          85% { transform: translateX(-3px) }
          90% { transform: translateX(2px) }
        }
      `}</style>
      <span className={pill} style={{ background: "#C6F895", color: "black" }}>
        browsing
      </span>
      <Box position="relative" w="36" mx="2">
        <Box borderTopWidth="2px" borderColor="border.bold" />
        <styled.span
          position="absolute"
          right="-1.5"
          top="-9px"
          color="border.bold"
          display="flex"
        >
          <HiChevronRight size={16} />
        </styled.span>
        <styled.span
          position="absolute"
          insetInline="0"
          top="-6"
          textAlign="center"
          fontFamily="mono"
          fontSize="xs"
          color="text.muted"
        >
          NAVIGATE
        </styled.span>
      </Box>
      <span className={`${pill} ${missing}`} title={pathname}>
        {pathname}
      </span>
    </HStack>
  )
}
