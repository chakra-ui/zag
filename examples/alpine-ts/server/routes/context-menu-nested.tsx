import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data
          {...{ "x-menu.root": "{id: 'root'}", "x-menu.sub": "{id: 'sub'}" }}
          x-init="$menu('root').setChild($data._x_menu_sub_service)
            $menu('sub').setParent($data._x_menu_root_service)"
        >
          <Nav pathname={event.url.pathname} />

          <main>
            <div {...{ "x-menu:context-trigger.root": "" }}>
              <div>Open context menu</div>
            </div>

            <template x-teleport="body">
              <div {...{ "x-menu:positioner.root": "" }}>
                <ul {...{ "x-menu:content.root": "" }}>
                  <li {...{ "x-menu:item.root": "{value: 'edit'}" }}>Edit</li>
                  <li {...{ "x-menu:item.root": "{value: 'delete'}" }}>Delete</li>
                  <li {...{ "x-menu:item.root": "{value: 'export'}" }}>Export</li>
                  <li x-bind="$menu('root').getTriggerItemProps($menu('sub'))">
                    <div>Appearance ➡️</div>
                  </li>
                  <li {...{ "x-menu:item.root": "{value: 'duplicate'}" }}>Duplicate</li>
                </ul>
              </div>
            </template>

            <template x-teleport="body">
              <div {...{ "x-menu:positioner.sub": "" }}>
                <ul {...{ "x-menu:content.sub": "" }}>
                  <li {...{ "x-menu:item.sub": "{value: 'full-screen'}" }}>Full screen</li>
                  <li {...{ "x-menu:item.sub": "{value: 'zoom-in'}" }}>Zoom in</li>
                  <li {...{ "x-menu:item.sub": "{value: 'zoom-out'}" }}>Zoom out</li>
                </ul>
              </div>
            </template>
          </main>
        </div>
      </body>
    </html>
  )
})
