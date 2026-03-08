import { defineHandler } from "nitro/h3"
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
            _x_menu_root.setChild(_x_menu_sub_service);
            _x_menu_sub.setParent(_x_menu_root_service);
            _x_menu_sub.setChild(_x_menu_sub2_service);
            _x_menu_sub2.setParent(_x_menu_sub_service);
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
                              ? _x_menu_root.getTriggerItemProps(_x_menu_sub)
                              : _x_menu_root.getItemProps({value: item.value})
                          },
                          get binding() {
                            return Object.keys(this.props).reduce((acc, prop) => {
                              const {key, value} =
                                prop === 'x-html'
                                  ? {key: 'x-html', value: () => this.props[prop]}
                                  : prop.startsWith('on')
                                    ? { key: '@' + prop.substring(2), value: (...args) => this.props[prop](...args) }
                                    : { key: ':' + prop, value: () => this.props[prop] };
                              acc[key] = value;
                              return acc;
                            }, {});
                          },
                        }"
                        x-bind="binding"
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
                              ? _x_menu_sub.getTriggerItemProps(_x_menu_sub2)
                              : _x_menu_sub.getItemProps({value: item.value})
                          },
                          get binding() {
                            return Object.keys(this.props).reduce((acc, prop) => {
                              const {key, value} =
                                prop === 'x-html'
                                  ? {key: 'x-html', value: () => this.props[prop]}
                                  : prop.startsWith('on')
                                    ? { key: '@' + prop.substring(2), value: (...args) => this.props[prop](...args) }
                                    : { key: ':' + prop, value: () => this.props[prop] };
                              acc[key] = value;
                              return acc;
                            }, {});
                          },
                        }"
                        x-bind="binding"
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
            <StateVisualizer label="menu-root" />
            <StateVisualizer label="menu-sub" />
            <StateVisualizer label="menu-sub2" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
