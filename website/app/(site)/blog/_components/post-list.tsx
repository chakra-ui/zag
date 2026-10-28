"use client"

import type { Post } from "lib/source"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { blogIndex } from "styled-system/recipes"

export type PostSummary = Omit<Post, "toc">

const filters = [
  { label: "All", value: "all" },
  { label: "Releases", value: "releases", type: "release" },
  { label: "Articles", value: "articles", type: "article" },
]

const monthDay = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })

export function PostFilters() {
  const type = useSearchParams().get("type") ?? "all"
  const styles = blogIndex()
  return (
    <nav aria-label="Filter posts" className={styles.filters}>
      {filters.map((item) => (
        <Link
          key={item.value}
          href={item.value === "all" ? "/blog" : `/blog?type=${item.value}`}
          scroll={false}
          aria-current={type === item.value ? "page" : undefined}
          className={styles.filter}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function PostList({ posts }: { posts: PostSummary[] }) {
  const type = useSearchParams().get("type") ?? "all"
  const styles = blogIndex()
  const postType = filters.find((item) => item.value === type)?.type
  const visible = postType
    ? posts.filter((post) => post.type === postType)
    : posts
  const years = [...new Set(visible.map((post) => post.date.getUTCFullYear()))]

  if (visible.length === 0)
    return <p className={styles.empty}>No posts here yet.</p>

  return years.map((year) => (
    <section key={year} aria-labelledby={`year-${year}`}>
      <h2 id={`year-${year}`} className={styles.year}>
        {year}
      </h2>
      {visible
        .filter((post) => post.date.getUTCFullYear() === year)
        .map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={styles.row}
          >
            <time dateTime={post.date.toISOString()} className={styles.date}>
              {monthDay(post.date)}
            </time>
            <span className={styles.rowText}>
              <span className={styles.rowTitle} data-part="title">
                {post.title}
              </span>
              <span className={styles.rowLead}>{post.description}</span>
            </span>
            <span className={styles.rowAside}>
              <span style={{ display: "flex" }}>
                {post.authors.map((author) => (
                  <img
                    key={author.github}
                    src={`https://github.com/${author.github}.png?size=48`}
                    alt={author.name}
                    width={22}
                    height={22}
                    className={styles.avatar}
                  />
                ))}
              </span>
              <span className={styles.type} data-type={post.type}>
                {post.type}
              </span>
            </span>
          </Link>
        ))}
    </section>
  ))
}
