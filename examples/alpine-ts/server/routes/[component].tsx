import { defineHandler } from "nitro/h3"
import { componentRoutesData, getComponentExamples } from "@zag-js/shared"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  const { component } = event.context.params as any
  const currentComponent = event.url.searchParams.get("component") ?? (component as string)

  const componentInfo = componentRoutesData.find((item) => item.slug === currentComponent)
  const examples = getComponentExamples(currentComponent)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/component.ts"></script>
      </Head>

      <body>
        <div class="page">
          <Nav currentComponent={event.context.currentComponent as string} />

          <div
            class="index-nav component-index-nav"
            x-data={`{
              examples: ${JSON.stringify(examples)},
              query: "",
              get filteredExamples() {
                const search = this.query.trim().toLowerCase();
                if (!search) return this.examples;
                return this.examples.filter((example) => example.title.toLowerCase().includes(search));
              }
            }`}
          >
            <h2
              x-text={`"${componentInfo?.label} Examples (" + filteredExamples.length + "/" + examples.length + ")"`}
            />

            <div class="component-search">
              <input
                aria-label={`Search ${componentInfo?.label} examples`}
                placeholder="Search examples"
                type="search"
                x-model="query"
              />
            </div>

            <template x-if="filteredExamples.length > 0">
              <ul>
                <template x-for="example in filteredExamples" x-bind:key="example.path">
                  <li>
                    <a x-bind:href="example.path" x-text="example.title" />
                  </li>
                </template>
              </ul>
            </template>

            <template x-if="filteredExamples.length === 0">
              <p class="empty-state">No examples found.</p>
            </template>
          </div>
        </div>
      </body>
    </html>
  )
})
