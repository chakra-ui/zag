import { useScrollSpy } from "lib/use-scrollspy"
import Link from "next/link"
import { Stack, styled } from "styled-system/jsx"

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
      <styled.h5 fontSize="sm" fontWeight="bold" className="toc__heading">
        {title}
      </styled.h5>

      <Stack as="ul" fontSize="0.8rem" listStyleType="none" mt="3">
        {data.map((item, index) => (
          <styled.li
            data-selected={activeId === item.slug || undefined}
            key={item.slug + index}
            paddingLeft={item.lvl > 2 ? "4" : undefined}
            _selected={{
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            <Link href={getSlug(item.slug)}>
              <styled.span mr="1">{item.lvl > 2 ? "—" : null}</styled.span>{" "}
              {item.content}
            </Link>
          </styled.li>
        ))}
      </Stack>
    </div>
  )
}
