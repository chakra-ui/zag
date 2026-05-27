import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"
import styles from "../../../../shared/styles/drawer-indent-effect.module.css"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/drawer-indent.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="drawer"
          x-data:stack="{
            _isFirstRun: true,
            _snapshot: {},
            stack: $stack,
            get snapshot() {
              if (this._isFirstRun) {
                this._snapshot = this.stack.getSnapshot();
                this._isFirstRun = false;
              }
              return this._snapshot;
            },
            get stackApi() {
              return $connectStack(this.snapshot)
            },
          }"
          x-init="() => {stack.subscribe(() => {_snapshot = stack.getSnapshot()})}"
          x-drawer="{id: $id('drawer'), stack}"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class={styles.page}>
            <div class={styles.sandbox}>
              <div
                x-data="{get props() {return stackApi.getIndentBackgroundProps()}}"
                x-bind="Object.fromEntries(Object.keys(props)
                .map((key) => [':' + key, () => props[key]]))"
                class={styles.indentBackground}
                data-testid="drawer-indent-background"
              />

              <div
                x-data="{get props() {return stackApi.getIndentProps()}}"
                x-bind="Object.fromEntries(Object.keys(props)
                .map((key) => [':' + key, () => props[key]]))"
                class={styles.indent}
                data-testid="drawer-indent"
              >
                <div class={styles.center}>
                  <button x-drawer:trigger class={styles.trigger}>
                    Open Drawer
                  </button>
                </div>
              </div>

              <Presence
                x-drawer:backdrop
                class={styles.backdrop}
                data-testid="drawer-backdrop"
                x-data="{get present() {return $drawer().open}}"
              />
              <div x-drawer:positioner class={styles.positioner}>
                <Presence x-drawer:content class={styles.content} x-data="{get present() {return $drawer().open}}">
                  <div x-drawer:grabber class={styles.grabber}>
                    <div x-drawer:grabber-indicator class={styles.grabberIndicator} />
                  </div>
                  <div class={styles.contentInner}>
                    <h2 class={styles.title} x-drawer:title>
                      Notifications
                    </h2>
                    <p class={styles.description} x-drawer:description>
                      You are all caught up. Good job!
                    </p>
                    <div class={styles.actions}>
                      <button class={styles.close} x-drawer:close-trigger>
                        Close
                      </button>
                    </div>
                  </div>
                </Presence>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
