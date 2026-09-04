import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

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
          {...{
            "x-menu.root": "{id: $id('menu-root')}",
            "x-menu.sub": "{id: $id('menu-sub')}",
            "x-menu.sub2": "{id: $id('menu-sub2')}",
          }}
          x-init="
            $menu('root').setChild($menu('sub').service);
            $menu('sub').setParent($menu('root').service);
            $menu('sub').setChild($menu('sub2').service);
            $menu('sub2').setParent($menu('sub').service);
          "
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main>
            <div>
              <button data-testid="trigger" {...{ "x-menu:trigger.root": "" }}>
                Click me
              </button>

              <template x-teleport="body">
                <div {...{ "x-menu:positioner.root": "" }}>
                  <ul data-testid="menu" {...{ "x-menu:content.root": "" }}>
                    <template x-for="item in $level1" x-bind:key="item.value">
                      <li
                        x-bind:data-testid="item.value"
                        x-data="{
                          get props() {
                            return item.trigger
                              ? $menu('root').getTriggerItemProps($menu('sub'))
                              : $menu('root').getItemProps({value: item.value})
                          },
                        }"
                        x-bind="Object.fromEntries(Object.keys(props).map((key) => 
                          key === 'x-html'
                            ? ['x-html', () => props['x-html']]
                            : key.startsWith('on')
                              ? ['@' + key.substring(2), (...args) => props[key](...args)]
                              : [':' + key, () => props[key]]
                        ))"
                        x-text="item.label"
                      />
                    </template>
                  </ul>
                </div>
              </template>

              <template x-teleport="body">
                <div {...{ "x-menu:positioner.sub": "" }}>
                  <ul data-testid="more-tools-submenu" {...{ "x-menu:content.sub": "" }}>
                    <template x-for="item in $level2" x-bind:key="item.value">
                      <li
                        x-bind:data-testid="item.value"
                        x-data="{
                          get props() {
                            return item.trigger
                              ? $menu('sub').getTriggerItemProps($menu('sub2'))
                              : $menu('sub').getItemProps({value: item.value})
                          },
                        }"
                        x-bind="Object.fromEntries(Object.keys(props).map((key) => 
                          key === 'x-html'
                            ? ['x-html', () => props['x-html']]
                            : key.startsWith('on')
                              ? ['@' + key.substring(2), (...args) => props[key](...args)]
                              : [':' + key, () => props[key]]
                        ))"
                        x-text="item.label"
                      />
                    </template>
                  </ul>
                </div>
              </template>

              <template x-teleport="body">
                <div {...{ "x-menu:positioner.sub2": "" }}>
                  <ul data-testid="open-nested-submenu" {...{ "x-menu:content.sub2": "" }}>
                    <template x-for="item in $level3" x-bind:key="item.value">
                      <li
                        x-bind:data-testid="item.value"
                        {...{ "x-menu:item.sub2": "{value: item.value}" }}
                        x-text="item.label"
                      />
                    </template>
                  </ul>
                </div>
              </template>
            </div>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="menu" modifier="root" />
            <StateVisualizer label="menu" modifier="sub" />
            <StateVisualizer label="menu" modifier="sub2" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
