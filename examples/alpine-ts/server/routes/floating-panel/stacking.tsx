import { X } from "lucide-static"
import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

interface PanelProps {
  name: string
  offset: number
}

function Panel(props: PanelProps) {
  const { name, offset } = props

  return (
    <div
      x-floating={`{
        id: $id('floating'),
        defaultPosition: {x: ${100 + offset}, y: ${100 + offset}},
      }`}
    >
      <button x-floating:trigger data-testid={`trigger-${name}`}>
        Toggle {name}
      </button>
      <div x-floating:positioner data-testid={`positioner-${name}`}>
        <div x-floating:content data-testid={`content-${name}`}>
          <div x-floating:drag-trigger>
            <div x-floating:header>
              <p x-floating:title>Panel {name}</p>
              <div x-floating:control>
                <button x-floating:close-trigger data-testid={`close-${name}`}>
                  {html(X)}
                </button>
              </div>
            </div>
          </div>
          <div x-floating:body>
            <p>Content {name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/floating-panel.ts"></script>
      </Head>

      <body>
        <div class="page">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="floating-panel">
            <div style={{ display: "flex", gap: "12px" }} x-data>
              <Panel name="A" offset={0} />
              <Panel name="B" offset={40} />
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
