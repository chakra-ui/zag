import { Stack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import NextLink from "next/link"
import { useScrollSpy } from "./use-scrollspy"

type TOC = Array<{
  content: string
  slug: string
  lvl: number
}>

export function TableOfContents({
  data = [],
  title = "On this page",
  getSlug = (slug) => `#${slug}`,
}: {
  data: TOC
  title?: string
  getSlug?: (slug: string) => string
}) {
  const activeId = useScrollSpy(data.map((item) => `[id="${item.slug}"]`))

  return (
    <div className="toc">
      <chakra.h5 fontSize="sm" fontWeight="bold" className="toc__heading">
        {title}
      </chakra.h5>

      <Stack as="ul" fontSize="0.8rem" listStyleType="none" mt="3">
        {data.map((item, index) => (
          <chakra.li
            data-selected={activeId === item.slug || undefined}
            key={item.slug + index}
            paddingLeft={item.lvl > 2 ? "4" : undefined}
            _selected={{
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            <NextLink href={getSlug(item.slug)}>
              <chakra.span mr="1">{item.lvl > 2 ? "—" : null}</chakra.span>{" "}
              {item.content}
            </NextLink>
          </chakra.li>
        ))}
      </Stack>
    </div>
  )
}
