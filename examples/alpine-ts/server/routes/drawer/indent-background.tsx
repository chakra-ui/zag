import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"
import styles from "../../../../shared/styles/drawer-indent.module.css"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/drawer.ts"></script>
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

          <main class={styles.main}>
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
              <h2 class={styles.heading}>Drawer Indent Background</h2>
              <p class={styles.description}>
                Open and drag the drawer. The background and app shell use stack snapshot props so styles stay
                coordinated.
              </p>
              <button x-drawer:trigger class={styles.button}>
                Open Drawer
              </button>
            </div>

            <Presence x-drawer:backdrop class={styles.backdrop} x-data="{get present() {return $drawer().open}}" />
            <div x-drawer:positioner class={styles.positioner}>
              <Presence x-drawer:content class={styles.content} x-data="{get present() {return $drawer().open}}">
                <div x-drawer:grabber class={styles.grabber}>
                  <div x-drawer:grabber-indicator class={styles.grabberIndicator} />
                </div>
                <div x-drawer:title class={styles.title}>
                  Drawer
                </div>
                <div class={styles.scrollable}>
                  {Array.from({ length: 30 }).map((_element, index) => (
                    <div>Item {index + 1}</div>
                  ))}
                </div>
              </Presence>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
