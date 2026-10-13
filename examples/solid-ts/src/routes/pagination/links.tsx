import * as pagination from "@zag-js/pagination"
import { useSearchParams } from "@solidjs/router"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { ExampleProps } from "~/components/example-props"
import "@styles/pagination.css"

// Pages render as links; the URL is the source of truth
export default function Page() {
  const [searchParams] = useSearchParams<{ page?: string }>()
  const id = createUniqueId()

  const props = createMemo(
    () =>
      ({
        count: 200,
        type: "link",
        page: Number(searchParams.page ?? 1),
        getPageUrl: ({ page }: pagination.PageUrlDetails) => `?page=${page}`,
      }) as const,
  )

  const service = useMachine(pagination.machine, () => ({ id, ...props() }))

  const api = createMemo(() => pagination.connect(service, normalizeProps))

  return (
    <main class="pagination">
      <div class="vstack gap-4">
        <nav {...api().getRootProps()}>
          <ul>
            <li>
              <a {...api().getPrevTriggerProps()}>
                <ChevronLeftIcon />
              </a>
            </li>
            <For each={api().pages}>
              {(page, i) =>
                page.type === "page" ? (
                  <li>
                    <a {...api().getItemProps(page)}>{page.value}</a>
                  </li>
                ) : (
                  <li>
                    <span {...api().getEllipsisProps({ index: i() })}>&#8230;</span>
                  </li>
                )
              }
            </For>
            <li>
              <a {...api().getNextTriggerProps()}>
                <ChevronRightIcon />
              </a>
            </li>
          </ul>
        </nav>
        <span class="pagination-summary">
          Page {api().page} of {api().totalPages} · URL <code>{api().getPageUrl(api().page)}</code>
        </span>
        <ExampleProps value={props()} />
      </div>
    </main>
  )
}
